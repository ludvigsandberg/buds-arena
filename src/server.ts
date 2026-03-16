import express from "express"
import http from "http"
import { Server } from "socket.io"
import multer from "multer"
import fs from "fs"
import path from "path"
import { pathToFileURL } from "url"

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

const upload = multer({ dest: "uploads/" })

// --- sprites & players ---
const sprites: Record<string, any> = {}
const players: Record<string, any> = {}

// --- dynamic hooks ---
const hooks: Record<string, Function[]> = {}

// --- api exposed to mods ---
const api: any = {

    // dynamic hooks
    on: (hookName: string, fn: Function) => {
        if (!hooks[hookName]) hooks[hookName] = []
        hooks[hookName].push(fn)
    },

    trigger: (hookName: string, ...args: any[]) => {
        if (!hooks[hookName]) return
        for (const fn of hooks[hookName]) fn(...args)
    },

    // sprite API
    spawnSprite: (id: string, url: string, x: number, y: number, w = 64, h = 64, type?: string) => {
        sprites[id] = { id, url, x, y, w, h, type }
    },

    moveSprite: (id: string, x: number, y: number, w = 64, h = 64) => {
        if (sprites[id]) {
            sprites[id].x = x
            sprites[id].y = y
            sprites[id].w = w
            sprites[id].h = h
        }
    },

    getSprite: (id: string) => sprites[id],
    getSprites: () => sprites,
}

// --- mod loader ---
const loadedMods = new Set<string>()

async function loadMod(file: string) {
    if (loadedMods.has(file)) return
    try {
        const fullPath = path.resolve(file)
        const url = pathToFileURL(fullPath).href + "?t=" + Date.now()
        const mod = await import(url)
        if (mod.init) mod.init(api)
        loadedMods.add(file)
        console.log("Loaded mod:", file)
    } catch (err) {
        console.error("Failed loading mod:", file, err)
    }
}

async function loadAllMods() {
    if (!fs.existsSync("mods")) return
    const files = fs.readdirSync("mods")
    for (const f of files) {
        await loadMod("mods/" + f)
    }
}

// --- socket.io connection ---
io.on("connection", (socket) => {

    players[socket.id] = { id: socket.id, type: "player" }

    api.trigger("playerJoin", socket.id)

    socket.on("input", (data) => {
        api.trigger("input", socket.id, data)
    })

    socket.on("disconnect", () => {
        api.trigger("playerLeave", socket.id)
        delete players[socket.id]
    })

})

// --- tick loop ---
setInterval(() => {
    api.trigger("tick")
    io.emit("state", sprites)
}, 50)

// --- mod upload endpoint ---
app.post("/upload-mod", upload.single("mod"), async (req: any, res: any) => {
    const f = req.file
    if (!f) {
        res.status(400).send("no file")
        return
    }

    const dest = "mods/" + f.originalname
    fs.renameSync(f.path, dest)
    await loadMod(dest)
    res.send("mod loaded")
})

// --- load existing mods ---
loadAllMods()

server.listen(4000, () => {
    console.log("http://localhost:4000")
})