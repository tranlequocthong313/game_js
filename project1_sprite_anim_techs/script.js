const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const log = console.log

let playerState = 'idle'
const dropdown = $('#animations')
dropdown.addEventListener('change', function (e) {
    playerState = e.target.value
})

const canvas = $('#canvas1')
const artist = canvas.getContext('2d')

const CANVAS_WIDTH = canvas.width = 600
const CANVAS_HEIGHT = canvas.height = 600

const playerImage = new Image()
playerImage.src = 'shadow_dog.png'
const spriteWidth = 575 // width of the file image / columns = 6876px / 12cols 
const spriteHeight = 523 // height of the file image / rows = 5230px / 10rows

let gameFrame = 0
const staggerFrames = 5

const spriteAnimations = []
const animationStates = [
    {
        name: 'idle',
        frames: 7
    },
    {
        name: 'jump',
        frames: 7
    },
    {
        name: 'fall',
        frames: 7
    },
    {
        name: 'run',
        frames: 9
    },
    {
        name: 'dizzy',
        frames: 11
    },
    {
        name: 'sit',
        frames: 5
    },
    {
        name: 'roll',
        frames: 7
    },
    {
        name: 'bite',
        frames: 7
    },
    {
        name: 'ko',
        frames: 12
    },
    {
        name: 'getHit',
        frames: 4
    },
]

animationStates.forEach((state, row) => {
    spriteAnimations[state.name] = { locations: [] }
    for (let col = 0; col < state.frames; col++) {
        spriteAnimations[state.name].locations.push(
            {
                x: spriteWidth * col,
                y: spriteHeight * row
            }
        )
    }
})

function animate() {
    artist.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    const locations = spriteAnimations[playerState].locations
    const position = Math.floor(gameFrame / staggerFrames) % locations.length
    const frame = locations[position]

    artist.drawImage(playerImage,
        frame.x, frame.y,
        spriteWidth, spriteHeight,
        0, 0,
        spriteWidth, spriteHeight
    )

    gameFrame++
    requestAnimationFrame(animate)
}

animate()
