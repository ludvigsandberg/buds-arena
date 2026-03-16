export function init(api: any) {

    const gridUrl = "https://static.vecteezy.com/system/resources/previews/006/999/780/non_2x/black-and-white-block-pattern-background-free-vector.jpg"

    // spawn the grid sprite once at init
    api.spawnSprite(
        'grid',
        gridUrl,
        -500,   // top-left corner
        -500,
        1000,   // width
        1000    // height
    )

}