// syumino programming
// https://www.youtube.com/channel/UClZj9tdR1TRkxglnaA55pJA
// twitter @Suminoprogramm1
// Nanban and Nishino Junji

///---- 2021/7/10

class Dungeon { 

    constructor() {
        this._width = 8;
        this._height = 8;

        this._tile_type = {
            Air: 0,
            Wall: 1,
            Player: 2
        };
        
        // 0: 空間
        // 1: 壁
        // 2: プレイヤー
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

    // プレイヤーを表示
    display_player(x, y) {
        this._draw_tile(x, y, this._tile_type.Player);
    }

    _draw_tile(x, y, tile_type){
        if (tile_type == this._tile_type.Air){
            fill(255, 255, 255);
        } else if (tile_type == this._tile_type.Wall){
            fill(0, 0, 0);
        } else if (tile_type == this._tile_type.Player) {
            fill(255, 0, 0);
        }
        
        rect(x*20, y*20, 20, 20);
    }

    // 1次元の位置を2次元の位置に変換(x)
    convert_1dTo2d_x(index) {
        return index % this._width;
    }

    // 1次元の位置を2次元の位置に変換(y)
    convert_1dTo2d_y(index) {
        return Math.floor(index / this._width);
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
        this.map[index] = this._tile_type.Air;
    }

    // 最初の空間座標を取得する
    get_first_air_index() {
        for (let i = 0; i < this._width * this._height; i++) {
            if (this.map[i] == this._tile_type.Air) {
                return i;
            }
        }
    }
    
}
//----

class Player {

    constructor(my_dungeon) {
        this._dungeon = my_dungeon;
        
        this._make_player();
    }

    _make_player() {
        console.log("make_player");
        
        let air_index = this._dungeon.get_first_air_index();

        this._position_x = this._dungeon.convert_1dTo2d_x(air_index);
        this._position_y = this._dungeon.convert_1dTo2d_y(air_index);
    }
    
    display_player() {
        console.log("display_player");

        this._dungeon.display_dungeon();
        this._dungeon.display_player(this._position_x, this._position_y);
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

    let my_player = new Player(my_dungeon); // 空き部屋の一番左上
    my_player.display_player();
}
 
function draw(){

}
