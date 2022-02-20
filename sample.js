// syumino programming
// https://www.youtube.com/channel/UClZj9tdR1TRkxglnaA55pJA
// twitter @Suminoprogramm1

///----

class Dungeon { 

    constructor() {
        // 0: 空間
        // 1: 壁
        this.map = [
            1,1,1,1,1,1,1,1,
            1,0,0,0,0,0,1,1,
            1,1,1,1,1,1,1,1,
            1,0,0,0,1,1,1,1,
            1,0,0,0,1,0,0,1,
            1,0,0,0,1,1,1,1,
            1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,
        ];
    }
    
    display_dungeon()  {
        console.log("display_dungeon");
        for(let y=0; y<8; y++){
            for(let x=0; x<8; x++){
                this.draw_tile(x, y, this.get_map(x, y));
            }
        }
    }

    draw_tile(x, y, tile_type){
        if(tile_type === 0){
            fill(255, 255, 255);
        } else if(tile_type === 1){
            fill(0, 0, 0);
        }
        rect(x*20, y*20, 20, 20);
    }

    get_map(x, y){
        return (this.map[y*8 + x]);
    }

    make_dungeon(){
        console.log("make_dungeon stab");
    }

    dig_wall(x,y){
        console.log("dig_wall stab");
    }
    
}

//-------

let canvasSize = 600;
//var cellSize = 100;
//var cellSize;
//var cellmargin = 2;
//var cellLength = canvasSize / (cellSize + cellmargin * 2);
//var cells = [];

function setup(){
    canvasSize=windowHeight;
//    cellSize = canvasSize/20;
//    cellLength = canvasSize / (cellSize + cellmargin * 2);

    createCanvas(canvasSize, canvasSize);
    background(50, 100, 150);

    let my_dungeon = new Dungeon();
    //map_display(map);
    my_dungeon.display_dungeon();
}
 
function draw(){

}
