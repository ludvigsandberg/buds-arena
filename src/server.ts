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

const sprites:any = {}
const players:any = {}

const loadedMods = new Set()

type HookName = "playerJoin" | "playerLeave" | "tick" | "input"

const hooks: Record<HookName, Function[]> = {
    playerJoin: [],
    playerLeave: [],
    tick: [],
    input: []
}

function call(hook: HookName, ...args:any[]) {

    for(const fn of hooks[hook]){
        fn(...args)
    }

}

const api = {

    onPlayerJoin(fn:any){hooks.playerJoin.push(fn)},
    onPlayerLeave(fn:any){hooks.playerLeave.push(fn)},
    onTick(fn:any){hooks.tick.push(fn)},
    onInput(fn:any){hooks.input.push(fn)},

    spawnSprite(id:string,url:string,x:number,y:number,w:number,h:number){

        sprites[id]={id,url,x,y,w,h}

    },

    moveSprite(id:string,x:number,y:number){

        if(sprites[id]){
            sprites[id].x=x
            sprites[id].y=y
        }

    },

    getSprite(id:string){

        return sprites[id]

    },

    getSprites(){

        return sprites

    }

}

async function loadMod(file: string){

    if(loadedMods.has(file)) return

    try{

        const fullPath = path.resolve(file)

        const url = pathToFileURL(fullPath).href + "?t=" + Date.now()

        const mod = await import(url)

        if(mod.init){
            mod.init(api)
        }

        loadedMods.add(file)

        console.log("Loaded mod:", file)

    }catch(err){

        console.error("Failed loading mod:", file, err)

    }

}

async function loadAllMods(){

    if(!fs.existsSync("mods")) return

    const files = fs.readdirSync("mods")

    for(const f of files){

        await loadMod("mods/" + f)

    }

}

io.on("connection",(socket)=>{

    players[socket.id]={id:socket.id}

    call("playerJoin",socket.id)

    socket.on("input",(data)=>{

        call("input",socket.id,data)

    })

    socket.on("disconnect",()=>{

        call("playerLeave",socket.id)
        delete players[socket.id]

    })

})

setInterval(()=>{

    call("tick")

    io.emit("state",sprites)

},50)

app.post("/upload-mod",upload.single("mod"),async(req:any,res)=>{

    const f=req.file

    if(!f){
        res.status(400).send("no file")
        return
    }

    const dest="mods/"+f.originalname

    fs.renameSync(f.path,dest)

    await loadMod(dest)

    res.send("mod loaded")

})

loadAllMods()

server.listen(4000,()=>{

    console.log("http://localhost:4000")

})