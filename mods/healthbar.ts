export function init(api: any) {

    const playersHealth: Record<string, number> = {}
    const maxHealth = 100
    const barWidth = 128
    const barHeight = 8
    const barOffsetY = 128 + 24

    // player joins
    api.on("playerJoin", (id: string) => {
        playersHealth[id] = maxHealth

        // spawn healthbar sprite
        api.spawnSprite(
            "health_" + id,
            "https://static.vecteezy.com/system/resources/previews/017/174/347/original/light-red-texture-in-rectangular-style-vector.jpg",
            0,
            barOffsetY,
            barWidth,
            barHeight
        )
    })

    // player leaves
    api.on("playerLeave", (id: string) => {
        delete playersHealth[id]
        const s = api.getSprite("health_" + id)
        if(s) api.moveSprite("health_" + id, -9999, -9999, 0, 0)
    })

    // every tick, update healthbars
    api.on("tick", () => {

        for(const id in playersHealth){
            const health = playersHealth[id] || maxHealth
            const player = api.getSprite(id)
            const bar = api.getSprite("health_" + id)
            if(!player || !bar) continue

            const barX = player.x
            const barY = player.y + barOffsetY

            const w = Math.max(0, (health / maxHealth) * barWidth)

            api.moveSprite("health_" + id, barX, barY, w, barHeight)
        }

    })

    // allow other mods to deal damage
    api.dealDamage = (id: string, dmg: number) => {
        if(!playersHealth[id]) return
        playersHealth[id] -= dmg
        if(playersHealth[id] < 0) playersHealth[id] = 0
        api.trigger?.("playerDamaged", id, playersHealth[id])
    }

    // optional heal function
    api.heal = (id: string, amount: number) => {
        if(!playersHealth[id]) return
        playersHealth[id] += amount
        if(playersHealth[id] > maxHealth) playersHealth[id] = maxHealth
        api.trigger?.("playerHealed", id, playersHealth[id])
    }

}