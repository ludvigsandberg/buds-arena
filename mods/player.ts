export function init(api: any) {

    const speed = 10
    const keys: Record<string, Record<string, boolean>> = {}
    const players: Record<string, { x: number, y: number, w: number, h: number }> = {}

    // player joins
    api.on("playerJoin", (id: string) => {
        players[id] = { x: 0, y: 0, w: 128, h: 128 }

        api.spawnSprite(
            id,
            "https://tse3.mm.bing.net/th/id/OIP.BiEmAJ22f11ApidHzbdtBAHaNJ?rs=1&pid=ImgDetMain&o=7&rm=3",
            0,
            0,
            128,
            128,
            "player"
        )
    })

    // player leaves
    api.on("playerLeave", (id: string) => {
        delete players[id]
    })

    // handle keyboard input
    api.on("input", (id: string, input: any) => {
        if (!keys[id]) keys[id] = {}

        if (input.type === "keydown") keys[id][input.key] = true
        if (input.type === "keyup") keys[id][input.key] = false
    })

    // movement tick
    api.on("tick", () => {
        for (const id in players) {
            const p = players[id]
            if (!p) continue

            const k = keys[id] || {}

            if (k["w"]) p.y -= speed
            if (k["s"]) p.y += speed
            if (k["a"]) p.x -= speed
            if (k["d"]) p.x += speed

            api.moveSprite(id, p.x, p.y, p.w, p.h)
        }
    })

}