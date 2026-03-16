export function init(api:any){

    const size = 500        // tile spacing
    const range = 500        // grid radius (tiles)

    const gridUrl = "https://static.vecteezy.com/system/resources/previews/006/999/780/non_2x/black-and-white-block-pattern-background-free-vector.jpg"

    let created = false

    api.onTick(()=>{

        if(created) return
        created = true

        api.spawnSprite(
                    'grid',
                    gridUrl,
                    -500,
                    -500,
                    1000,
                    1000
                )

    })

}