// syumino programming
// https://www.youtube.com/channel/UClZj9tdR1TRkxglnaA55pJA
// twitter @Suminoprogramm1
// Nanban and Nishino Junji

///---- 2021/10/16
class Room_Config {
    constructor(min_width, min_height, max_width, max_height) {
        this.min_width = min_width;
        this.min_height = min_height;
        this.max_width = max_width;
        this.max_height = max_height;
    }
}

class SightPattern{
    // width, height, size
    constructor(w, h){
        this._width = w;
        this._height = h;
    }

    create_square_pattern(sight_size){
        // 四角
        // [1, 1, 1,
        //  1, 1, 1,
        //  1, 1, 1]
        return new MDMap(sight_size, sight_size, 1);
    }

    create_cross_pattern(sight_size){
        // 十字
        // [0, 1, 0,
        //  1, 1, 1,
        //  0, 1, 0]
        let pattern = new MDMap(sight_size, sight_size, 0);
        if(sight_size % 2 == 0){
            // 偶数
        }
        else{ //     0 [1] 2
              //   0 1 [2] 3 4
              // 0 1 2 [3] 4 5 6
            // 奇数
            let mid_index = (sight_size + 1) / 2 - 1;
            for(let x = 0; x < sight_size; x++){
                for(let y = 0; y < sight_size; y++){
                    if(Math.abs(x - mid_index) + Math.abs(y - mid_index) <= mid_index){
                        pattern.update(x, y, 1);
                    }
                }
            }
        }
        
        return pattern;
    }

    get_pattern(x, y, type, sight_size){
        // パターン作成
        let pattern = null;
        if(type == 'square'){
            pattern = this.create_square_pattern(sight_size);
        }else if(type == 'cross'){
            pattern = this.create_cross_pattern(sight_size);
        }else{
            console.log('未対応の視界パターン！！！');
            return null;
        }

        // 実際に見える位置だけ特定
        // [[-1, 0], [0, 0], [0, -1],,,]
        let result = [];
        let start = (sight_size - ((sight_size + 1) / 2)) * -1;
        let end = start * -1;
        for(let pattern_x = start; pattern_x <= end; pattern_x++){
            for(let pattern_y = start; pattern_y <= end; pattern_y++){
                // プレイヤーからの相対座標とパターンの絶対座標の変換
                let pattern_x_abs = pattern_x - start;
                let pattern_y_abs = pattern_y - start;
                // value == 1が見える位置
                let value = pattern.get_value(pattern_x_abs , pattern_y_abs);
                let dungeon_x_abs = x + pattern_x;
                let dungeon_y_abs = y + pattern_y;
                if(value == 1 && 
                  (0< dungeon_x_abs && dungeon_x_abs < this._width - 1) &&
                  (0< dungeon_y_abs && dungeon_y_abs < this._height - 1))
                  {
                    result.push([pattern_x, pattern_y]);
                  }
            }
        }

        return result;
    }

}

class MDMap { // [M]achi to [D]ungen no [Map]
    constructor(w, h, default_fill){
        this._width = w;
        this._height = h;
        this._default_fill = default_fill;

        // this._tile_info = {
        //     Black: { Type: 0, Color: 'rgb(0,0,0)' },
        //     Gray: { Type: 1, Color: 'rgb(150,150,150)' }
        // };

        this.map = [];
        
        this._init();
    }
    
    _init() {
        // 最初は全部見えない
        this.map = new Array(this._width * this._height).fill(this._default_fill);
    }

    update(x, y, value) {
        let i = this.convert_2dTo1d(x, y);
        this.map[i] = value;
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
    convert_2dTo1d(x, y) {
        return y * this._width + x;
    }
    
    // (x, y)の値を取得
    get_value(x, y) {
        var index = this.convert_2dTo1d(x, y);
        return (this.map[index]);
    }

    get_value_index(i) {
        return (this.map[i]);
    }
}

class Dungeon_Mask {

    constructor(w, h) {
        this._width = w;
        this._height = h;

        this._sight_info = {
            Black: { Type: 0, Color: 'rgb(0,0,60)' },
            Gray: { Type: 1, Color: 'rgb(150,150,150)' },
            Transparent: { Type: 2, Color: 'rgb(0,0,0,255)'}
        };

        // 前回の視界情報
        this._prev_x = 2;
        this._prev_y = 2;
        this._prev_sight_patterns = []; 

        this.mask = new MDMap(w, h, this._sight_info.Black.Type); 
        this._sight_pattern = new SightPattern(w, h);
    }
    
    display(dungeon, player_x, player_y) {
        console.log("Mask.display");

        for (let y = 1; y < this._height - 1; y++) {
            for (let x = 1; x < this._width - 1; x++) {
                
                let mask_value = this.mask.get_value(x, y);
                if (mask_value == this._sight_info.Black.Type) {
                    // 見たことのない場所
                    this._draw_tile(x, y, this._sight_info.Black.Type);
                }
                else if(mask_value == this._sight_info.Gray.Type){
                    // 一度見たことのある場所
                    let dungeon_value = dungeon.map.get_value(x, y);
                    if (dungeon_value == dungeon._tile_info.Treasure.Type) {//???? != treasure?
                        this._draw_tile(x, y, this._sight_info.Gray.Type);
                    }else if(dungeon_value == dungeon._tile_info.Air.Type) {
                        this._draw_tile(x, y, this._sight_info.Gray.Type);
                    }
                }
                else if(mask_value == this._sight_info.Transparent.Type){
                    // 視界がクリアな場所
                    // if (this._is_in_sight(x, y, player_x, player_y, -1)) {
                    //     continue;
                    // }
                }else{
                    alert('Dungeon_Mask: 変な値入ってます');
                }
            }
        }

        // why get_value() value == 0? 2021/08/14
        // console.log('display_mask: '+'dungeon_value(player) =' + dungeon.get_value(player_x, player_y));

    }

    // sight: 視界
    _is_in_sight(x, y, player_x, player_y, sight) {
        return x == player_x && y == player_y;
    }
    
    _get_tile_color(tile_type) {
        for (let item in this._sight_info) {
            if (this._sight_info[item].Type == tile_type)
                return this._sight_info[item].Color;
        }
        return this._sight_info.Bedrock.Color; // error
    }

    _draw_tile(x, y, tile_type) {
        let color = this._get_tile_color(tile_type);
        fill(color);

        rect(x * 20, y * 20, 20, 20);
    }

    // 視界を広げる
    // sight: 視界サイズ
    update(x, y, sight) {
        let patterns = this._sight_pattern.get_pattern(x, y, 'cross', sight);
        this.fill_prev_sight();
        this.fill_sight_pattern(x, y, patterns);
        this.store_sight_info(x, y, patterns);
    }


    // 前回の視界（透明）を灰色で埋める
    fill_prev_sight(){
        for(let pattern of this._prev_sight_patterns){
            this.mask.update(this._prev_x + pattern[0], this._prev_y + pattern[1], this._sight_info.Gray.Type);
        }
    }

    // 視界範囲を透明で塗りつぶす
    fill_sight_pattern(x, y, patterns){
        // [[-1, 0], [-1,-1],[0,-1],,,[0,1]] 視界あける位置リスト（補正値）
        for(let pattern of patterns){
            this.mask.update(x + pattern[0], y + pattern[1], this._sight_info.Transparent.Type);
        }
    }

    // 視界情報を保管
    store_sight_info(x, y, patterns){
        this._prev_x = x;
        this._prev_y = y;
        this._prev_sight_patterns = patterns;
    }
}

class Dungeon { 

    constructor(w, h, room_count, room_config, treasure_count, enemy_count) {
        this._width = w;
        this._height = h;
        this._room_count = room_count;
        this._room_config = room_config;
        
        this._tile_info = {
            Bedrock: {Type: -1, Color: 'rgb(0,0,0)'}, // 岩盤
            Air: { Type: 0, Color: 'rgb(255,255,255)' }, // 空間
            Wall: { Type: 1, Color: 'rgb(100,100,100)' }, // 壁
            Player: { Type: 2, Color: 'rgb(255,0,0)' }, // プレイヤー
            Treasure: { Type: 3, Color: 'rgb(0,255,0)'}, // 宝箱
            Enemy: { Type: 4, Color: 'rgb(192,149,103)'} // 宝箱
        };

        this.map = null;
        this._treasure_white_list = [];
        this._treasureList = null;

        this._enemy_white_list = [];
        this._enemyList = null;

        this._mask = new Dungeon_Mask(this._width, this._height);
        this._init();
        this._make();
        this._create_treasures(treasure_count);
        this._create_enemy(enemy_count);
    }

    _init() { 
        // 最初は全部壁で埋める
        this.map = new MDMap(this._width, this._height, this._tile_info.Wall.Type);

        // 岩盤で周囲を囲む
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                if (x == 0 || x == this._width - 1 || y == 0 || y == this._height - 1) {
                    this.fill_bedrock(x, y);
                }
            }
        }
    }

    display_mask(player_x, player_y) {
        this._mask.display(this, player_x, player_y);
    }
    
    update_mask(player_x, player_y, sight) {
        this._mask.update(player_x, player_y, sight);
    }
 
    display()  {
        console.log("dungeon.display");
        
        for (let y = 0; y < this._height; y++){
            for(let x=0; x < this._width; x++){
                this._draw_tile(x, y, this.map.get_value(x, y));
            }
        }
    }

    // プレイヤーを表示
    display_player(x, y) {
        this._draw_tile(x, y, this._tile_info.Player.Type);
    }

    display_treasures() {
        this._treasureList.display();
    }

    display_enemies() {
        this._enemyList.display();
    }
    
    display_treasure(x, y) {
        this._draw_tile(x, y, this._tile_info.Treasure.Type);
    }

    display_enemy(x, y) {
        this._draw_tile(x, y, this._tile_info.Enemy.Type);
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

    /* 部屋関係 */

    _make(){
        this._make_room(this._room_count);
    }

    _make_room(room_count) {
        console.log("_make_room");

        for (let count = 0; count < room_count; count++) {
            let w = this._get_random_range(this._room_config.min_width, this._room_config.max_width + 1);
            let h = this._get_random_range(this._room_config.min_height, this._room_config.max_height + 1);
            
            this._make_one_room(w, h);
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

    /* 宝箱関係 */
    _create_treasures(treasure_count){
        this._create_treasure_white_list();
        this._treasureList = new Treasure_List(this, treasure_count);
        this._dig_wall_in_treasure();
    }

    // 宝箱のホワイトリスト
    // 宝箱が重ならないように
    _create_treasure_white_list() {
        for (let y = 1; y < this._height - 1; y++) {
            for (let x = 1; x < this._width - 1; x++) {
                let index = this.map.convert_2dTo1d(x, y);
                this._treasure_white_list.push(index);
            }
        }
    }

    // 宝箱の位置の壁に穴をあける
    _dig_wall_in_treasure(){
        for(let treasure of this._treasureList.get()){
            this.dig_wall(treasure._position_x, treasure._position_y);
        }
    }

    /* 敵関係 */
    _create_enemy(enemy_count){
        this._create_enemy_white_list();
        this._enemyList = new Enemy_List(this, enemy_count);
        this._dig_wall_in_enemy();
    }

    // 宝箱のホワイトリスト
    // 宝箱が重ならないように
    _create_enemy_white_list() {
        for (let y = 1; y < this._height - 1; y++) {
            for (let x = 1; x < this._width - 1; x++) {
                let index = this.map.convert_2dTo1d(x, y);
                this._enemy_white_list.push(index);
            }
        }
    }

    // 宝箱の位置の壁に穴をあける
    _dig_wall_in_enemy(){
        for(let enemy of this._enemyList.get()){
            this.dig_wall(enemy._position_x, enemy._position_y);
        }
    }

    /* その他 */

    // 2 つの値の間のランダムな整数を得る min以上、max未満
    _get_random_range(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    // mapのx, yの位置を岩盤で埋める
    fill_bedrock(x, y) {
        this.map.update(x, y, this._tile_info.Bedrock.Type);
    }
    
    // mapのx, yの位置に空間を開ける
    dig_wall(x, y){
        let value = this.map.get_value(x, y);
        if (value == this._tile_info.Bedrock.Type) {
            return;
        }
        this.map.update(x, y, this._tile_info.Air.Type);
    }

    // 最初の空間座標を取得する
    get_first_air_index() {
        for (let i = 0; i < this._width * this._height; i++) {
            if (this.map.get_value_index(i) == this._tile_info.Air.Type) {
                return i;
            }
        }
    }
    
    // 岩盤以外のランダムな座標を取得
    get_random_index() {
        // 岩盤以外の座標
        let x = this._get_random_range(1, (this._width - 1));
        let y = this._get_random_range(1, (this._height - 1));

        let index = this.map.convert_2dTo1d(x, y);
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

    // 敵の座標をランダムに取得(被りなし)
    get_random_enemy_index() {
        let white_list_index = this._get_random_range(0, this._enemy_white_list.length);
        let map_index = this._enemy_white_list[white_list_index];
        // 使用済みの要素を削除
        this._enemy_white_list.splice(white_list_index, 1);
        
        return map_index;
    }

    is_bedrock(x, y) {
        let value = this.map.get_value(x, y);
        return (value == this._tile_info.Bedrock.Type);
    }
    
    is_wall(x, y) {
        let value = this.map.get_value(x, y);
        return (value == this._tile_info.Wall.Type);
    }

    // 宝箱関係
    is_exist_treasure(x, y) {
        return this._treasureList.is_exist_treasure(x, y);
    }
    
    is_opened_treasure(x, y) {
        return this._treasureList.is_opened_treasure(x, y);
    }
    
    open_treasure(x, y) {
        return this._treasureList.open_treasure(x, y);
    }

    // 敵関係
    is_exist_enemy(x, y) {
        return this._enemyList.is_exist_enemy(x, y);
    }

    attack_enemy(x, y) {
        return this._enemyList.attack_enemy(x, y);
    }

    attacked_enemy(x, y) {
        return this._enemyList.attacked_enemy(x, y);
    }

}
//----

class Player {

    constructor(my_dungeon) {
        this._dungeon = my_dungeon;
        this._position_x = 0;
        this._position_y = 0;

        this._sight_size = 5;

        this._make();

        this._stats = new Player_Stats();
    }

    _make() {
        console.log("player.make");
        
        let index = this._dungeon.get_random_index();
        // ToDo position.x, position.y にまとめたい
        this._position_x = this._dungeon.map.convert_1dTo2d_x(index);
        this._position_y = this._dungeon.map.convert_1dTo2d_y(index);
        this._dungeon.dig_wall(this._position_x, this._position_y);
        this._dungeon.update_mask(this._position_x, this._position_y, this._sight_size);
    }
    
    display() {
        console.log("player.display");

        // this._dungeon.display_dungeon();
        this._dungeon.display_player(this._position_x, this._position_y);
        this._stats.display();
    }

    // dir_x, dir_y: 移動量
    move(dir_x, dir_y) {
        let next_x = this._position_x + dir_x;
        let next_y = this._position_y + dir_y;

        if (this._dungeon.is_bedrock(next_x, next_y)) {
            // 行き先が岩盤の移動はなし
        } else if (this._dungeon.is_wall(next_x, next_y)) {
            // 行き先が壁の場合は掘る(移動はなし)
            this._dungeon.dig_wall(next_x, next_y);
            this._stats.add_dig_wall();
        } else {
            // 敵がいるか
            let is_exist_enemy = this._dungeon.is_exist_enemy(next_x, next_y);
            if(is_exist_enemy){
                let enemy = this._dungeon.attacked_enemy(next_x, next_y);
                if(!enemy.is_alive()){
                    this._stats.add_kill_enemy();
                }
                return;
            }
            // 進む
            this._position_x = next_x;
            this._position_y = next_y;
            this._stats.add_walk();
            this._dungeon.update_mask(next_x, next_y, this._sight_size); // 視界サイズ

            // 宝箱
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
        this._kill_enemies = 0;
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

    add_kill_enemy(){
        this._kill_enemies += 1;
    }
    
    display() {
        textAlign(LEFT, TOP);
        textSize(this._text_size);
        fill(this._text_color);

        text("歩数: " + this._walk, 0, 0);
        text("掘った数: " + this._dig_wall, 0, this._text_size);
        text("拾った宝箱: " + this._pickup_treasures, 0, this._text_size * 2);
        text("倒した敵: " + this._kill_enemies, 0, this._text_size * 3);
    }
}

class Treasure {

    constructor(my_dungeon) {
        this._dungeon = my_dungeon;
        
        this._position_x = 0;
        this._position_y = 0;
        this._opened = false;

        this._make();
    }

    _make() {
        console.log("treasure.make");

        // ランダム位置に配置(岩盤以外)
        let index = this._dungeon.get_random_treasure_index();

        this._position_x = this._dungeon.map.convert_1dTo2d_x(index);
        this._position_y = this._dungeon.map.convert_1dTo2d_y(index);
    }
    
    is_exist(x, y) {
        let is_exist = this._position_x == x && this._position_y == y;
        return is_exist;
    }

    is_opened() {
        return this._opened;
    }
    
    open() {
        this._opened = true;
    }

    display() {
        console.log("treasure.display");

        this._dungeon.display_treasure(this._position_x, this._position_y);
    }
}

class Treasure_List {

    constructor(my_dungeon, count) {
        this._dungeon = my_dungeon;
        this._count = count;
        this._treasureList = [];

        this._make();
    }

    _make() {
        for (let i = 0; i < this._count; i++) {
            this._treasureList.push(new Treasure(this._dungeon));
        }
    }

    get(){
        return this._treasureList;
    }

    get_treasure(x, y) {
        for (let i = 0; i < this._count; i++) {
            if (this._treasureList[i].is_exist(x, y)) {
                return this._treasureList[i];
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
        
        return treasure.is_opened();
    }
    
    open_treasure(x, y) {
        let treasure = this.get_treasure(x, y);
        if (treasure == null) {
            return false;
        }

        treasure.open();
    }
    
    display() {
        for (let i = 0; i < this._count; i++) {
            this._treasureList[i].display();
        }
    }
}

//------ Enemy

class Enemy {

    constructor(my_dungeon) {
        this._dungeon = my_dungeon;
        
        this._position_x = 0;
        this._position_y = 0;
        // 種族とかでhpとか制御したい
        // hp以外の属性も欲しい(火属性に弱いとか)
        this._hp = 5; 

        this._make();
    }

    _make() {
        console.log("enemy.make");

        // ランダム位置に配置(岩盤以外)
        let index = this._dungeon.get_random_enemy_index();

        this._position_x = this._dungeon.map.convert_1dTo2d_x(index);
        this._position_y = this._dungeon.map.convert_1dTo2d_y(index);
    }
    
    is_exist(x, y) {
        let is_exist = this._position_x == x && this._position_y == y;
        return is_exist;
    }

    attack() {
        console.log("enemy.attack 未実装");
    }

    attacked() {
        console.log("enemy.attacked");

        this._hp = 0;
        this._position_x = -1;
        this._position_y = -1;
    }

    is_alive(){
        return this._hp > 0;
    }

    display() {
        console.log("enemy.display");

        if(this.is_alive()){
            this._dungeon.display_enemy(this._position_x, this._position_y);
        }
    }
}

class Enemy_List {

    constructor(my_dungeon, count) {
        this._dungeon = my_dungeon;
        this._count = count;
        this._enemyList = [];

        this._make();
    }

    _make() {
        for (let i = 0; i < this._count; i++) {
            this._enemyList.push(new Enemy(this._dungeon));
        }
    }

    get(){
        return this._enemyList;
    }

    get_enemy(x, y) {
        for (let i = 0; i < this._count; i++) {
            if (this._enemyList[i].is_exist(x, y)) {
                return this._enemyList[i];
            }
        }

        return null;
    }

    is_exist_enemy(x, y) {
        let enemy = this.get_enemy(x, y);
        if (enemy == null)
            return false;
        
        return true;
    }
    
    // 未実装
    attack_enemy(x, y) {
        let enemy = this.get_enemy(x, y);
        if (enemy == null) {
            return false;
        }

        enemy.attack();
        return enemy;
    }

    attacked_enemy(x, y) {
        let enemy = this.get_enemy(x, y);
        if (enemy == null) {
            return false;
        }

        enemy.attacked();
        return enemy;
    }
    
    display() {
        for (let i = 0; i < this._count; i++) {
            this._enemyList[i].display();
        }
    }
}


//------- ------ main 

let canvasSize = 600;
let my_dungeon;
let my_player;
let my_sight_pattern;

function setup(){
    canvasSize=windowHeight;

    createCanvas(canvasSize, canvasSize);
    background(50, 100, 150);

    room_config = new Room_Config(2, 2, 4, 4);
    
    my_dungeon = new Dungeon(16, 16, 5, room_config, 10, 10);

    my_player = new Player(my_dungeon); // 空き部屋の一番左上
    
    my_sight_pattern = new SightPattern(16, 16);
    
    display_all();
}
 
function draw(){

}

function keyPressed() {
    if (key == 'w') { //up
        my_player.move(0, -1);
    } else if (key == 'a') { //left
        my_player.move(-1, 0);
    } else if (key == 's') { //right
        my_player.move(0, 1);
    } else if (key == 'd') { //down
        my_player.move(1, 0);
    }

    display_all();

    console.log("--------------------"+key);
}

function display_all() {
    my_dungeon.display();
    // my_objects.display_objects();
    // my_enemy.display_enemy();
    // my_treasure_list.display();
    my_dungeon.display_treasures();
    my_dungeon.display_enemies();
    // my_player.display();
    // my_player.display();
    
    my_dungeon.display_mask(my_player._position_x, my_player._position_y);

    my_player.display();

}