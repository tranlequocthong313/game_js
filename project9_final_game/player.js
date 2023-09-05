import CollisionAnimation from './collision_animation.js'
import FloatingMessage from './floating_message.js'
import { DivingState, FallingState, GetHitState, JumpingState, RollingState, RunningState, SittingState } from './state.js'

export default class Player {
    constructor(game, sprite) {
        this.game = game
        this.sprite = sprite

        this.width = this.sprite.width
        this.height = this.sprite.height

        this.x = 0
        this.y = this.game.canvas.height - this.height - this.game.groundMargin

        this.maxVelocityX = 10
        this.velocityX = 0
        this.maxVelocityY = 20
        this.velocityY = 0
        this.weight = 1

        this.frameX = 0
        this.frameY = 0
        this.maxFrames = 0
        this.fps = 30
        this.frameInterval = 1000 / this.fps
        this.frameTimer = 0

        this.states = [
            new SittingState(this),
            new RunningState(this),
            new JumpingState(this),
            new FallingState(this),
            new RollingState(this),
            new DivingState(this),
            new GetHitState(this)
        ]
        this.currentState = this.states[0]
        this.currentState.enter()
    }

    update(input, deltatime) {
        this.currentState.handleInput(input)

        if (this.frameTimer >= this.frameInterval) {
            this.frameX = (this.frameX + 1) % this.maxFrames
            this.frameTimer = 0
        } else {
            this.frameTimer += deltatime
        }

        if (this.currentState !== this.states[6]) {
            if (input.includes('ArrowRight')) {
                this.velocityX = this.maxVelocityX
            } else if (input.includes('ArrowLeft')) {
                this.velocityX = -this.maxVelocityX
            } else {
                this.velocityX = 0
            }
        }

        this.x += this.velocityX
        this.y += this.velocityY

        if (this.onGround()) {
            this.velocityY = 0
            this.y = this.game.canvas.height - this.height - this.game.groundMargin
        } else {
            this.velocityY += this.weight
        }

        if (this.x <= 0) {
            this.x = 0
        } else if (this.x >= this.game.canvas.width - this.width) {
            this.x = this.game.canvas.width - this.width
        }

        this.checkCollision()
    }

    draw(ctx) {
        if (this.game.debug) {
            ctx.strokeRect(this.x, this.y, this.width, this.height)
        }
        ctx.drawImage(this.sprite.src,
            this.frameX * this.sprite.width, this.frameY * this.sprite.height,
            this.sprite.width, this.sprite.height,
            this.x, this.y,
            this.width, this.height
        )
    }

    onGround() {
        return this.y >= this.game.canvas.height - this.height - this.game.groundMargin
    }

    setState(state, speed) {
        this.game.speed = this.game.maxSpeed * speed
        this.currentState = this.states[state]
        this.currentState.enter()
    }

    checkCollision() {
        this.game.enemies.forEach(enemy => {
            if (enemy.x + enemy.width > this.x &&
                enemy.y + enemy.height > this.y &&
                this.x + this.width > enemy.x &&
                this.y + this.height > enemy.y) {
                enemy.isActive = false
                this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, { src: this.game.collisionSprite, width: 100, height: 90, maxFrames: 4 }))
                if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
                    this.game.score++
                    this.game.floatingMessages.push(new FloatingMessage(enemy.x, enemy.y, '+1', { x: 20, y: 50 }))
                } else {
                    this.game.lives--
                    this.setState(6, 0)
                }
            }
        })
    }
}
