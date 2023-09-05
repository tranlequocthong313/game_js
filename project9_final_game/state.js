import { Dust, Fire, Splash } from './particle.js'

const states = {
    SITITNG: 0,
    RUNNING: 1,
    JUMPING: 2,
    FALLING: 3,
    ROLLING: 4,
    DIVING: 5,
    GET_HIT: 6,
}

class State {
    constructor(state) {
        this.state = state
    }
}

export class SittingState extends State {
    constructor(player) {
        super('SITTING')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 5
        this.player.maxFrames = 5
    }

    handleInput(input) {
        if (input.includes('ArrowRight') || input.includes('ArrowLeft')) {
            this.player.setState(states.RUNNING, 1)
        } else if (input.includes('ArrowUp')) {
            this.player.setState(states.JUMPING, 1)
        } else if (input.includes('Enter')) {
            this.player.setState(states.ROLLING, 2)
        }
    }
}

export class RunningState extends State {
    constructor(player) {
        super('RUNNING')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 3
        this.player.maxFrames = 9
    }

    handleInput(input) {
        this.player.game.particles.push(new Dust(this.player, 'black', 0.3))
        if (input.includes('ArrowDown')) {
            this.player.setState(states.SITITNG, 0)
        } else if (input.includes('ArrowUp')) {
            this.player.setState(states.JUMPING, 1)
        } else if (input.includes('Enter')) {
            this.player.setState(states.ROLLING, 2)
        }
    }
}

export class JumpingState extends State {
    constructor(player) {
        super('JUMPING')
        this.player = player
    }

    enter() {
        if (this.player.onGround()) {
            this.player.velocityY = -this.player.maxVelocityY
        }
        this.player.frameX = 0
        this.player.frameY = 1
        this.player.maxFrames = 7
    }

    handleInput(input) {
        if (this.player.velocityY > this.player.weight) {
            this.player.setState(states.FALLING, 1)
        } else if (input.includes('Enter')) {
            this.player.setState(states.ROLLING, 2)
        } else if (input.includes('ArrowDown')) {
            this.player.setState(states.DIVING, 0)
        }
    }
}

export class FallingState extends State {
    constructor(player) {
        super('FALLING')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 2
        this.player.maxFrames = 7
    }

    handleInput(input) {
        if (this.player.onGround()) {
            this.player.setState(states.RUNNING, 1)
        } else if (input.includes('ArrowDown')) {
            this.player.setState(states.DIVING, 0)
        }
    }
}

export class RollingState extends State {
    constructor(player) {
        super('ROLLING')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 6
        this.player.maxFrames = 7
    }

    handleInput(input) {
        this.player.game.particles.push(new Fire(this.player, this.player.game.fireSprite))
        if (!input.includes('Enter') && this.player.onGround()) {
            this.player.setState(states.RUNNING, 1)
        } else if (!input.includes('Enter') && !this.player.onGround()) {
            this.player.setState(states.FALLING, 1)
        } else if (input.includes('Enter') && input.includes('ArrowUp') && this.player.onGround()) {
            this.player.velocityY = -this.player.maxVelocityY
        } else if (input.includes('ArrowDown') && !this.player.onGround()) {
            this.player.setState(states.DIVING, 0)
        }
    }
}

export class DivingState extends State {
    constructor(player) {
        super('DIVING')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 6
        this.player.maxFrames = 6
        this.player.velocityY = this.player.maxVelocityY
    }

    handleInput(input) {
        this.player.game.particles.push(new Fire(this.player, this.player.game.fireSprite))
        if (input.includes('Enter') && this.player.onGround()) {
            this.player.setState(states.ROLLING, 2)
        } else if (this.player.onGround()) {
            this.player.setState(states.RUNNING, 1)
            for (let i = 0; i < 30; i++) {
                this.player.game.particles.push(new Splash(this.player, this.player.game.fireSprite))
            }
        }
    }
}

export class GetHitState extends State {
    constructor(player) {
        super('GET HIT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 4
        this.player.maxFrames = 10
        this.player.velocityX = 0
    }

    handleInput(input) {
        if (this.player.frameX >= this.player.maxFrames - 1) {
            if (this.player.onGround()) {
                this.player.setState(states.RUNNING, 1)
            } else {
                this.player.setState(states.FALLING, 0)
            }
        }
    }
}
