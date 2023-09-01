const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const canvas = $('#canvas1')
const artist = canvas.getContext('2d')

const CANVAS_WIDTH = canvas.width = 500
const CANVAS_HEIGHT = canvas.height = 700

class Shape {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    update() { }

    draw() { }

    collided(shape) { }
}

class Rectangle extends Shape {
    constructor(x, y, width, height) {
        super(x, y)
        this.width = width
        this.height = height
    }

    update() {
        this.x -= (this.x - (CANVAS_WIDTH / 2)) / 100
        this.y -= (this.y - (CANVAS_HEIGHT / 2)) / 100
    }

    draw() {
        artist.fillRect(this.x, this.y, this.width, this.height)
    }

    collided(rect) {
        return this.x < rect.x + rect.width &&
            this.y < rect.y + rect.width &&
            rect.x < this.x + this.width &&
            rect.y < this.y + this.width
    }
}

const rect1 = new Rectangle(50, 50, 100, 100)
const rect2 = new Rectangle(100, 300, 200, 200)

class Circle extends Shape {
    constructor(x, y, radius) {
        super(x, y)
        this.radius = radius
    }

    update() {
        this.x -= (this.x - (CANVAS_WIDTH / 2)) / 100
        this.y -= (this.y - (CANVAS_HEIGHT / 2)) / 100
    }

    draw() {
        artist.beginPath()
        artist.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        artist.fill()
        artist.closePath()
    }

    collided(circle) {
        const dx = this.x - circle.x
        const dy = this.y - circle.y
        const bothRadius = this.radius + circle.radius
        return (dx * dx) + (dy * dy) <= (bothRadius * bothRadius)
    }
}

const circle1 = new Circle(300, 200, 25)
const circle2 = new Circle(500, 100, 30)

function animate() {
    artist.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    rect1.update()
    rect2.update()
    rect1.draw()
    rect2.draw()

    circle1.update()
    circle1.draw()
    circle2.update()
    circle2.draw()

    console.log(circle1.collided(circle2))
    console.log(rect1.collided(rect2))

    requestAnimationFrame(animate)
}

animate()
