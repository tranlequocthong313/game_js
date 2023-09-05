export default class UI {
    constructor(game, livesSprite) {
        this.game = game
        this.fontSize = 30
        this.fontFamily = 'Helvetica'
        this.livesSprite = livesSprite
    }

    draw(ctx) {
        ctx.save()
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        ctx.shadowColor = 'white'
        ctx.shadowBlur = 0

        ctx.font = `${this.fontSize}px ${this.fontFamily}`
        ctx.textAlign = 'left'
        ctx.fillStyle = this.game.fontColor

        // score 
        ctx.fillText(`Score: ${this.game.score}`, 20, 50)

        // timer 
        ctx.font = `${this.fontSize * 0.8}px ${this.fontFamily}`
        ctx.fillText(`Time: ${(this.game.time * 0.001).toFixed(1)}`, 20, 80)

        for (let i = 0; i < this.game.lives; i++) {
            ctx.drawImage(this.livesSprite, 20 * i + 20, 95, 25, 25)
        }

        // game over
        if (this.game.gameOver) {
            ctx.textAlign = 'center'
            if (this.game.score > this.game.winningScore) {
                ctx.font = `${this.fontSize * 2}px ${this.fontFamily}`
                ctx.fillText(`Boo-yah`, this.game.canvas.width * 0.5, this.game.canvas.height * 0.5 - 20)
                ctx.font = `${this.fontSize * 0.7}px ${this.fontFamily}`
                ctx.fillText(`What are creatures of the night afraid of? YOU!!!`, this.game.canvas.width * 0.5, this.game.canvas.height * 0.5 + 20)
            } else {
                ctx.font = `${this.fontSize * 2}px ${this.fontFamily}`
                ctx.fillText(`Love at first bite?`, this.game.canvas.width * 0.5, this.game.canvas.height * 0.5 - 20)
                ctx.font = `${this.fontSize * 0.7}px ${this.fontFamily}`
                ctx.fillText(`Nope. Better luck next time!`, this.game.canvas.width * 0.5, this.game.canvas.height * 0.5 + 20)
            }
        }
        ctx.restore()
    }
}
