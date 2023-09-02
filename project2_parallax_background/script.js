const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const log = console.log

const canvas = $('#canvas1')
const artist = canvas.getContext('2d')

const CANVAS_WIDTH = canvas.width = 800
const CANVAS_HEIGHT = canvas.height = 600
const BACKGROUND_WIDTH = 2400

let gameSpeed = 5
const gameSpeedHtml = $('#show-gamespeed')
gameSpeedHtml.innerHTML = gameSpeed
$('#slider').addEventListener('change', function (e) {
    gameSpeed = e.target.value
    gameSpeedHtml.innerHTML = gameSpeed
})

class Layer {
    constructor(image, speedModifier) {
        this.x = 0
        this.y = 0
        this.width = 2400
        this.height = 700
        this.image = image
        this.speedModifier = speedModifier
        this.speed = gameSpeed * this.speedModifier
    }

    update() {
        this.speed = gameSpeed * this.speedModifier
        this.x = Math.floor(this.x - this.speed) % this.width
    }

    draw() {
        artist.drawImage(this.image, this.x, this.y, this.width, this.height)
        artist.drawImage(this.image, this.x + this.width, this.y, this.width, this.height)
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

const gameObjects = [layer1, layer2, layer3, layer4, layer5]

function animate() {
    artist.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    layers.forEach(obj => {
        obj.update()
        obj.draw()
    })

    requestAnimationFrame(animate)
}

animate()
