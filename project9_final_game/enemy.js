class Enemy {
    constructor() {
        this.frameX = 0
        this.frameY = 0
        this.fps = 20
        this.frameInterval = 1000 / this.fps
        this.frameTimer = 0
        this.isActive = true
    }

    update(deltatime) {
        this.x -= this.velocityX + this.game.speed

        if (this.x <= this.game.width - this.width) {
            this.isActive = false
        }

        if (this.frameTimer >= this.frameInterval) {
            this.frameX = (this.frameX + 1) % this.props.sprite.maxFrames
            this.frameTimer = 0
        } else {
            this.frameTimer += deltatime
        }
    }

    draw(ctx) {
        if (this.game.debug) {
            ctx.strokeRect(this.x, this.y, this.width, this.height)
        }
        ctx.drawImage(this.props.sprite.src,
            this.frameX * this.props.sprite.width, 0,
            this.props.sprite.width, this.props.sprite.height,
            this.x, this.y,
            this.width, this.height
        )
    }
}

export class FlyingEnemy extends Enemy {
    constructor(game, props) {
        super()
        this.props = props
        this.width = this.props.sprite.width
        this.height = this.props.sprite.height
        this.game = game
        this.x = this.game.canvas.width
        this.y = Math.random() * this.game.canvas.height * 0.5
        this.velocityX = Math.random() * 2 + 1
        this.velocityY = Math.random() * 0.1 + 0.1
        this.curve = Math.random() + 1
        this.angle = 0
    }

    update(deltaTime) {
        super.update(deltaTime)
        this.angle += this.velocityY
        this.y += this.curve * Math.sin(this.angle)
    }
}

export class GroundEnemy extends Enemy {
    constructor(game, props) {
        super()
        this.props = props
        this.width = this.props.sprite.width
        this.height = this.props.sprite.height
        this.game = game
        this.x = this.game.canvas.width
        this.y = this.game.canvas.height - this.height - this.game.groundMargin
        this.velocityX = 0
    }

    update(deltaTime) {
        super.update(deltaTime)
    }
}

export class ClimbingEnemy extends Enemy {
    constructor(game, props) {
        super()
        this.props = props
        this.width = this.props.sprite.width
        this.height = this.props.sprite.height
        this.game = game
        this.x = Math.random() * (this.game.canvas.width - this.width) + this.game.canvas.width / 2
        this.y = -this.height
        this.velocityX = 0
        this.velocityY = Math.random() * 3 + 2
        this.webLength = Math.random() * (((this.game.canvas.height - this.game.groundMargin) / 2) - this.height) + ((this.game.canvas.height - this.game.groundMargin) / 2)
    }

    update(deltaTime) {
        super.update(deltaTime)
        if (this.y >= this.webLength) {
            this.velocityY = -this.velocityY
        }
        this.y += this.velocityY

        if (this.y < -this.height) {
            this.isActive = false
        }
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.moveTo(this.x + this.width / 2, 0)
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2)
        ctx.stroke()
        super.draw(ctx)
    }
}
