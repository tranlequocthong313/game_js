export default class InputHandler {
    constructor(game) {
        this.keys = []
        this.game = game

        window.addEventListener('keydown', (e) => {
            if (this.keys.indexOf(e.key) !== -1) {
                return
            }
            if (e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'Enter') {
                this.keys.push(e.key)
            } else if (e.key === 'd') {
                this.game.debug = !this.game.debug
            }
        })

        window.addEventListener('keyup', (e) => {
            if (this.keys.indexOf(e.key) === -1) {
                return
            }
            if (e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'Enter') {
                this.keys.splice(this.keys.indexOf(e.key), 1)
            }
        })
    }
}
