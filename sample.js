// syumino programming
// https://www.youtube.com/channel/UClZj9tdR1TRkxglnaA55pJA
// twitter @Suminoprogramm1

let map = [
    1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,1,1,
    1,1,1,1,1,1,1,1,
    1,0,0,0,1,1,1,1,
    1,0,0,0,1,1,1,1,
    1,0,0,0,1,1,1,1,
    1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,
];

//map[2]=2;
//map[1][0][1]

function map_display(map){
    for(let y=0; y<8; y++){
        for(let x=0; x<8; x++){
            tile_draw(x, y, map_get(x, y));
        }
    }
}

function tile_draw(x, y, tile_type){
    if(tile_type === 0){
        fill(255, 255, 255);
    } else if(tile_type === 1){
        fill(0, 0, 0);
    }
    rect(x*20, y*20, 20, 20);
}

function map_get(x, y){
    return (map[y*8 + x]);
}


let canvasSize = 600;

function setup(){
    canvasSize=windowHeight;

    createCanvas(canvasSize, canvasSize);
    background(50, 100, 150);

    map_display(map);
}
 
function draw(){

}
