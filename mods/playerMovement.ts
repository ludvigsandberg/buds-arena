export function init(api:any){

    const speed=10

    const keys:any={}
    const players:any={}

    api.onPlayerJoin((id:string)=>{

        players[id]={x:0,y:0}

        api.spawnSprite(
            id,
            "https://tse3.mm.bing.net/th/id/OIP.BiEmAJ22f11ApidHzbdtBAHaNJ?rs=1&pid=ImgDetMain&o=7&rm=3",
            0,
            0,
            128,
            128
        )

    })

    api.onPlayerLeave((id:string)=>{

        delete players[id]

    })

    api.onInput((id:string,input:any)=>{

        if(!keys[id])keys[id]={}

        if(input.type==="keydown"){
            keys[id][input.key]=true
        }

        if(input.type==="keyup"){
            keys[id][input.key]=false
        }

    })

    api.onTick(()=>{

        for(const id in players){

            const p=players[id]
            const k=keys[id]||{}

            if(k["w"])p.y-=speed
            if(k["s"])p.y+=speed
            if(k["a"])p.x-=speed
            if(k["d"])p.x+=speed

            api.moveSprite(id,p.x,p.y)

        }

    })

}