export default class CollisionAnimation {
    constructor(game, x, y, sprite) {
        this.game = game
        this.sprite = sprite
        this.sizeModifier = Math.random() + 0.5
        this.width = this.sprite.width * this.sizeModifier
        this.height = this.sprite.height * this.sizeModifier
        this.x = x - this.width * 0.5
        this.y = y - this.height * 0.5
        this.frame = 0
        this.isActive = true
        this.framTimer = 0
        this.fps = Math.random() * 10 + 5
        this.frameInterval = 1000 / this.fps
    }

    update(deltaTime) {
        if (this.frame >= this.sprite.maxFrames - 1) {
            this.isActive = false
        }
        if (this.framTimer >= this.frameInterval) {
            this.frame = (this.frame + 1) % this.sprite.maxFrames
        } else {
            this.framTimer += deltaTime
        }
        this.x -= this.game.speed
    }

    draw(ctx) {
        ctx.drawImage(this.sprite.src,
            this.frame * this.sprite.width, 0,
            this.sprite.width, this.sprite.height,
            this.x, this.y,
            this.width, this.height
        )
    }
}
