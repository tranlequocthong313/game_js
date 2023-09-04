'use strict'

const states = Object.freeze({
    STANDING_LEFT: 0,
    STANDING_RIGHT: 1,
    SITTING_LEFT: 2,
    SITTING_RIGHT: 3,
    RUNNING_LEFT: 4,
    RUNNING_RIGHT: 5,
    JUMPING_LEFT: 6,
    JUMPING_RIGHT: 7,
    FALLING_LEFT: 8,
    FALLING_RIGHT: 9,
    ROLLING_LEFT: 10,
    ROLLING_RIGHT: 11,
})

class State {
    constructor(state) {
        this.state = state
    }
}

class StandingLeft extends State {
    constructor(player) {
        super('STANDING LEFT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 1
        this.player.maxFrames = 7
        this.player.velocityX = 0
    }

    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.RUNNING_LEFT)
        } else if (input === 'PRESS right') {
            this.player.setState(states.RUNNING_RIGHT)
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_LEFT)
        } else if (input === 'PRESS up') {
            this.player.setState(states.JUMPING_LEFT)
        } else if (input === 'PRESS shift') {
            this.player.setState(states.ROLLING_LEFT)
        }
    }
}

class StandingRight extends State {
    constructor(player) {
        super('STANDING RIGHT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 0
        this.player.maxFrames = 7
        this.player.velocityX = 0
    }

    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.RUNNING_RIGHT)
        } else if (input === 'PRESS left') {
            this.player.setState(states.RUNNING_LEFT)
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_RIGHT)
        } else if (input === 'PRESS up') {
            this.player.setState(states.JUMPING_RIGHT)
        } else if (input === 'PRESS shift') {
            this.player.setState(states.ROLLING_RIGHT)
        }
    }
}

class SittingLeft extends State {
    constructor(player) {
        super('SITTING LEFT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 9
        this.player.maxFrames = 5
        this.player.velocityX = 0
    }

    handleInput(input) {
        if (input === 'RELEASE down') {
            this.player.setState(states.STANDING_LEFT)
        } else if (input === 'PRESS right') {
            this.player.setState(states.SITTING_RIGHT)
        }
    }
}

class SittingRight extends State {
    constructor(player) {
        super('SITTING RIGHT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 8
        this.player.maxFrames = 5
        this.player.velocityX = 0
    }

    handleInput(input) {
        if (input === 'RELEASE down') {
            this.player.setState(states.STANDING_RIGHT)
        } else if (input === 'PRESS left') {
            this.player.setState(states.SITTING_LEFT)
        }
    }
}

class RunningLeft extends State {
    constructor(player) {
        super('RUNNING LEFT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 7
        this.player.maxFrames = 9
        this.player.velocityX = -this.player.maxVelocityX
    }

    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.RUNNING_RIGHT)
        } else if (input === 'RELEASE left') {
            this.player.setState(states.STANDING_LEFT)
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_LEFT)
        } else if (input === 'PRESS shift') {
            this.player.setState(states.ROLLING_LEFT)
        }
    }
}

class RunningRight extends State {
    constructor(player) {
        super('RUNNING RIGHT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 6
        this.player.maxFrames = 9
        this.player.velocityX = this.player.maxVelocityX
    }

    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.RUNNING_LEFT)
        } else if (input === 'RELEASE right') {
            this.player.setState(states.STANDING_RIGHT)
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_RIGHT)
        } else if (input === 'PRESS shift') {
            this.player.setState(states.ROLLING_RIGHT)
        }
    }
}

class JumpingLeft extends State {
    constructor(player) {
        super('JUMPING LEFT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 3
        this.player.maxFrames = 7
        this.player.velocityX = -this.player.maxVelocityX * 0.5
        if (this.player.onGround()) {
            this.player.velocityY = -this.player.maxVelocityY
        }
    }

    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.JUMPING_RIGHT)
        } else if (this.player.onGround()) {
            this.player.setState(states.STANDING_LEFT)
        }
        else if (this.player.velocityY > 0) {
            this.player.setState(states.FALLING_LEFT)
        }
    }
}

class JumpingRight extends State {
    constructor(player) {
        super('JUMPING RIGHT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 2
        this.player.maxFrames = 7
        this.player.velocityX = this.player.maxVelocityX * 0.5
        if (this.player.onGround()) {
            this.player.velocityY = -this.player.maxVelocityY
        }
    }

    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.JUMPING_LEFT)
        } else if (this.player.onGround()) {
            this.player.setState(states.STANDING_RIGHT)
        }
        else if (this.player.velocityY > 0) {
            this.player.setState(states.FALLING_RIGHT)
        }
    }
}

class FallingLeft extends State {
    constructor(player) {
        super('FALLING LEFT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 5
        this.player.maxFrames = 7
    }

    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.FALLING_RIGHT)
        } else if (this.player.onGround()) {
            this.player.setState(states.STANDING_LEFT)
        }
    }
}

class FallingRight extends State {
    constructor(player) {
        super('FALLING RIGHT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 4
        this.player.maxFrames = 7
    }

    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.FALLING_LEFT)
        } else if (this.player.onGround()) {
            this.player.setState(states.STANDING_RIGHT)
        }
    }
}

class RollingLeft extends State {
    constructor(player) {
        super('ROLLING LEFT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 11
        this.player.maxFrames = 7
        this.player.velocityX = -this.player.maxVelocityX * 2
    }

    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.ROLLING_RIGHT)
        } else if (input === 'RELEASE shift') {
            this.player.setState(states.STANDING_LEFT)
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_LEFT)
        }
    }
}

class RollingRight extends State {
    constructor(player) {
        super('ROLLING RIGHT')
        this.player = player
    }

    enter() {
        this.player.frameX = 0
        this.player.frameY = 11
        this.player.maxFrames = 7
        this.player.velocityX = this.player.maxVelocityX * 2
    }

    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.ROLLING_LEFT)
        } else if (input === 'RELEASE shift') {
            this.player.setState(states.STANDING_RIGHT)
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_RIGHT)
        }
    }
}

export {
    StandingLeft,
    StandingRight,
    SittingRight,
    SittingLeft,
    RunningLeft,
    RunningRight,
    JumpingLeft,
    JumpingRight,
    FallingLeft,
    FallingRight,
    RollingLeft,
    RollingRight
}
