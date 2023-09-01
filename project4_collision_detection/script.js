const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const canvas = $('#canvas1')
const artist = canvas.getContext('2d')

const CANVAS_WIDTH = canvas.width = 500
const CANVAS_HEIGHT = canvas.height = 700
const canvasRect = canvas.getBoundingClientRect()

let gameFrame = 0

const img = new Image
img.src = 'boom.png'
const spriteEffect = {
    src: img,
    frames: 5,
    width: 200,
    height: 179
}

const soundEffect = new Audio
soundEffect.src = 'synthetic_explosion_1.flac'

const boomSpecs = Object.freeze({
    sprite: spriteEffect,
    sound: soundEffect,
    width: spriteEffect.width * 0.7,
    height: spriteEffect.height * 0.7,
    duration: 10
})

class Explosions {
    constructor(x, y, specs, isActive = false) {
        this.specs = specs
        this.x = x - this.specs.width / 2
        this.y = y - this.specs.height / 2
        this.frame = 0
        this.frameCounter = 0
        this.isActive = isActive
    }

    setPosition(x, y) {
        this.x = x - this.specs.width / 2
        this.y = y - this.specs.height / 2
    }

    update() {
        if (this.frame === 0) {
            this.specs.sound.load()
            this.specs.sound.play()
        }
        if (this.frame >= this.specs.sprite.frames) {
            this.isActive = false
            this.frame = 0
            this.frameCounter = 0
            return
        }
        this.frame = Math.floor(this.frameCounter / this.specs.duration)
        this.frameCounter++
    }

    draw() {
        artist.drawImage(this.specs.sprite.src,
            this.frame * this.specs.sprite.width, 0,
            this.specs.sprite.width, this.specs.sprite.height,
            this.x, this.y,
            this.specs.width, this.specs.height
        )
    }
}

const poolSize = 5
const explosions = []
for (let i = 0; i < poolSize; i++) {
    explosions.push(new Explosions(0, 0, boomSpecs))
}

function animate() {
    artist.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    explosions.forEach(explosion => {
        if (explosion.isActive) {
            explosion.update()
            explosion.draw()
        }
    })

    gameFrame++
    requestAnimationFrame(animate)
}

animate()

window.addEventListener('click', function (e) {
    createAnimation(e)
})

function createAnimation(e) {
    const positionX = e.x - canvasRect.left
    const positionY = e.y - canvasRect.top
    for (let explosion of explosions) {
        if (explosion.isActive === false) {
            explosion.setPosition(positionX, positionY)
            explosion.isActive = true
            locked = false
            return
        }
    }
    explosions.push(new Explosions(positionX, positionY, spriteEffect, soundEffect, true))
    locked = false
}

