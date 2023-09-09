'use strict'

window.addEventListener('load', function () {
    class Paddle {
        constructor(canvas, x, y, width = 10, height = 40) {
            this.canvas = canvas
            this.x = x
            this.y = y
            this.maxVelocityY = 0.4
            this.velocityY = 0
            this.width = width
            this.height = height
        }

        update(deltatime) {
            this.y += this.velocityY * deltatime
            if (this.y <= 0) {
                this.y = 0
            } else if (this.y >= this.canvas.height - this.height) {
                this.y = this.canvas.height - this.height
            }
        }

        draw(ctx) {
            ctx.fillStyle = 'white'
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }

        isCollided(obj) {
            return obj.x + obj.width > this.x &&
                obj.y + obj.height > this.y &&
                obj.x < this.x + this.width &&
                obj.y < this.y + this.height
        }
    }

    class Player extends Paddle {
        constructor(canvas, x, y, width, height, inputHandler) {
            super(canvas, x, y, width, height)
            this.inputHandler = inputHandler
        }

        update(deltatime) {
            if (this.inputHandler.isPressed('ArrowUp')) {
                this.velocityY = -this.maxVelocityY
            } else if (this.inputHandler.isPressed('ArrowDown')) {
                this.velocityY = this.maxVelocityY
            } else {
                this.velocityY = 0
            }
            super.update(deltatime)
        }
    }

    class Bot extends Paddle {
        constructor(canvas, x, y, width, height, ball) {
            super(canvas, x, y, width, height)
            this.botSpeed = 1
            this.maxVelocityY *= this.botSpeed
            this.ball = ball
            this.ballStartingMovementPosition = this.canvas.width * 0.4
        }

        update(deltatime) {
            if (this.ball.x < this.ballStartingMovementPosition) {
                this.velocityY = 0
                return
            }
            if (this.ball.y < this.y) {
                this.velocityY = -this.maxVelocityY
            } else if (this.ball.y > this.y) {
                this.velocityY = this.maxVelocityY
            } else {
                this.velocityY = 0
            }
            super.update(deltatime)
        }
    }

    class Ball {
        constructor(canvas, x, y, size) {
            this.canvas = canvas
            this.x = x
            this.y = y
            this.width = size
            this.height = size
            this.maxVelocityX = 0.5
            this.maxVelocityY = 0.5
            this.velocityX = -this.maxVelocityX
            this.velocityY = Math.random() * 0.2 - 0.1
        }

        update(deltatime) {
            this.x += this.velocityX * deltatime
            this.y += this.velocityY * deltatime
        }

        draw(ctx) {
            ctx.fillStyle = 'white'
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }

    class InputHandler {
        constructor() {
            this.pressedKeys = {
                'ArrowUp': false,
                'ArrowDown': false,
                'Enter': false,
            }

            window.addEventListener('keydown', (e) => {
                if (this.pressedKeys.hasOwnProperty(e.key)) {
                    this.pressedKeys[e.key] = true
                }
            })

            window.addEventListener('keyup', (e) => {
                if (this.pressedKeys.hasOwnProperty(e.key)) {
                    this.pressedKeys[e.key] = false
                }
            })
        }

        isPressed(key) {
            return this.pressedKeys.hasOwnProperty(key) ? this.pressedKeys[key] : false
        }
    }

    class UI {
        constructor(game, canvas) {
            this.game = game
            this.canvas = canvas
        }

        draw(ctx) {
            ctx.fillStyle = 'white'
            ctx.font = "50px Helvetica"

            if (this.game.isReady) {
                this.#drawCountDown(ctx)
            }
            if (this.game.gameOver) {
                this.#drawGameOver(ctx)
            }
            this.#drawScores(ctx)
            this.#drawBoard(ctx)
        }

        #drawCountDown(ctx) {
            ctx.save()
            ctx.textAlign = 'center'
            ctx.font = "100px Helvetica"
            ctx.fillText(String(this.game.countDown), this.canvas.width * 0.5, this.canvas.height * 0.5)
            ctx.restore()
        }

        #drawBoard(ctx) {
            const width = 8
            const height = 8

            const numOfNets = canvas.height / height
            for (let i = 0; i < numOfNets; i++) {
                ctx.fillRect(canvas.width * 0.5 - width * 0.5, i * 20, width, height)
            }
        }


        #drawGameOver(ctx) {
            ctx.save()
            ctx.textAlign = 'center'
            ctx.fillText(`Game over! ${this.game.winner}`, this.canvas.width * 0.5, this.canvas.height * 0.5 - 30)
            ctx.fillText(`Press Enter to play again`, this.canvas.width * 0.5, this.canvas.height * 0.5 + 30)
            ctx.restore()
        }

        #drawScores(ctx) {
            ctx.fillText(String(this.game.scoreOfPlayer1), this.canvas.width * 0.5 - 100 + 20, 50)
            ctx.fillText(String(this.game.scoreOfPlayer2), this.canvas.width * 0.5 + 50, 50)
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas

            this.paddleWidth = 15
            this.paddleHeight = 80

            this.startX = 15

            this.inputHandler = new InputHandler

            this.ballSize = 15
            this.ball = new Ball(this.canvas, this.canvas.width * 0.5 - 30, this.canvas.height * 0.5, this.ballSize)
            this.player1 = new Player(this.canvas, this.startX, this.canvas.height * 0.5 - this.paddleHeight * 0.5, this.paddleWidth, this.paddleHeight, this.inputHandler)
            this.player2 = new Bot(this.canvas, this.canvas.width - this.paddleWidth - this.startX, this.canvas.height * 0.5 - this.paddleHeight * 0.5, this.paddleWidth, this.paddleHeight, this.ball)

            this.scoreOfPlayer1 = 0
            this.scoreOfPlayer2 = 0
            this.maxScore = 10
            this.gameOver = false
            this.winner = ''

            this.ui = new UI(this, this.canvas)

            this.started = false
            this.isReady = true
            this.startCounter = 3000
            this.countDown = this.startCounter / 1000
            this.lastCountDown = 0
            this.#startNewRound()
        }

        update(deltatime) {
            if (this.gameOver) {
                if (this.inputHandler.isPressed('Enter')) {
                    this.#startNewRound()
                    this.gameOver = false
                    this.scoreOfPlayer1 = 0
                    this.scoreOfPlayer2 = 0
                }
                return
            }
            this.player1.update(deltatime)
            this.player2.update(deltatime)
            if (this.isReady) {
                if (this.lastCountDown >= 1000) {
                    this.countDown--
                    this.lastCountDown = 0
                } else {
                    this.lastCountDown += deltatime
                }
                if (this.countDown === 0) {
                    this.countDown = this.startCounter / 1000
                    this.isReady = false
                    this.startCounter = this.startCounter * 0.5
                }
            }
            if (!this.started) {
                return
            }
            this.ball.update(deltatime)

            this.#handleBallCollision()
        }

        draw(ctx) {
            this.ui.draw(ctx)
            this.player1.draw(ctx)
            this.player2.draw(ctx)
            this.ball.draw(ctx)
        }

        #handleBallCollision() {
            if (this.player1.isCollided(this.ball)) {
                this.ball.velocityX = this.ball.maxVelocityX
                if (this.ball.y > this.player1.y + this.player1.height * 0.5 + this.player1.height * 0.3) {
                    this.ball.velocityY = this.ball.maxVelocityY
                } else if (this.ball.y < this.player1.y + this.player1.height * 0.5 - this.player1.height * 0.3) {
                    this.ball.velocityY = -this.ball.maxVelocityY
                }
            } else if (this.player2.isCollided(this.ball)) {
                this.ball.velocityX = -this.ball.maxVelocityX
                if (this.ball.y > this.player2.y + this.player2.height * 0.5 + this.player2.height * 0.3) {
                    this.ball.velocityY = this.ball.maxVelocityY
                } else if (this.ball.y < this.player2.y + this.player2.height * 0.5 - this.player2.height * 0.3) {
                    this.ball.velocityY = -this.ball.maxVelocityY
                }
            } else if (this.ball.y <= 0) {
                this.ball.velocityY = this.ball.maxVelocityY
            } else if (this.ball.y >= this.canvas.height - this.ball.height) {
                this.ball.velocityY = -this.ball.maxVelocityY
            } else if (this.ball.x < -200) {
                this.scoreOfPlayer2++
                this.ball.x = this.canvas.width * 0.5 - 30
                this.ball.velocityX = -this.ball.maxVelocityX
                this.#handleGameOverCondition()
            } else if (this.ball.x > this.canvas.width + 200) {
                this.scoreOfPlayer1++
                this.ball.x = this.canvas.width * 0.5 + 30
                this.ball.velocityX = this.ball.maxVelocityX
                this.#handleGameOverCondition()
            }
        }

        #handleGameOverCondition() {
            if (this.scoreOfPlayer1 >= this.maxScore || this.scoreOfPlayer2 >= this.maxScore) {
                if (this.scoreOfPlayer1 >= this.maxScore) {
                    this.winner = 'Player 1 won'
                } else if (this.scoreOfPlayer2 >= this.maxScore) {
                    this.winner = 'Player 2 won'
                } else {
                    this.winner = 'No one won'
                }
                this.gameOver = true
            } else {
                this.#startNewRound()
            }
        }

        #startNewRound() {
            this.started = false
            this.ball.y = this.canvas.height * 0.5, 10
            this.player1.x = this.startX
            this.player1.y = this.canvas.height * 0.5 - this.paddleHeight * 0.5
            this.player2.x = this.canvas.width - this.paddleWidth - this.startX
            this.player2.y = this.canvas.height * 0.5 - this.paddleHeight * 0.5
            this.ball.velocityY = Math.random() * 0.2 - 0.1
            setTimeout(() => this.started = true, this.startCounter)
        }
    }

    // T
    const $ = document.querySelector.bind(document)
    const canvas = $('#canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = 700
    canvas.height = 500

    const game = new Game(canvas)

    let lastTime = 0

    function animate(timestamp) {
        const deltatime = timestamp - lastTime
        lastTime = timestamp

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        game.update(deltatime)
        game.draw(ctx)

        requestAnimationFrame(animate)
    }

    animate(0)
})
