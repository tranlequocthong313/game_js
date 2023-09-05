import Player from './player.js'
import InputHandler from './input.js'
import Background from './background.js'
import { ClimbingEnemy, FlyingEnemy, GroundEnemy } from './enemy.js'
import UI from './ui.js'

window.addEventListener('load', function () {
    const $ = document.querySelector.bind(document)

    const canvas = $('#canvas1')
    const ctx = canvas.getContext('2d')

    canvas.width = 900
    canvas.height = 500

    class Game {
        constructor(canvas) {
            this.canvas = canvas
            this.groundMargin = 80

            this.player = new Player(this, {
                src: $('#player-img'),
                width: 1200 / 12,
                height: 913 / 10
            })

            this.input = new InputHandler(this)

            this.speed = 0
            this.maxSpeed = 4

            this.background = new Background(this,
                [
                    $('#layer-1'),
                    $('#layer-2'),
                    $('#layer-3'),
                    $('#layer-4'),
                    $('#layer-5')
                ], 1667, 500)

            this.enemies = []
            this.flyingEnemyProp = Object.freeze({
                sprite: {
                    src: $('#enemy-fly'),
                    width: 60,
                    height: 44,
                    maxFrames: 6
                }
            })
            this.groundEnemyProp = Object.freeze({
                sprite: {
                    src: $('#enemy-plant'),
                    width: 60,
                    height: 87,
                    maxFrames: 2
                }
            })
            this.climbingEnemyProp = Object.freeze({
                sprite: {
                    src: $('#enemy-spider-big'),
                    width: 720 / 6,
                    height: 144,
                    maxFrames: 6
                }
            })
            this.spawnEnemyTimer = 0
            this.spawnEnemyInterval = 1000

            this.particles = []
            this.fireSprite = $('#fire-img')

            this.collisions = []
            this.collisionSprite = $('#collision-anim')

            this.fontColor = 'black'
            this.livesSprite = $('#lives')
            this.ui = new UI(this, this.livesSprite)
            this.floatingMessages = []

            this.debug = false
            this.score = 0
            this.winningScore = 40
            this.time = 0
            this.maxTime = 60000
            this.gameOver = false
            this.lives = 5
        }

        update(deltatime) {
            this.time += deltatime
            if (this.time > this.maxTime || this.lives <= 0) {
                this.gameOver = true
            }

            this.background.update()

            this.player.update(this.input.keys, deltatime)

            if (this.spawnEnemyTimer >= this.spawnEnemyInterval) {
                this.#addEnemy()
                this.spawnEnemyTimer = 0
            } else {
                this.spawnEnemyTimer += deltatime
            }

            this.enemies.forEach(enemy => {
                enemy.update(deltatime)
            })

            this.particles.forEach(particle => {
                particle.update(deltatime)
            })

            this.collisions.forEach(collision => {
                collision.update(deltatime)
            })

            this.floatingMessages.forEach(message => {
                message.update(deltatime)
            })

            this.enemies = this.enemies.filter(enemy => enemy.isActive)
            this.particles = this.particles.filter(particle => particle.isActive)
            this.collisions = this.collisions.filter(collision => collision.isActive)
            this.floatingMessages = this.floatingMessages.filter(message => message.isActive)
        }

        draw(ctx) {
            this.background.draw(ctx)

            this.enemies.forEach(enemy => {
                enemy.draw(ctx)
            })

            this.particles.forEach(particle => {
                particle.draw(ctx)
            })

            this.collisions.forEach(collision => {
                collision.draw(ctx)
            })

            this.floatingMessages.forEach(message => {
                message.draw(ctx)
            })

            this.player.draw(ctx)
            this.ui.draw(ctx)
        }

        #addEnemy() {
            if (this.speed > 0 && Math.random() < 0.5) {
                this.enemies.push(new GroundEnemy(this, this.groundEnemyProp))
            }
            if (this.speed > 0) {
                this.enemies.push(new ClimbingEnemy(this, this.climbingEnemyProp))
            }
            this.enemies.push(new FlyingEnemy(this, this.flyingEnemyProp))
        }
    }

    const game = new Game(canvas)

    let lastTimestamp = 0
    function animate(timestamp) {
        const deltatime = timestamp - lastTimestamp
        lastTimestamp = timestamp

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        game.update(deltatime)
        game.draw(ctx)

        if (!game.gameOver) {
            requestAnimationFrame(animate)
        }
    }

    animate(0)
})
