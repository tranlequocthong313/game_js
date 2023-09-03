window.addEventListener('load', function () {
    const $ = document.querySelector.bind(document)

    const canvas = $('#canvas1')
    const artist = canvas.getContext('2d')

    canvas.width = 500
    canvas.height = 700

    Array.prototype.back = function () {
        return this[this.length - 1]
    }

    class EnemyProperty {
        constructor(name, sprite) {
            this.name = name
            this.sprite = sprite
        }
    }

    const wormImg = new Image
    wormImg.src = 'enemy_worm.png'
    const ghostImg = new Image
    ghostImg.src = 'enemy_ghost.png'
    const spiderImg = new Image
    spiderImg.src = 'enemy_spider.png'

    const ghostProp = Object.freeze(new EnemyProperty('Ghost', { src: ghostImg, width: 261, height: 209, frames: 6 }))
    const spiderProp = Object.freeze(new EnemyProperty('Spider', { src: spiderImg, width: 310, height: 175, frames: 6 }))
    const wormProp = Object.freeze(new EnemyProperty('Worm', { src: wormImg, width: 229, height: 171, frames: 6 }))

    class Game {
        constructor(artist, width, height) {
            // Canvas
            this.artist = artist
            this.width = width
            this.height = height

            // Enemy
            this.enemyTypes = [
                { EnemyClass: Worm, props: wormProp },
                { EnemyClass: Ghost, props: ghostProp },
                { EnemyClass: Spider, props: spiderProp },
            ]
            this.spawnEnemyInterval = 300
            this.sinceLastSpawnEnemy = 0
            this.enemyPool = new EnemyPool(this, 15)
        }

        update(deltaTime) {
            if (this.sinceLastSpawnEnemy >= this.spawnEnemyInterval) {
                const enemy = this.enemyPool.get()
                enemy?.setActive(true)
                this.sinceLastSpawnEnemy = 0
            } else {
                this.sinceLastSpawnEnemy += deltaTime
            }

            this.enemyPool.enemies.forEach(enemy => {
                if (enemy.isActive()) {
                    enemy.update(deltaTime)
                }
                if (enemy.outOfBounds()) {
                    this.enemyPool.release(enemy)
                }
            })
        }

        draw() {
            this.enemyPool.enemies.forEach(enemy => {
                if (enemy.isActive()) {
                    enemy.draw()
                }
            })
        }
    }

    class Enemy {
        constructor(game, props) {
            this.game = game
            this.props = props
            this.width = this.props.sprite.width * 0.5
            this.height = this.props.sprite.height * 0.5
            this.prevX = this.game.width
            this.prevY = Math.random() * (this.game.height - this.height)
            this.x = this.prevX
            this.y = this.prevY
            this._isActive = false
            this._outOfBounds = false
            this.frame = 0
            this.frameInterval = Math.random() * 50 + 50
            this.sinceLastChangeFrame = 0
            this.velocityX = Math.random() * 0.1 + 0.1
        }

        update(deltaTime) {
            this.x -= this.velocityX * deltaTime
            if (this.x < -this.width) {
                this._outOfBounds = true
            }
            if (this.sinceLastChangeFrame >= this.frameInterval) {
                this.frame = (this.frame + 1) % this.props.sprite.frames
                this.sinceLastChangeFrame = 0
            } else {
                this.sinceLastChangeFrame += deltaTime
            }
        }

        draw() {
            this.game.artist.drawImage(this.props.sprite.src,
                this.frame * this.props.sprite.width, 0,
                this.props.sprite.width, this.props.sprite.height,
                this.x, this.y,
                this.width, this.height
            )
        }

        setActive(active) {
            this._isActive = active
        }

        isActive() {
            return this._isActive
        }

        outOfBounds() {
            return this._outOfBounds
        }

        resetStates() {
            this.x = this.prevX
            this.y = this.prevY
            this.frame = 0
            this.sinceLastChangeFrame = 0
            this._isActive = false
            this._outOfBounds = false
        }
    }

    class Worm extends Enemy {
        constructor(game, props) {
            super(game, props)
            this.prevY = this.game.height - this.height
            this.y = this.prevY
        }
    }

    class Ghost extends Enemy {
        constructor(game, props) {
            super(game, props)
            this.velocityX = Math.random() * 0.2 + 0.1
            this.prevY = Math.random() * this.game.height * 0.6
            this.y = this.prevY
            this.angle = 0
            this.curve = Math.random() * 3
        }

        update(deltaTime) {
            super.update(deltaTime)
            this.angle += 0.04
            this.y += this.curve * Math.sin(this.angle)
        }

        draw() {
            this.game.artist.save()
            this.game.artist.globalAlpha = 0.5
            super.draw()
            this.game.artist.restore()
        }
    }

    class Spider extends Enemy {
        constructor(game, props) {
            super(game, props)
            this.prevY = -this.height
            this.y = this.prevY
            this.prevX = Math.random() * (this.game.width - this.width)
            this.x = this.prevX
            this.velocityX = 0
            this.velocityY = Math.random() * 0.1 + 0.1
            this.webLength = Math.random() * (this.game.height - this.height)
        }

        update(deltaTime) {
            super.update(deltaTime)
            this.y += this.velocityY * deltaTime
            if (this.y >= this.webLength) {
                this.velocityY *= -1
            } else if (this.y < -(this.height * 2)) {
                this._outOfBounds = true
                this.velocityY *= -1
            }
        }

        draw() {
            this.game.artist.beginPath()
            this.game.artist.moveTo(this.x + this.width / 2, 0)
            this.game.artist.lineTo(this.x + this.width / 2, this.y + 10)
            this.game.artist.stroke()
            super.draw()
        }
    }

    class EnemyPool {
        constructor(game, poolSize, maxPoolSize = Number.MAX_SAFE_INTEGER) {
            this.poolSize = poolSize
            this.maxPoolSize = maxPoolSize
            this.enemies = []
            this.game = game
            this.#init()
        }

        #init() {
            for (let i = 0; i < this.poolSize; i++) {
                const { EnemyClass, props } = this.#getRandomEnemyType()
                this.enemies.push(new EnemyClass(this.game, props))
            }
            this.enemies.sort(function (enemy1, enemy2) {
                return enemy1.y - enemy2.y
            })
        }

        #getRandomEnemyType() {
            const random = Math.floor(Math.random() * this.game.enemyTypes.length)
            return this.game.enemyTypes[random]
        }

        get() {
            const enemy = this.enemies.find(enemy => !enemy.isActive())
            if (!enemy && this.poolSize < this.maxPoolSize) {
                const { EnemyClass, props } = this.#getRandomEnemyType()
                this.addNewEnemy(new EnemyClass(this.game, props))
                console.log(`Created new enemy, pool size: ${this.poolSize}`)
                return this.enemies.back()
            }
            return enemy
        }

        release(enemy) {
            enemy.resetStates()
        }

        addNewEnemy(enemy) {
            for (let i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].y >= enemy.y) {
                    this.enemies.splice(i, 0, enemy)
                    this.poolSize++
                    return
                }
            }
            this.enemies.push(enemy)
            this.poolSize++
        }
    }

    const game = new Game(artist, canvas.width, canvas.height)

    let lastTimestamp = 0

    function animate(timestamp) {
        artist.clearRect(0, 0, canvas.width, canvas.height)

        const deltaTime = timestamp - lastTimestamp
        lastTimestamp = timestamp

        game.update(deltaTime)
        game.draw()

        requestAnimationFrame(animate)
    }

    animate(lastTimestamp)
})
