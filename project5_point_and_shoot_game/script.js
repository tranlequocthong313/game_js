const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const log = console.log

const canvas = $('#canvas1')
const artist = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const collisionCanvas = $('#collision-canvas')
const artist2 = collisionCanvas.getContext('2d')

collisionCanvas.width = window.innerWidth
collisionCanvas.height = window.innerHeight

document.body.style.cursor = `url('crosshair.png'), auto`

const img = new Image
img.src = 'raven.png'

const sound = new Audio
sound.src = 'synthetic_explosion_1.flac'

const ravenSpecs = Object.freeze({
    sprite: {
        src: img,
        width: 271,
        height: 194,
        frames: 6
    },
})

let gameOver = false

class Particle {
    constructor(x, y, size, color = 'black') {
        this.x = x + size / 2 + Math.random() * 50 - 25
        this.y = y + size / 3
        this.radius = Math.random() * size / 10
        this.maxRadius = Math.random() * 20 + 35
        this.isActive = true
        this.speedX = Math.random() * 1 + 0.5
        this.color = color
    }

    update() {
        this.x += this.speedX
        this.radius += 0.5
        if (this.radius > this.maxRadius - 5) {
            this.isActive = false
        }
    }

    draw() {
        artist.save()
        artist.globalAlpha = 1 - this.radius / this.maxRadius
        artist.beginPath()
        artist.fillStyle = this.color
        artist.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        artist.fill()
        artist.restore()
    }
}

let particles = []

class Raven {
    constructor(specs, isActive = false) {
        this.specs = specs
        this.sizeModifier = Math.random() * 0.6 + 0.4
        this.width = this.specs.sprite.width * this.sizeModifier
        this.height = this.specs.sprite.height * this.sizeModifier
        this.x = canvas.width
        this.y = Math.random() * (canvas.height - this.height)
        this.directionX = Math.random() * 5 + 3
        this.directionY = Math.random() * 5 - 2.5
        this.isActive = isActive
        this.frame = 0
        this.timeSinceFlap = 0
        this.flapInterval = Math.random() * 50 + 50
        this.rgbColor = [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
        ]
        this.hasTrail = Math.random() < 0.4
    }

    randomPosition() {
        this.x = canvas.width
        this.y = Math.random() * (canvas.height - this.height)
    }

    update(deltatime) {
        if (this.x < -this.width) {
            this.isActive = false
            this.frame = 0
            this.frameCounter = 0

            gameOver = true
            return
        }
        this.timeSinceFlap += deltatime
        if (this.timeSinceFlap >= this.flapInterval) {
            this.frame = (this.frame + 1) % this.specs.sprite.frames
            this.timeSinceFlap = 0
            if (this.hasTrail) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width))
                }
            }
        }
        this.x -= this.directionX
        this.y += this.directionY
        if (this.y <= 0 || this.y + this.height >= canvas.height) {
            this.directionY *= -1
        }
    }

    draw() {
        artist2.fillStyle = `rgb(${this.rgbColor[0]}, ${this.rgbColor[1]}, ${this.rgbColor[2]})`
        artist2.fillRect(this.x, this.y, this.width, this.height)
        artist.drawImage(this.specs.sprite.src,
            this.frame * this.specs.sprite.width, 0,
            this.specs.sprite.width, this.specs.sprite.height,
            this.x, this.y,
            this.width, this.height
        )
    }
}

const ravenPoolSize = 20
const ravenPool = []
for (let i = 0; i < ravenPoolSize; i++) {
    ravenPool.push(new Raven(ravenSpecs, false))
}

ravenPool.sort(function (raven1, raven2) {
    return (raven1.width + raven1.height) - (raven2.width + raven2.height)
})

let timeToNextRaven = 0
let ravenInterval = 500
let lastTime = 0

let score = 0

function drawScore() {
    artist.fillStyle = 'black'
    artist.fillText(`Score: ${score}`, 50, 75)
    artist.fillStyle = 'white'
    artist.fillText(`Score: ${score}`, 55, 80)
}

const canvasRect = canvas.getBoundingClientRect()

const imgEffect = new Image
imgEffect.src = 'boom.png'
const spriteEffect = {
    src: imgEffect,
    frames: 5,
    width: 200,
    height: 179
}

const boomSpecs = Object.freeze({
    sprite: spriteEffect,
    width: spriteEffect.width * 0.7,
    height: spriteEffect.height * 0.7,
    duration: 5
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
        if (!this.isActive) {
            return
        }
        artist.drawImage(this.specs.sprite.src,
            this.frame * this.specs.sprite.width, 0,
            this.specs.sprite.width, this.specs.sprite.height,
            this.x, this.y,
            this.specs.width, this.specs.height
        )
    }
}

const poolSize = 10
const explosions = []
for (let i = 0; i < poolSize; i++) {
    explosions.push(new Explosions(0, 0, boomSpecs))
}

function createExplosionEffect(e) {
    const positionX = e.x - canvasRect.left
    const positionY = e.y - canvasRect.top
    for (let explosion of explosions) {
        if (explosion.isActive === false) {
            explosion.setPosition(positionX, positionY)
            explosion.isActive = true
            return
        }
    }
    explosions.push(new Explosions(positionX, positionY, spriteEffect, soundEffect, true))
}

let shootInterval = 100
let sinceLastShot = shootInterval

window.addEventListener('click', shoot)

function shoot(e) {
    if (gameOver) {
        return
    }
    if (sinceLastShot >= shootInterval) {
        sinceLastShot = 0
        sound.load()
        sound.play()
        createExplosionEffect(e)
        const detectPixelColor = artist2.getImageData(e.x, e.y, 1, 1).data
        ravenPool.forEach(raven => {
            if (
                raven.rgbColor[0] === detectPixelColor[0] &&
                raven.rgbColor[1] === detectPixelColor[1] &&
                raven.rgbColor[2] === detectPixelColor[2]
            ) {
                score = raven.hasTrail ? score + 2 : score + 1
                raven.isActive = false
                return
            }
        })
    }
}

window.addEventListener('resize', function (e) {
    canvas.width = e.target.innerWidth
    canvas.height = e.target.innerHeight
})

artist.font = "50px Impact"

function drawGameOver() {
    artist.textAlign = 'center'
    artist.fillStyle = 'black'
    artist.fillText(`Game over! Your score is ${score}.`, canvas.width / 2, canvas.height / 2)
    artist.fillStyle = 'white'
    artist.fillText(`Game over! Your score is ${score}.`, canvas.width / 2 + 5, canvas.height / 2 + 5)
}

const BACKGROUND_WIDTH = 2400
const BACKGROUND_HEIGHT = 720

let gameSpeed = 10

class Layer {
    constructor(image, speedModifier) {
        this.x = 0
        this.y = 0
        this.width = BACKGROUND_WIDTH
        this.height = BACKGROUND_HEIGHT
        this.image = image
        this.speedModifier = speedModifier
        this.speed = gameSpeed * this.speedModifier
    }

    update() {
        this.speed = gameSpeed * this.speedModifier
        this.x = Math.floor(this.x - this.speed) % this.width
    }

    draw() {
        artist.drawImage(this.image, this.x, this.y, this.width, this.height, 0, 0, canvas.width, canvas.height)
        artist.drawImage(this.image, this.x + this.width, this.y, this.width, this.height, 0, 0, canvas.width, canvas.height)
    }
}

const backgrounds = []
for (let i = 1; i <= 5; i++) {
    const img = new Image()
    img.src = `layer-${i}.png`
    backgrounds.push(img)
}
const layer1 = new Layer(backgrounds[0], .2)
const layer2 = new Layer(backgrounds[1], .4)
const layer3 = new Layer(backgrounds[2], .6)
const layer4 = new Layer(backgrounds[3], .8)
const layer5 = new Layer(backgrounds[4], 1)

const layers = [layer1, layer2, layer3, layer4, layer5]

function animate(timestamp) {
    if (gameOver) {
        drawGameOver()
        return
    }

    artist.clearRect(0, 0, canvas.width, canvas.height)
    artist2.clearRect(0, 0, canvas.width, canvas.height)

    if (timestamp) {
        let deltatime = timestamp - lastTime
        lastTime = timestamp
        timeToNextRaven += deltatime
        sinceLastShot += deltatime
        if (timeToNextRaven >= ravenInterval) {
            timeToNextRaven = 0
            let found = false
            for (let raven of ravenPool) {
                if (!raven.isActive) {
                    raven.randomPosition()
                    raven.isActive = true
                    found = true
                    break
                }
            }
            if (!found) {
                log("Create new Raven")
                createNewRaven()
            }
        }

        layers.forEach(obj => {
            obj.update()
            obj.draw()
        })

        drawScore()

        particles.forEach(particle => {
            if (particle.isActive) {
                particle.update()
                particle.draw()
            }
        })

        ravenPool.forEach(raven => {
            if (raven.isActive) {
                raven.update(deltatime)
                raven.draw()
            }
        })

        explosions.forEach(explosion => {
            if (explosion.isActive) {
                explosion.update()
                explosion.draw()
            }
        })

        particles = particles.filter(particle => particle.isActive)
    }

    requestAnimationFrame(animate)
}

animate(0)

function createNewRaven() {
    const raven = new Raven(ravenSpecs, true)
    for (let i = 0; i < ravenPool.length; i++) {
        if ((ravenPool[i].width + ravenPool[i].height) >= (raven.width + raven.height)) {
            ravenPool.splice(i, 0, raven)
            break
        }
    }
}
