export default class FloatingMessage {
    constructor(x, y, message, target) {
        this.x = x
        this.y = y
        this.message = message
        this.isActive = true
        this.target = target
        this.message = message
        this.timer = 0
        this.aliveTime = 1500
    }

    update(deltaTime) {
        this.x += (this.target.x - this.x) * 0.03
        this.y += (this.target.y - this.y) * 0.03
        if (this.timer >= this.aliveTime) {
            this.isActive = false
        } else {
            this.timer += deltaTime
        }
    }

    draw(ctx) {
        ctx.save()
        ctx.font = `20px Helvetica`
        ctx.fillStyle = 'black'
        ctx.fillText(this.message, this.x, this.y)
        ctx.fillStyle = 'white'
        ctx.fillText(this.message, this.x + 2, this.y + 2)
        ctx.restore()
    }
}
