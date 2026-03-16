const socket = io()

const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
}

// call once initially
resizeCanvas()

// call on window resize
window.addEventListener("resize", resizeCanvas)

let sprites = {}
let myId = null

const images = {}

socket.on("connect", () => {

    myId = socket.id

})

socket.on("state", (s) => {

    sprites = s

})

document.addEventListener("keydown", (e) => {

    socket.emit("input", { type: "keydown", key: e.key })

})

document.addEventListener("keyup", (e) => {

    socket.emit("input", { type: "keyup", key: e.key })

})

let mouse = {x:0, y:0}

canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX
    mouse.y = e.clientY
    socket.emit("input", {type:"mousemove", x: mouse.x, y: mouse.y})
})

canvas.addEventListener("click", e => {
    socket.emit("input", {type:"click"})
})

canvas.addEventListener("click", e => {
    socket.emit("input", {
        type: "click",
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
    })
})

function upload(){

    const file = document.getElementById("modfile").files[0]

    const form = new FormData()

    form.append("mod", file)

    fetch("/upload-mod", {
        method: "POST",
        body: form
    })

}

function render(){

    ctx.clearRect(0,0,canvas.width,canvas.height)

    let me = sprites[myId]

    let camX = 0
    let camY = 0

    if(me){

        camX = me.x - canvas.width/2
        camY = me.y - canvas.height/2

    }

    for(const id in sprites){

        const s = sprites[id]

        if(!images[s.url]){

            const img = new Image()
            img.src = s.url
            images[s.url] = img

        }

        const img = images[s.url]

        ctx.drawImage(
            img,
            s.x - camX,
            s.y - camY,
            s.w,
            s.h
        )

    }

    requestAnimationFrame(render)

}

render()