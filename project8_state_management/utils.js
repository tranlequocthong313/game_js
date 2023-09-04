'use strict'

function drawStatusText(ctx, key, state) {
    ctx.font = '28px Helvetica'
    ctx.fillText(`Last input: ${key}`, 20, 50)
    ctx.fillText(`Active state: ${state}`, 20, 100)
}

export { drawStatusText }
