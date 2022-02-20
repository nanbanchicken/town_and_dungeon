// syumino programming
// https://www.youtube.com/channel/UClZj9tdR1TRkxglnaA55pJA
// twitter @Suminoprogramm1
// Nanban and Nishino Junji

///---- 2021/8/7

class Room_Config {
    constructor(min_width, min_height, max_width, max_height) {
        this.min_width = min_width;
        this.min_height = min_height;
        this.max_width = max_width;
        this.max_height = max_height;
    }
}

class Dungeon { 

    constructor(width, height, room_count, room_config) {
        this._width = width;
        this._height = height;
        this._room_count = room_count;
        this._room_config = room_config;
        
        this._tile_info = {
            Bedrock: {Type: -1, Color: 'rgb(0,0,0)'},
            Air: { Type: 0, Color: 'rgb(255,255,255)' },
            Wall: { Type: 1, Color: 'rgb(100,100,100)' },
            Player: { Type: 2, Color: 'rgb(255,0,0)' },
            Treasure: { Type: 3, Color: 'rgb(0,255,0)'}
        };

        // 0: 空間
        // 1: 壁
        // 2: プレイヤー
        //this.map = [
        //    1,1,1,1,1,1,1,-1,
        //    1,1,1,1,1,1,1,-1,
        //    1,1,1,1,1,1,1,-1,
        //    1,1,1,1,1,1,1,-1,
        //    1,1,1,1,1,1,1,-1,
        //    1,1,1,1,1,1,1,-1,
        //    1,1,1,1,1,1,1,-1,
        //    1,1,1,1,1,1,1,-1,
        //];

        this._init_map();
        this._make_dungeon();
        this._create_treasure_white_list();
        this._treasure_list = new Treasure_List(this, 10);
    }

    _init_map() { 
        // 最初は全部壁で埋める
        this.map = new Array(this._width * this._height).fill(this._tile_info.Wall.Type);

        // 岩盤で周囲を囲む
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                if (x == 0 || x == this._width - 1 || y == 0 || y == this._height - 1) {
                    this.fill_bedrock(x, y);
                }
            }
        }
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
        this._draw_tile(x, y, this._tile_info.Player.Type);
    }

    display_treasures() {
        this._treasure_list.display_treasures();
    }
    
    // 宝箱を表示
    display_treasure(x, y) {
        this._draw_tile(x, y, this._tile_info.Treasure.Type);
    }

    _get_tile_color(tile_type) {
        for (let item in this._tile_info) {
            if (this._tile_info[item].Type == tile_type)
                return this._tile_info[item].Color;
        }
        return this._tile_info.Bedrock.Color; // error
   
    }

    _draw_tile(x, y, tile_type) {
        let color = this._get_tile_color(tile_type);
        fill(color);

        if (tile_type == this._tile_info.Player.Type) {
            ellipseMode(CORNER);
            ellipse(x * 20, y * 20, 20, 20);
        }  else {
            rect(x * 20, y * 20, 20, 20);
        }
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
        this._make_room(this._room_count);
    }

    _make_room(room_count) {
        console.log("_make_room");

        for (let count = 0; count < room_count; count++) {
            let width = this._get_random_range(this._room_config.min_width, this._room_config.max_width + 1);
            let height = this._get_random_range(this._room_config.min_height, this._room_config.max_height + 1);
            
            this._make_one_room(width, height);
        }
    }
    
    _make_one_room(room_width, room_height) {
        console.log("_make_one_room");

        // 作る部屋の左上の座標(周囲の岩盤を考慮)
        let left_x = this._get_random_range(1, (this._width - 1) - (room_width - 1));
        let upper_y = this._get_random_range(1, (this._height - 1) - (room_height - 1));

        for (let y = upper_y; y < upper_y + room_height; y++) {
            for (let x = left_x; x < left_x + room_width; x++) {
                this.dig_wall(x, y);
            }
        }
    }

    // 宝箱のホワイトリスト
    _create_treasure_white_list() {
        this._treasure_white_list = [];
        
        for (let y = 1; y < this._height - 1; y++) {
            for (let x = 1; x < this._width - 1; x++) {
                let index = this._convert_2dTo1d(x, y);
                this._treasure_white_list.push(index);
            }
        }
    }

    // 2 つの値の間のランダムな整数を得る min以上、max未満
    _get_random_range(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    // mapのx, yの位置を岩盤で埋める
    fill_bedrock(x, y) {
        var index = this._convert_2dTo1d(x, y);
        this.map[index] = this._tile_info.Bedrock.Type;
    }
    
    // mapのx, yの位置に空間を開ける
    dig_wall(x,y){
        let value = this._get_map(x, y);
        if (value == this._tile_info.Bedrock.Type) {
            return;
        }
        
        var index = this._convert_2dTo1d(x, y);
        this.map[index] = this._tile_info.Air.Type;
    }

    // 最初の空間座標を取得する
    get_first_air_index() {
        for (let i = 0; i < this._width * this._height; i++) {
            if (this.map[i] == this._tile_info.Air.Type) {
                return i;
            }
        }
    }
    
    // 岩盤以外のランダムな座標を取得
    get_random_index() {
        // 岩盤以外の座標
        let x = this._get_random_range(1, (this._width - 1));
        let y = this._get_random_range(1, (this._height - 1));

        let index = this._convert_2dTo1d(x, y);
        return index;
    }

        // 宝箱の座標をランダムに取得(被りなし)
    get_random_treasure_index() {
        let white_list_index = this._get_random_range(0, this._treasure_white_list.length);
        let map_index = this._treasure_white_list[white_list_index];
        // 使用済みの要素を削除
        this._treasure_white_list.splice(white_list_index, 1);
        
        return map_index;
    }

    is_bedrock(x, y) {
        let value = this._get_map(x, y);
        return (value == this._tile_info.Bedrock.Type);
    }
    
    is_wall(x, y) {
        let value = this._get_map(x, y);
        return (value == this._tile_info.Wall.Type);
    }

    // 宝箱関係
    is_exist_treasure(x, y) {
        return this._treasure_list.is_exist_treasure(x, y);
    }
    
    is_opened_treasure(x, y) {
        return this._treasure_list.is_opened_treasure(x, y);
    }
    
    open_treasure(x, y) {
        return this._treasure_list.open_treasure(x, y);
    }

}
//----

class Player {

    constructor(my_dungeon) {
        this._dungeon = my_dungeon;
        
        this._make_player();

        this._stats = new Player_Stats();
    }

    _make_player() {
        console.log("make_player");
        
        let air_index = this._dungeon.get_first_air_index();

        this._position_x = this._dungeon.convert_1dTo2d_x(air_index);
        this._position_y = this._dungeon.convert_1dTo2d_y(air_index);
    }
    
    display_player() {
        console.log("display_player");

        // this._dungeon.display_dungeon();
        this._dungeon.display_player(this._position_x, this._position_y);
        this._stats.display_player_stats();
    }

    // dir_x, dir_y: 移動量
    move_player(dir_x, dir_y) {
        let next_x = this._position_x + dir_x;
        let next_y = this._position_y + dir_y;

        if (this._dungeon.is_bedrock(next_x, next_y)) {
            // 行き先が岩盤の移動はなし
        } else if (this._dungeon.is_wall(next_x, next_y)) {
            // 行き先が壁の場合は掘る(移動はなし)
            this._dungeon.dig_wall(next_x, next_y);
            this._stats.add_dig_wall();
        } else {
            // 進む
            this._position_x = next_x;
            this._position_y = next_y;
            this._stats.add_walk();

            let is_exist_treasure = this._dungeon.is_exist_treasure(this._position_x, this._position_y)
            if (is_exist_treasure) {
                
                let is_opened_treasure = this._dungeon.is_opened_treasure(this._position_x, this._position_y);
                if (!is_opened_treasure) {
                    this._dungeon.open_treasure(this._position_x, this._position_y);
                    this._stats.add_pickup_treasure();
                }
            }
        }
    }
}

class Player_Stats {

    constructor() {
        this._text_size = 20;
        this._text_color = 'rgb(255,126,0)'; // オレンジ
        
        this._walk = 0;
        this._dig_wall = 0;
        this._pickup_treasures = 0;
    }
    
    add_walk() {
        this._walk += 1;
    }

    add_dig_wall() {
        this._dig_wall += 1;
    }

    add_pickup_treasure() {
        this._pickup_treasures += 1;
    }
    
    display_player_stats() {
        textAlign(LEFT, TOP);
        textSize(this._text_size);
        fill(this._text_color);

        text("歩数: " + this._walk, 0, 0);
        text("掘った数: " + this._dig_wall, 0, this._text_size);
        text("拾った宝箱: " + this._pickup_treasures, 0, this._text_size * 2);
    }
}

class Treasure {

    constructor(my_dungeon) {
        this._dungeon = my_dungeon;
        
        this._opened = false;

        this._make_treasure();
    }

    _make_treasure() {
        console.log("make_treasure");

        // ランダム位置に配置(岩盤以外)
        let index = this._dungeon.get_random_treasure_index();

        this._position_x = this._dungeon.convert_1dTo2d_x(index);
        this._position_y = this._dungeon.convert_1dTo2d_y(index);
    }
    
    is_exist_treasure(x, y) {
        let is_exist = this._position_x == x && this._position_y == y;
        return is_exist;
    }

    is_opened_treasure() {
        return this._opened;
    }
    
    open_treasure() {
        this._opened = true;
    }

    display_treasure() {
        console.log("display_treasure");

        this._dungeon.display_treasure(this._position_x, this._position_y);
    }
}

class Treasure_List {

    constructor(my_dungeon, count) {
        this._dungeon = my_dungeon;
        this._count = count;
        this._treasures = [];

        this._make_treasures();
    }

    _make_treasures() {
        for (let i = 0; i < this._count; i++) {
            this._treasures.push(new Treasure(this._dungeon));
        }
    }

    get_treasure(x, y) {
        for (let i = 0; i < this._count; i++) {
            if (this._treasures[i].is_exist_treasure(x, y)) {
                return this._treasures[i];
            }
        }

        return null;
    }

    is_exist_treasure(x, y) {
        let treasure = this.get_treasure(x, y);
        if (treasure == null)
            return false;
        
        return true;
    }
    
    is_opened_treasure(x, y) {
        let treasure = this.get_treasure(x, y);
        if (treasure == null)
            return false;
        
        return treasure.is_opened_treasure();
    }
    
    open_treasure(x, y) {
        let treasure = this.get_treasure(x, y);
        if (treasure == null) {
            return false;
        }

        treasure.open_treasure();
    }
    
    display_treasures() {
        for (let i = 0; i < this._count; i++) {
            this._treasures[i].display_treasure();
        }
    }
}


//------- ------ main 

let canvasSize = 600;
let my_dungeon;
let my_player;

function setup(){
    canvasSize=windowHeight;

    createCanvas(canvasSize, canvasSize);
    background(50, 100, 150);

    room_config = new Room_Config(2, 2, 4, 4);
    
    my_dungeon = new Dungeon(16, 16, 5, room_config);

    my_player = new Player(my_dungeon); // 空き部屋の一番左上
    
    display_all();
}
 
function draw(){

}

function keyPressed() {
    if (key == 'w') { //up
        my_player.move_player(0, -1);
    } else if (key == 'a') { //left
        my_player.move_player(-1, 0);
    } else if (key == 's') { //right
        my_player.move_player(0, 1);
    } else if (key == 'd') { //down
        my_player.move_player(1, 0);
    }

    display_all();
}

function display_all() {
    my_dungeon.display_dungeon();
    // my_objects.display_objects();
    // my_enemy.display_enemy();
    // my_treasure_list.display_treasures();
    my_dungeon.display_treasures();
    my_player.display_player();
}