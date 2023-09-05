class Layer {
    constructor(game, width, height, sprite, speedModifier) {
        this.game = game
        this.speedModifier = speedModifier
        this.sprite = sprite
        this.width = width
        this.height = height
        this.x = 0
    }

    update() {
        this.x = (this.x - this.game.speed * this.speedModifier) % this.width
    }

    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, 0, this.width, this.height)
        ctx.drawImage(this.sprite, this.x + this.width, 0, this.width, this.height)
    }
}

export default class Background {
    constructor(game, sprites, width, height) {
        this.game = game
        this.sprites = sprites
        this.width = width
        this.height = height
        this.layers = []
        this.#init()
    }

    #init() {
        this.layers.push(new Layer(this.game, this.width, this.height, this.sprites[0], 0))
        this.layers.push(new Layer(this.game, this.width, this.height, this.sprites[1], 0.2))
        this.layers.push(new Layer(this.game, this.width, this.height, this.sprites[2], 0.4))
        this.layers.push(new Layer(this.game, this.width, this.height, this.sprites[3], 0.8))
        this.layers.push(new Layer(this.game, this.width, this.height, this.sprites[4], 1))
    }

    update() {
        this.layers.forEach(layer => {
            layer.update()
        })
    }

    draw(ctx) {
        this.layers.forEach(layer => {
            layer.draw(ctx)
        })
    }
}
