window.addEventListener('load', function () {
    const $ = document.querySelector.bind(document)

    const canvas = $('#canvas1')
    const ctx = canvas.getContext('2d')

    canvas.width = 1400
    canvas.height = 720

    const fullScreenButton = $('#full-screen-btn')
    fullScreenButton.addEventListener('click', e => {
        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            canvas.requestFullscreen().catch(err => {
                alert(`Error, can't enable full-screen mode: ${err.message}`)
            })
        }
    })

    class InputHandler {
        constructor(allowedKeys) {
            this.allowedKeys = allowedKeys
            this.pressedKeys = { 'SwipeUp': false, 'SwipeDown': false }
            this.callbacks = {}
            this.#init()

            window.addEventListener('keydown', (e) => {
                if (this.pressedKeys.hasOwnProperty(e.key)) {
                    this.pressedKeys[e.key] = true
                    this.callbacks[e.key]?.call(this)
                }
            })
            window.addEventListener('keyup', (e) => {
                if (this.pressedKeys.hasOwnProperty(e.key)) {
                    this.pressedKeys[e.key] = false
                }
            })

            this.lastY = 0
            this.threshHold = 30
            window.addEventListener('touchstart', (e) => {
                this.lastY = e.changedTouches[0].pageY
            })
            window.addEventListener('touchend', (e) => {
                this.pressedKeys['SwipeUp'] = false
                this.pressedKeys['SwipeDown'] = false
            })
            window.addEventListener('touchmove', (e) => {
                const distance = e.changedTouches[0].pageY - this.lastY
                if (distance < -this.threshHold) {
                    this.pressedKeys['SwipeUp'] = true
                    this.callbacks['SwipeDown']?.call(this)
                } else if (distance > this.threshHold) {
                    this.pressedKeys['SwipeDown'] = true
                    this.callbacks['SwipeDown']?.call(this)
                }
            })
        }

        #init() {
            this.allowedKeys.forEach(key => {
                this.pressedKeys[key] = false
                this.callbacks[key] = null
            })
        }

        addListener(key, callback) {
            this.pressedKeys[key] = false
            this.callbacks[key] = callback
        }
    }

    class Player {
        constructor(canvas, sprite) {
            // canvas
            this.canvas = canvas
            this.sprite = sprite

            // size, position
            this.width = this.sprite.width * 0.5
            this.height = this.sprite.height * 0.5
            this.x = 100
            this.y = this.canvas.height - this.height

            // veloctiy
            this.velocityX = 0
            this.velocityY = 0
            this.weight = 1

            // collision
            this.radius = this.width * 0.3
            this.collison = new CircleCollison(this)

            // frame
            this.fps = 20
            this.frameX = 0
            this.frameY = 0
            this.sinceLastFrame = 0
            this.frameInterval = 1000 / this.fps

            // input
            this.velocityXOfKeys = Object.freeze({
                'ArrowRight': 0.1,
                'ArrowLeft': -0.1,
                'a': -0.1,
                'd': 0.1,
            })
            this.velocityYOfKeys = Object.freeze({
                'ArrowUp': -30,
                'w': -30,
                'SwipeUp': -30
            })

            this.getHit = false
        }

        restart() {
            this.x = 100
            this.y = this.canvas.height - this.height
            this.velocityX = 0
            this.velocityY = 0
            this.frameX = 0
            this.frameY = 0
            this.sinceLastFrame = 0
            this.getHit = false
        }

        update(inputHandler, deltatime, enemies) {
            // input
            Object.entries(inputHandler.pressedKeys).forEach(([key, isPressed]) => {
                if (isPressed) {
                    this.velocityX = this.velocityXOfKeys[key] ? this.velocityXOfKeys[key] : this.velocityX
                    if (this.onGround()) {
                        this.velocityY = this.velocityYOfKeys[key] ? this.velocityYOfKeys[key] : this.velocityY
                    }
                }
            })

            // velocity
            this.x += this.velocityX * deltatime
            this.y += this.velocityY

            // on ground
            if (!this.onGround()) {
                this.velocityY += this.weight
                this.frameY = 1
            } else {
                this.velocityY = 0
                this.frameY = 0
            }

            // boundaries
            if (this.x >= this.canvas.width - this.width) {
                this.x = this.canvas.width - this.width
            } else if (this.x <= 0) {
                this.x = 0
            }
            if (this.y >= this.canvas.height - this.height) {
                this.y = this.canvas.height - this.height
            }

            // frame
            if (this.sinceLastFrame >= this.frameInterval) {
                if (this.onGround()) {
                    this.frameX = (this.frameX + 1) % this.sprite.moveFrames
                } else {
                    this.frameX = (this.frameX + 1) % this.sprite.jumpFrames
                }
                this.sinceLastFrame = 0
            } else {
                this.sinceLastFrame += deltatime
            }

            // collision 
            enemies.forEach(enemy => {
                if (this.collison.collided(enemy.collision)) {
                    this.getHit = true
                }
            })
        }

        draw(ctx) {
            ctx.drawImage(this.sprite.src,
                this.frameX * this.sprite.width, this.frameY * this.sprite.height,
                this.sprite.width, this.sprite.height,
                this.x, this.y,
                this.width, this.height
            )
        }

        onGround() {
            return this.y >= this.canvas.height - this.height
        }
    }

    class Background {
        constructor(canvas, background) {
            this.canvas = canvas
            this.background = background
            this.x = 0
            this.y = 0
            this.speed = 7
        }

        update() {
            this.x = Math.floor(this.x - this.speed) % this.background.width
        }

        draw(ctx) {
            ctx.drawImage(this.background.src, this.x, this.y)
            ctx.drawImage(this.background.src, this.x + this.background.width - this.speed, this.y)
        }

        restart() {
            this.x = 0
        }
    }

    class EnemyProp {
        constructor(name, sprite) {
            this.name = name
            this.sprite = sprite
        }
    }

    class Enemy {
        constructor(canvas, props) {
            // canvas
            this.canvas = canvas

            // props
            this.props = props

            // size
            this.sizeModifier = Math.random() * 0.3 + 0.4
            this.width = this.props.sprite.width * this.sizeModifier
            this.height = this.props.sprite.height * this.sizeModifier

            // position
            this.x = this.canvas.width
            this.y = this.canvas.height - this.height

            // velocity
            this.velocityX = Math.random() * 0.1 + 0.1

            // colision
            this.radius = this.width * 0.35
            this.collision = new CircleCollison(this)

            // frame
            this.fps = 20
            this.frame = 0
            this.sinceLastFrame = 0
            this.frameInterval = Math.random() * 50 + (1000 / this.fps)

            this.isActive = true
        }

        update(deltatime) {
            this.x -= this.velocityX * deltatime

            if (this.x < -this.width) {
                this.isActive = false
            }

            if (this.sinceLastFrame >= this.frameInterval) {
                this.frame = (this.frame + 1) % this.props.sprite.frames
                this.sinceLastFrame = 0
            } else {
                this.sinceLastFrame += deltatime
            }
        }

        draw(ctx) {
            ctx.drawImage(this.props.sprite.src,
                this.frame * this.props.sprite.width, 0,
                this.props.sprite.width, this.props.sprite.height,
                this.x, this.y,
                this.width, this.height
            )
        }
    }

    class CircleCollison {
        constructor(obj) {
            this.obj = obj
        }

        collided(collision) {
            const dx = (this.obj.x + this.obj.width * 0.5) - (collision.obj.x + collision.obj.width * 0.5 - 8)
            const dy = (this.obj.y + this.obj.height * 0.5 + 10) - (collision.obj.y + this.obj.height * 0.5 + 10)
            const distance = (dx * dx) + (dy * dy)
            const totalRadius = this.obj.radius + collision.obj.radius
            return distance <= (totalRadius * totalRadius)
        }
    }

    const allowedKeys = Object.freeze(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'])

    const playerImg = new Image
    playerImg.src = 'player.png'
    const playerSprite = {
        src: playerImg,
        width: 1800 / 9,
        height: 400 / 2,
        moveFrames: 9,
        jumpFrames: 7,
    }

    const backgroundImg = new Image
    backgroundImg.src = 'background_single.png'
    const wormImg = new Image
    wormImg.src = 'enemy_1.png'

    const player = new Player({ width: canvas.width, height: canvas.height }, playerSprite)
    const background = new Background(canvas, { src: backgroundImg, width: 2400, height: 720 })
    const inputHandler = new InputHandler(allowedKeys)
    const wormProps = Object.freeze(new EnemyProp('Worm', { src: wormImg, width: 960 / 6, height: 119, frames: 6 }))

    let enemies = []
    let sinceLastSpawnEmey = 0
    let spawnEnemyInterval = Math.random() * 1000 + 500

    function handleEnemies(deltatime) {
        if (sinceLastSpawnEmey >= spawnEnemyInterval) {
            enemies.push(new Enemy(canvas, wormProps))
            sinceLastSpawnEmey = 0
            spawnEnemyInterval = Math.random() * 1000 + 500
        } else {
            sinceLastSpawnEmey += deltatime
        }

        enemies.forEach(enemy => {
            enemy.update(deltatime)
            enemy.draw(ctx)
        })

        enemies = enemies.filter(enemy => {
            if (!enemy.isActive) {
                score++
                return false
            } else {
                return true
            }
        })
    }

    let score = 0

    function displayStatusText(ctx) {
        ctx.textAlign = 'left'
        ctx.fillStyle = 'white'
        ctx.font = '40px Helvetica'
        ctx.fillText(`Score: ${score}`, 20, 50)
        ctx.fillStyle = 'black'
        ctx.font = '40px Helvetica'
        ctx.fillText(`Score: ${score}`, 22, 52)
    }

    let gameOver = false
    const restartGameKey = 'Enter or Swipe down'

    function displayGameOverText() {
        if (gameOver) {
            ctx.fillStyle = 'white'
            ctx.font = '50px Helvetica'
            ctx.textAlign = 'center'
            ctx.fillText(`Game over! Your score is ${score}`, canvas.width * 0.5, canvas.height * 0.3)
            ctx.fillText(`${restartGameKey} to restart.`, canvas.width * 0.5, canvas.height * 0.4)
            ctx.fillStyle = 'black'
            ctx.font = '50px Helvetica'
            ctx.fillText(`Game over! Your score is ${score}`, canvas.width * 0.5 + 3, canvas.height * 0.3 + 3)
            ctx.fillText(`${restartGameKey} to restart.`, canvas.width * 0.5 + 3, canvas.height * 0.4 + 3)
        }
    }

    function restartGame() {
        if (gameOver) {
            player.restart()
            background.restart()
            enemies = []
            gameOver = false
            score = 0
            animate(0)
        }
    }

    inputHandler.addListener('Enter', restartGame)
    inputHandler.addListener('SwipeDown', restartGame)

    let lastTimestamp = 0

    function animate(timestamp) {
        if (gameOver) {
            displayGameOverText()
            return
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const deltatime = timestamp - lastTimestamp
        lastTimestamp = timestamp

        background.update()
        background.draw(ctx)

        displayStatusText(ctx)
        handleEnemies(deltatime)

        player.update(inputHandler, deltatime, enemies)
        player.draw(ctx)
        gameOver = player.getHit

        requestAnimationFrame(animate)
    }

    animate(lastTimestamp)
})
