// syumino programming
// https://www.youtube.com/channel/UClZj9tdR1TRkxglnaA55pJA
// twitter @Suminoprogramm1
// Nanban and Nishino Junji

///---- 2021/6/26

class Dungeon { 

    constructor() {
        this._width = 8;
        this._height = 8;
        
        // 0: 空間
        // 1: 壁
        this.map = [
            1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,
        ];
        
        this._make_dungeon();
    }
    
    display_dungeon()  {
        console.log("display_dungeon");
        for (let y = 0; y < this._height; y++){
            for(let x=0; x < this._width; x++){
                this._draw_tile(x, y, this._get_map(x, y));
            }
        }
    }

    _draw_tile(x, y, tile_type){
        if(tile_type === 0){
            fill(255, 255, 255);
        } else if(tile_type === 1){
            fill(0, 0, 0);
        }
        rect(x*20, y*20, 20, 20);
    }
    
    // 2次元の位置(x, y)を1次元の位置に変換
    _convert_2dTo1d(x, y) {
        return y * this._width + x;
    }

    // (x, y)のマップの値を取得
    _get_map(x, y)  {
        var index = this._convert_2dTo1d(x, y);
        return (this.map[index]);
    }

    _make_dungeon(){
        console.log("make_dungeon stab");

        this._make_room(5);
    }

    _make_room(room_count) {
        for (let count = 0; count < room_count; count++) {
            this._make_one_room(2, 2);
        }
        console.log("make_room stab : 2x2 only");
    }
    
    _make_one_room(room_width, room_height) {
        let left_x = this._get_random_range(0, this._width - (room_width - 1));
        let upper_y = this._get_random_range(0, this._height - (room_height - 1));

        for (let y = upper_y; y < upper_y + room_height; y++) {
            for (let x = left_x; x < left_x + room_width; x++) {
                this._dig_wall(x, y);
            }
        }
    }

    // 2 つの値の間のランダムな整数を得る min以上、max未満
    _get_random_range(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    // mapのx, yの位置に空間(0)を開ける
    _dig_wall(x,  y)  {
        var index = this._convert_2dTo1d(x, y);
        this.map[index] = 0;
    }
    
}

//-------

let canvasSize = 600;

function setup(){
    canvasSize=windowHeight;

    createCanvas(canvasSize, canvasSize);
    background(50, 100, 150);

    let my_dungeon = new Dungeon();
    my_dungeon.display_dungeon();
}
 
function draw(){

}
