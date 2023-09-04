'use strict'

import Player from './player.js'
import InputHandler from './input.js'
import { drawStatusText } from './utils.js'

window.addEventListener('load', () => {
    const $ = document.querySelector.bind(document)

    const loading = $('#loading')
    loading.style.display = 'none'

    const canvas = $('#canvas1')
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const playerImg = $('#player-img')
    const player = new Player(canvas, { src: playerImg, width: 200, height: 181.83 })
    const inputHandler = new InputHandler

    let lastTime = 0
    function animate(timestamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const deltaTime = timestamp - lastTime
        lastTime = timestamp

        player.update(inputHandler.lastKey, deltaTime)
        player.draw(ctx)

        drawStatusText(ctx, inputHandler.lastKey, player.currentState.state)

        requestAnimationFrame(animate)
    }

    animate(0)
})
