const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const canvas = $('#canvas1')
const artist = canvas.getContext('2d')

const CANVAS_WIDTH = canvas.width = 500
const CANVAS_HEIGHT = canvas.height = 700

const numberOfEnemies = 10

let gameFrames = 0

class Enemy {
    constructor({ sprite, animation = shakingAnimation, animationRange }) {
        this.sprite = sprite
        this.width = this.sprite.width / 2
        this.height = this.sprite.height / 2
        this.x = Math.random() * (CANVAS_WIDTH - this.width)
        this.y = Math.random() * (CANVAS_HEIGHT - this.height)
        this.frame = 0
        this.flapSpeed = Math.floor(Math.random() * 4 + 1)
        this.animation = animation
        this.angle = Math.random() * 2
        this.angleSpeed = Math.random() * 0.2
        this.animationRange = Math.random() * animationRange
        this.animationInterval = Math.floor(Math.random() * 200 + 50)
        this.newX = Math.random() * (CANVAS_WIDTH - this.width)
        this.newY = Math.random() * (CANVAS_HEIGHT - this.height)
    }

    update() {
        this.frame = Math.floor(gameFrames / this.flapSpeed) % this.sprite.frames
        this.animation(this)
    }

    draw() {
        artist.drawImage(this.sprite.src,
            this.sprite.width * this.frame, 0,
            this.sprite.width, this.sprite.height,
            this.x, this.y,
            this.width, this.height
        )
    }
}

function shakingAnimation(enemy) {
    enemy.x += Math.random() * enemy.animationRange - (enemy.animationRange / 2)
    enemy.y += Math.random() * enemy.animationRange - (enemy.animationRange / 2)
}

function horizontalSinWaveAnimation(enemy) {
    enemy.x = enemy.x < -enemy.width ? CANVAS_WIDTH + enemy.width : enemy.x - 1
    enemy.angle += enemy.angleSpeed
    enemy.y += enemy.animationRange * Math.sin(enemy.angle)
}

function verticalSinWaveAnimation(enemy) {
    enemy.angle += enemy.angleSpeed
    enemy.x = Math.max(200, enemy.animationRange) * Math.sin(enemy.angle) + (this.width) + (CANVAS_WIDTH / 6)
    enemy.y = enemy.y < -enemy.height ? CANVAS_HEIGHT + enemy.height : enemy.y - 3
}

function randomSlideAnimation(enemy) {
    if (gameFrames % enemy.animationInterval === 0) {
        enemy.newX = Math.random() * (CANVAS_WIDTH - enemy.width)
        enemy.newY = Math.random() * (CANVAS_HEIGHT - enemy.height)
    }
    enemy.x -= (enemy.x - enemy.newX) / 70
    enemy.y -= (enemy.y - enemy.newY) / 70
}

const spriteProperties = [
    {
        src: 'enemy1.png',
        width: 293,
        height: 155,
        frames: 6
    },
    {
        src: 'enemy2.png',
        width: 266,
        height: 188,
        frames: 6
    },
    {
        src: 'enemy3.png',
        width: 218,
        height: 177,
        frames: 6
    },
    {
        src: 'enemy4.png',
        width: 213,
        height: 212,
        frames: 9
    },
]
const enemySpirtes = []
spriteProperties.forEach(({ src, frames, width, height }) => {
    const img = new Image()
    img.src = src
    enemySpirtes.push({
        src: img,
        width,
        height,
        frames
    })
})

const enemyProperties = [
    {
        sprite: enemySpirtes[0],
        animation: shakingAnimation,
        animationRange: 7
    },
    {
        sprite: enemySpirtes[1],
        animation: horizontalSinWaveAnimation,
        animationRange: 7
    },
    {
        sprite: enemySpirtes[2],
        animation: verticalSinWaveAnimation,
        animationRange: 200
    },
    {
        sprite: enemySpirtes[3],
        animation: randomSlideAnimation,
        animationRange: 7
    },
]

const enemies = []
for (let i = 0; i < numberOfEnemies; i++) {
    enemies.push(new Enemy(enemyProperties[i % enemyProperties.length]))
}

function animate() {
    artist.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    enemies.forEach(enemy => {
        enemy.update()
        enemy.draw()
    })

    gameFrames++

    requestAnimationFrame(animate)
}

animate()
