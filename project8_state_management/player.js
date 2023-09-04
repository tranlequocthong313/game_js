'use strict'

import { FallingLeft, FallingRight, JumpingLeft, JumpingRight, RollingLeft, RollingRight, RunningLeft, RunningRight, SittingLeft, SittingRight, StandingLeft, StandingRight } from './state.js'

class Player {
    constructor(canvas, sprite) {
        this.canvas = canvas

        this.sprite = sprite
        this.width = this.sprite.width
        this.height = this.sprite.height

        this.x = this.canvas.width * 0.5 - this.width * 0.5
        this.y = this.canvas.height - this.height

        this.states = [
            new StandingLeft(this),
            new StandingRight(this),
            new SittingLeft(this),
            new SittingRight(this),
            new RunningLeft(this),
            new RunningRight(this),
            new JumpingLeft(this),
            new JumpingRight(this),
            new FallingLeft(this),
            new FallingRight(this),
            new RollingLeft(this),
            new RollingRight(this),
        ]
        this.currentState = this.states[1]

        this.frameX = 0
        this.frameY = 0
        this.sinceLastFrame = 0
        this.maxFrames = 0
        this.fps = 30
        this.frameInterval = 1000 / this.fps // 1000ms / fps = ms deltatime

        this.maxVelocityX = 0.2
        this.velocityX = 0
        this.maxVelocityY = 30
        this.velocityY = 0
        this.weight = 1

        this.currentState.enter()
    }

    update(input, deltaTime) {
        this.currentState.handleInput(input)

        this.x += this.velocityX * deltaTime
        if (this.x <= 0) {
            this.x = 0
        } else if (this.x >= this.canvas.width - this.width) {
            this.x = this.canvas.width - this.width
        }

        this.y += this.velocityY
        if (this.onGround()) {
            this.velocityY = 0
            this.y = this.canvas.height - this.height
        } else {
            this.velocityY += this.weight
        }

        if (this.sinceLastFrame >= this.frameInterval) {
            this.frameX = (this.frameX + 1) % this.maxFrames
            this.sinceLastFrame = 0
        } else {
            this.sinceLastFrame += deltaTime
        }
    }

    draw(ctx) {
        ctx.drawImage(this.sprite.src,
            this.frameX * this.sprite.width, this.frameY * this.sprite.height,
            this.sprite.width, this.sprite.height,
            this.x, this.y,
            this.width, this.height
        )
    }

    setState(state) {
        this.currentState = this.states[state]
        this.currentState.enter()
    }

    onGround() {
        return this.y >= this.canvas.height - this.height
    }
}

export default Player
