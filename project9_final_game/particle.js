class Particle {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.isActive = true
        this.minSize = 0.5
        this.disappearSpeed = 0.95
    }

    update() {
        this.x -= this.velocityX + this.player.game.speed
        this.y -= this.velocityY
        this.size *= this.disappearSpeed
        if (this.size <= this.minSize) {
            this.isActive = false
        }
    }
}

export class Dust extends Particle {
    constructor(player, color, alpha) {
        super(player.x + Math.random() * 2 - 1, player.y + Math.random() * 2 - 1)
        this.player = player
        this.velocityX = Math.random()
        this.velocityY = Math.random()
        this.color = color
        this.alpha = alpha
        this.size = this.player.width * 0.1 + Math.random() * 3
    }

    draw(ctx) {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x + this.player.width / 2, this.y + this.player.height - 10, this.size, 0, 2 * Math.PI)
        ctx.fill()
        ctx.restore()
    }
}

export class Fire extends Particle {
    constructor(player, sprite) {
        super(player.x + player.width / 2, player.y + player.height / 2)
        this.player = player
        this.sprite = sprite
        this.size = Math.random() * 100 + 50
        this.velocityX = 1
        this.velocityY = 1
        this.velocityAngle = Math.random() * 0.2 - 0.1
        this.angle = 0
        this.minSize = 10
    }

    update() {
        super.update()
        this.angle += this.velocityAngle
        this.x += Math.sin(this.angle * 5)
    }

    draw(ctx) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        ctx.drawImage(this.sprite, -this.size * 0.5, -this.size * 0.5, this.size, this.size)
        ctx.restore()
    }
}

export class Splash extends Particle {
    constructor(player, sprite) {
        super(player.x + player.width / 2, player.y + player.height / 2)
        this.player = player
        this.sprite = sprite
        this.size = Math.random() * 100 + 100
        this.velocityX = Math.random() * 6 - 3
        this.velocityY = Math.random() * 2 + 2
        this.weight = 0
    }

    update() {
        super.update()
        this.weight += 0.1
        this.y += this.weight
    }

    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y, this.size, this.size)
    }
}
