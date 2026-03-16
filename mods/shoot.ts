export function init(api: any) {

    const fireballs: Record<string, any> = {}
    const speed = 20
    const lifespan = 40
    const damage = 10
    const mousePos: Record<string, {x:number,y:number}> = {}

    // handle mouse movement and clicks
    api.on("input", (id: string, input: any) => {

        if(input.type === "mousemove"){
            mousePos[id] = {x: input.x, y: input.y}
        }

        if(input.type === "click"){

            const player = api.getSprite(id)
            if(!player) return
            if(player.type !== "player") return

            const mouse = mousePos[id] || {x: 0, y: 0}

            // convert mouse to world coordinates
            const worldX = mouse.x + player.x - (input.canvasWidth || 0)/2
            const worldY = mouse.y + player.y - (input.canvasHeight || 0)/2

            const dx = worldX - player.x
            const dy = worldY - player.y
            const dist = Math.sqrt(dx*dx + dy*dy)
            if(dist === 0) return

            const vx = (dx / dist) * speed
            const vy = (dy / dist) * speed

            const fbId = "fireball_" + id + "_" + Date.now()
            fireballs[fbId] = {x: player.x, y: player.y, vx, vy, ticks: 0, owner: id}

            api.spawnSprite(fbId,
                "https://static.vecteezy.com/system/resources/thumbnails/021/698/212/small_2x/ball-of-fire-glowing-magma-sphere-fireball-large-sphere-of-red-energy-fantasy-game-spell-icon-generative-ai-png.png",
                player.x,
                player.y,
                64,
                64
            )

        }

    })

    // tick handler for fireball movement and collision
    api.on("tick", () => {

        for(const id in fireballs){
            const fb = fireballs[id]
            fb.x += fb.vx
            fb.y += fb.vy
            fb.ticks++

            api.moveSprite(id, fb.x, fb.y, 64, 64)

            // collision with players (excluding owner)
            for(const pid in api.getSprites()){
                const p = api.getSprite(pid)
                if(!p || p.type !== "player") continue
                if(pid === fb.owner) continue

                const dx = fb.x - p.x
                const dy = fb.y - p.y

                // simple 64x64 hitbox
                if(Math.abs(dx) < 32 && Math.abs(dy) < 32){
                    if(api.dealDamage) api.dealDamage(pid, damage)
                    api.trigger?.("fireballHit", pid, fb.owner, damage)

                    // despawn fireball
                    delete fireballs[id]
                    api.moveSprite(id, -9999, -9999, 0, 0)
                    break
                }
            }

            // lifespan expiry
            if(fb.ticks > lifespan){
                delete fireballs[id]
                api.moveSprite(id, -9999, -9999, 0, 0)
            }
        }

    })

}