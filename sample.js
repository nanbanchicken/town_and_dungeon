// syumino programming
// https://www.youtube.com/channel/UClZj9tdR1TRkxglnaA55pJA
// twitter @Suminoprogramm1
// Nanban and Junji

///---- 2022/2/26

class MDMath {
    // 固定の方向に曲げてやる
    //let RotateRight = [[0, -1], [1, 0]]
    // 次回 MDMath.RotateRight作る
    // this.direction = MDMath.RotateRight(this.direction);
    // vector: {x, y}
    constructor(){
        this.rightMatrix = [[0, -1], [1, 0]];
        this.leftMatrix = [[0, 1], [-1, 0]];
    }

    rotateRight(vector){
        return this.productMaxtirx(this.rightMatrix, vector);
    }

    rotateLeft(vector){
        return this.productMaxtirx(this.leftMatrix, vector);
    }

    productMaxtirx(matrix, vector){
        let newX = matrix[0][0] * vector.x + matrix[0][1] * vector.y;
        let newY = matrix[1][0] * vector.x + matrix[1][1] * vector.y;
        return {x: newX, y: newY};
    }
}

function mdMathTest(){
    let right = {x: 1, y: 0};
    let down = {x: 0, y: 1};
    let left = {x: -1, y: 0};
    let up = {x: 0, y: -1};

    let case1 = {data: right, resultRight: down, resultLeft: up };
    // let case2 = {data: down, resultRight: left, resultLeft: right };
    // let case3 = {data: left, resultRight: up, resultLeft: down };
    // let case4 = {data: up, resultRight: right, resultLeft: left };

    let mdMath = new MDMath();
    let case1RightResult = mdMath.rotateRight(case1.data);
    let case1LeftResult = mdMath.rotateLeft(case1.data);
    if(case1RightResult.x != case1.resultRight.x || case1RightResult.y != case1.resultRight.y) {
        console.log(`右に曲がってないよ: ${JSON.stringify(case1.data)} -> ${JSON.stringify(case1RightResult)}`);
    }else{
        console.log(`右OK: ${case1.data} -> ${case1RightResult}`);
    }
    if(case1LeftResult.x != case1.resultLeft.x || case1LeftResult.y != case1.resultLeft.y) {
        console.log(`左に曲がってないよ: ${JSON.stringify(case1.data)} -> ${JSON.stringify(case1LeftResult)}`);
    }else{
        console.log(`左OK: ${case1.data} -> ${case1LeftResult}`);
    }
}

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

        // world.tile_info = {
        //     Black: { Type: 0, Color: 'rgb(0,0,0)' },
        //     Gray: { Type: 1, Color: 'rgb(150,150,150)' }
        // };

        // タイルタイプ(int)を保持
        this.map = [];
        
        this._init();
    }
    
    _init() {
        // 最初は全部見えない
        this.map = new Array(this._width * this._height).fill(this._default_fill);
    }

    // タイルの値を更新, set_valueと同等
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
        return this.map[index];
    }

    get_value_index(i) {
        return this.map[i];
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
                    if (dungeon_value == world.tile_info.Treasure.Type) {//???? != treasure?
                        this._draw_tile(x, y, this._sight_info.Gray.Type);
                    }else if(dungeon_value == world.tile_info.Air.Type) {
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

class World {

    tile_info = {
        Bedrock: {Type: -1, Color: 'rgb(0,0,0)'}, // 岩盤
        Air: { Type: 0, Color: 'rgb(255,255,255)' }, // 空間
        Wall: { Type: 1, Color: 'rgb(100,100,100)' }, // 壁
        Player: { Type: 2, Color: 'rgb(255,0,0)' }, // プレイヤー
        Treasure: { Type: 3, Color: 'rgb(0,255,0)'}, // 宝箱
        Enemy: { Type: 4, Color: 'rgb(192,149,103)'}, // 敵
        // 魔法の石
        R: { Type: 100, Color: 'rgb(255,125,125)'}, // 右魔法石 薄い赤
        L: { Type: 101, Color: 'rgb(125,125,255)'}, // 左魔法石 薄い青
        B: { Type: 102, Color: 'rgb(125,0,125)'},   // 破壊石　紫
        C: { Type: 103, Color: 'rgb(255,255,0)'},   // 回復石 黄
    };

}
// world.tile_info
// world.tile_info['B'].Type
// world.tile_info.B.Type
let world = new World();

class Dungeon { 

    constructor(w, h, room_count, room_config, treasure_count, enemy_count) {
        this._width = w;
        this._height = h;
        this._room_count = room_count;
        this._room_config = room_config;

        this.map = null;
        this._treasure_white_list = [];
        this._treasureList = null;

        this._enemy_white_list = [];
        this._enemyList = null;

        this._stoneList = [];

        this._mask = new Dungeon_Mask(this._width, this._height);
        this._init();
        this._make();
        this._create_treasures(treasure_count);
        this._create_enemy(enemy_count);
    }

    _init() { 
        // 最初は全部壁で埋める
        // this.map = new MDMap(this._width, this._height, world.tile_info.Wall.Type);
        this.map = new MDMap(this._width, this._height, world.tile_info.Air.Type);

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
                this._draw_tile(x, y, this.get_value(x, y));
            }
        }
    }

    get_value(x, y){
        // TODO
        // mapオブジェクトと、enemy, treasure の優先度を考える
        //
        // 済 dungeon.map, enemy_list, treasure_list, magic_stone_listを参照して値を返す
        // 済 これはenemy, treasureを見てない
        // 済 magic_stone_listはまだない(マップに値を直接挿入している)
        if(this._treasureList.is_exist_treasure(x, y)){
            return world.tile_info.Treasure.Type;
        }
        else if(this._enemyList.is_exist_enemy(x, y)){
            return world.tile_info.Enemy.Type;
        }

        return this.map.get_value(x, y);
    }

    // プレイヤーを表示
    display_player(x, y) {
        this._draw_tile(x, y, world.tile_info.Player.Type);
    }

    display_air(x, y) {
        this._draw_tile(x, y, world.tile_info.Air.Type);
    }

    display_stone(x, y, stone_animation) {
        this._draw_tile(x, y, stone_animation.property);
    }

    display_treasures() {
        this._treasureList.display();
    }

    display_enemies() {
        this._enemyList.display();
    }
    
    display_treasure(x, y) {
        this._draw_tile(x, y, world.tile_info.Treasure.Type);
    }

    display_enemy(x, y) {
        this._draw_tile(x, y, world.tile_info.Enemy.Type);
    }

    // 魔法石を置く
    add_stone(x, y, stone_animation){
        // stoneListは現状他で参照していない
        this._stoneList.push({x: x, y: y, property: stone_animation.property});
        this.map.update(x, y, stone_animation.property);
    }

    // 

    _get_tile_color(tile_type) {
        for (let item in world.tile_info) {
            if (world.tile_info[item].Type == tile_type)
                return world.tile_info[item].Color;
        }
        return world.tile_info.Bedrock.Color; // error
   
    }

    _draw_tile(x, y, tile_type) {
        let color = this._get_tile_color(tile_type);
        fill(color);

        if (tile_type == world.tile_info.Player.Type) {
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
        this._treasureList = new TreasureList(this, treasure_count);
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
        this._enemyList = new EnemyList(this, enemy_count);
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
        this.map.update(x, y, world.tile_info.Bedrock.Type);
    }
    
    // mapのx, yの位置に空間を開ける
    dig_wall(x, y){
        let value = this.map.get_value(x, y);
        if (value == world.tile_info.Bedrock.Type) {
            return;
        }
        this.map.update(x, y, world.tile_info.Air.Type);
    }

    // 最初の空間座標を取得する
    get_first_air_index() {
        for (let i = 0; i < this._width * this._height; i++) {
            if (this.map.get_value_index(i) == world.tile_info.Air.Type) {
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
        return (value == world.tile_info.Bedrock.Type);
    }
    
    is_wall(x, y) {
        let value = this.map.get_value(x, y);
        return (value == world.tile_info.Wall.Type);
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

class MDObject{

    // color: str 'rgb(0,0,60)'
    constructor(my_dungeon, color) {
        this._dungeon = my_dungeon;
        
        this._position_x = 0;
        this._position_y = 0;

        this._color = null;
    }

    make() {
    }

    is_exist(x, y) {
        let is_exist = (this._position_x == x && this._position_y == y);
        return is_exist;
    }
    
    display() {
        console.log("MDObject.display");

        // 色情報を一緒に与えられるといいな
        // this._dungeon.display(this._position_x, this._position_y, this.color);
    }
}

class MDObjectList{

    constructor(my_dungeon, count) {
        this._dungeon = my_dungeon;
        this._count = count;
        this._object_list = []; //is_exist()を持つものにかぎる/MDobjectの継承クラスに限る

        this._make();
    }

    // Enemyとかをコピーできるはず
    _make() {
        // for (let i = 0; i < this._count; i++) {
        //     new_md_object = Object.assign({}, md_object);
        //     new_md_object.make();
        //     this._object_list.push(new_md_object);
        // }
    }

    get(){
        return this._object_list;
    }

    get_md_object(x, y) {
        for (let i = 0; i < this._count; i++) {
            if (this._object_list[i].is_exist(x, y)) {
                return this._object_list[i];
            }
        }

        return null;
    }

    is_exist( x, y) {
        let md_object = this.get_md_object(x, y);
        if (md_object == null)
            return false;
        
        return true;
    }
    
    display() {
        for (let i = 0; i < this._count; i++) {
            this._object_list[i].display();
        }
    }
}

class Player {

    constructor(my_dungeon) {
        this._dungeon = my_dungeon;
        this._hp = 10;
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

    is_alive(){
        return hp > 0;
    }

    // ダメージを与える場合は -1 (<0)
    // 回復させる場合は +value (>0)
    update_hp(damage){
        this._hp += damage;
        return this;
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
        // テスト用に追加
        text("石の飛距離: " + stone_distance, 0, this._text_size * 4);
    }
}

class Treasure extends MDObject{

    constructor(my_dungeon) {
        super(my_dungeon, null);

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

    is_opened() {
        return this._opened;
    }
    
    open() {
        this._opened = true;
    }

    display(){
        console.log("treasure.display");

        this._dungeon.display_treasure(this._position_x, this._position_y);
    }
}

class TreasureList extends MDObjectList{

    constructor(my_dungeon, count) {
        super(my_dungeon, count);
        this._make();
    }

    _make(){
        for (let i = 0; i < this._count; i++) {
            this._object_list.push(new Treasure(this._dungeon));
        }
    }

    get_treasure(x, y){
        return this.get_md_object(x, y);
    }

    is_exist_treasure(x, y){
        return this.is_exist(x, y);
    }

    is_opened_treasure(x, y) {
        let treasure = this.get_treasure(x, y);
        if (treasure == null)
            return false;
        
        return treasure.is_opened(); // Treasure が is_opend()を持ってる前提
    }
    
    open_treasure(x, y) {
        let treasure = this.get_treasure(x, y);
        if (treasure == null) {
            return false;
        }

        treasure.open();
    }
}

//------ Enemy

class Enemy extends MDObject {

    constructor(my_dungeon) {
        super(my_dungeon, null);
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
    
    attack() {
        console.log("enemy.attack 未実装");
    }

    attacked(damage) {
        console.log("enemy.attacked");

        this._hp += damage;
        if (!this.is_alive()){
            this._position_x = -1;
            this._position_y = -1;
        }
    }

    is_alive(){
        return this._hp > 0;
    }

    display(){
        console.log("enemy.display");

        if(this.is_alive){
            this._dungeon.display_enemy(this._position_x, this._position_y);
        }
    }
}

class EnemyList extends MDObjectList {

    constructor(my_dungeon, count){
        super(my_dungeon, count);
        this._make();
    }

    _make(){
        for (let i = 0; i < this._count; i++) {
            this._object_list.push(new Enemy(this._dungeon));
        }
    }

    get_enemy(x, y){
        return this.get_md_object(x, y);
    }

    is_exist_enemy(x, y){
        return this.is_exist(x, y);
    }

    // enemyがtargetに攻撃する
    attack_enemy(x, y, target) {
        let enemy = this.get_enemy(x, y);
        if (enemy == null) {
            return false;
        }

        enemy.attack(target);
        return enemy;
    }

    // enemyがtarget?攻撃される
    attacked_enemy(x, y, damage) {
        let enemy = this.get_enemy(x, y);
        if (enemy == null) {
            return false;
        }

        enemy.attacked(damage);
        return enemy;
    }
}


// 10/30 コントローラはモデルにまとめました
//class MDObjectController{

    // constructor() {
    // }

    // is_exist(md_object, x, y) {
    //     let is_exist = (md_object._position_x == x && md_object._position_y == y);
    //     return is_exist;
    // }
    
    // display(md_object) {
    //     console.log("MDObjectController.display");

    //     if(md_object._is_visible){
    //         md_object._dungeon.display(md_object._position_x, md_object._position_y);
    //     }
    // }
//}

// class MDObjectListController{
    
//     constructor() {
//     }

//     get_md_object(md_object_list, x, y) {
//         for (let i = 0; i < md_object_list._count; i++) {
//             if (md_object_list._object_list[i].is_exist(x, y)) {
//                 return this._object_list[i];
//             }
//         }

//         return null;
//     }

//     is_exist(md_object_list, x, y) {
//         let md_object = this.get_md_object(md_object_list, x, y);
//         if (md_object == null)
//             return false;
        
//         return true;
//     }
    
//     display(md_object_list) {
//         for (let i = 0; i < md_object_list._count; i++) {
//             md_object_list[i].display();
//         }
//     }
// }

class MagicAnimation{
    // 魔法のアニメーションを描画する
    constructor(dungeon, animation_data_list){
        this.dungeon = dungeon;
        this.animation_data_list = animation_data_list;
        // animation_data = [
        //     {property: world.tile_info.B.Type, route: [{x: 1, y: 2}, {x: 1, y: 3}], speed: 100},
        //     {property: world.tile_info.B.Type, route: [{x: 1, y: 2}, {x: 1, y: 3}, , {x: 1, y: 5}], speed: 100},
        // ]
        this.draw_magic();
    }

    async draw_magic(){
        console.log(`draw_magic -> ${JSON.stringify(this.animation_data_list)}`);
        // 魔法を石のリストにした時に使う
        // for (let i = 0; i < this.animation_data_list.length; i++) {
        //     console.log('draw_magic:loop');
        //     const stone = this.animation_data_list[i];
        //     await this.draw_stone();
        //     this.erase_trajectory();
        // }
        // 今は石一つしかないのでforしない
        const stone_animation = this.animation_data_list;
        await this.draw_stone(stone_animation);
    }

    async draw_stone(stone_animation){ // stone_animation.route = [p1, p2, ... pn]
        console.log('draw_stone:');
        let prev_position = null;
        for (let i = 0; i < stone_animation.route.length; i++) {
            if(prev_position != null){
                // 前回配置した石のアニメを消す
                this.dungeon.display_air(prev_position.x, prev_position.y);    
            }

            const position = stone_animation.route[i]; // {x: 1, y: 2}
            prev_position = position;
            this.dungeon.display_stone(position.x, position.y, stone_animation);
            console.log('draw_stone loop');
            // アニメフレーム待機
            await this.sleep(stone_animation.speed);
        }
        
        // ダンジョンに石を配置
        if(stone_animation.route.length == 0){ return; } 
        // if(ston.property == 'B'){ return; }  // 将来有効化 デバッグ用に破壊石もマップに配置する
        let last_position = stone_animation.route[stone_animation.route.length - 1];
        this.dungeon.add_stone(last_position.x, last_position.y, stone_animation);
    }

    // https://editor.p5js.org/RemyDekor/sketches/9jcxFGdHS
    sleep(millisecondsDuration)
    {
        return new Promise((resolve) => {
            setTimeout(resolve, millisecondsDuration);
        })
    }

    erase_trajectory(){

    }
}

class MagicAnimationData{
    constructor(property, speed){
        this.property = property; // R, L...
        this.route = []; // [{x: 1, y: 2}, {x: 1, y: 3}] // 石の位置(経路)
        this.speed = speed; // 5 描画時間(ms) 
    }

    push(postion_x, position_y){
        this.route.push({x: postion_x, y: position_y});
    }

    last(){
        if (this.route.length == 0){return null;}
        return this.route[this.route.length - 1];
    }
}

class Stone{
    constructor(property, cost, damage, maxDistance){
        this.property = property; // R, L, B(tile_info)
        this.cost = cost; // 実行コスト
        this.damage = damage;
        this.maxDistance = maxDistance; // 飛行距離

        this.leftDistance = maxDistance; // 残りの距離
        this.position = null; // {x, y}
        this.direction = null; // {x, y}
    }

    // 2021/12/18 うごいた！
    // leftDistance にバグあり。１つ遠くまで飛ぶよ。
    // 2022/1/22 なおったよ！(置くのをあとにしたよ)
    // （元execute) 魔法石の飛ぶルート/magic_animatiion_dataを返す
    calc_route(dungeon, position, direction){
        let magic_animation_data = new MagicAnimationData(this.property, 300);

        console.log('Stone.calc_route : ')
        this.position = position;
        this.direction = direction;
        let watchDogCount = 0; // 進んだ距離 反射がループしているか監視

        while (this.leftDistance >= 0) {
            let next = {
                x: this.position.x + this.direction.x,
                y: this.position.y + this.direction.y
            };
    
            let nextTile = dungeon.get_value(next.x, next.y);
            console.log(`反射ありの経路計算 次のタイル: ${nextTile}`);
            switch (nextTile) {
                case world.tile_info.Air.Type:
                    this.leftDistance -= 1;
                    this.position = {x: next.x, y: next.y};
                    magic_animation_data.push(next.x, next.y);
                    watchDogCount = 0;
                    console.log(`石を進める Pos:${JSON.stringify(this.position)} LeftDist: ${this.leftDistance}`);
                    break;
                case world.tile_info.Bedrock.Type:
                case world.tile_info.Wall.Type:
                case world.tile_info.R.Type:
                case world.tile_info.B.Type:
                case world.tile_info.Enemy.Type:
                case world.tile_info.Treasure.Type:
                    // 将来的に破壊石はマップに配置されない
                    // 固定の方向= 右に曲げてやる
                    let newDirection = my_mdMath.rotateRight(this.direction);
                    this.direction = newDirection;
                    watchDogCount+=1;
                    if(this.IsRefrectLoop(watchDogCount)){
                        console.log("石の反射が無限ループ");
                        return;
                    }
                    break;
                case world.tile_info.L.Type:
                    // 左に曲げる
                    this.direction = my_mdMath.rotateLeft(this.direction);
                    watchDogCount+=1;
                    if(this.IsRefrectLoop(watchDogCount)){
                        console.log("石の反射が無限ループ");
                        return;
                    }
                    break;
                case world.tile_info.Player.Type:
                    // ブレイクさせる
                    break;
                default:
                    console.log('Stone::calc_route 次タイルの判定に失敗しました。');
                    break;
            }

            
        }

        if(this.property == world.tile_info.B.Type)
        {
            let nextTile = null;
            while(true){
                // 破壊石 直線で何かに当たるまで経路計算
                let next = {
                    x: this.position.x + this.direction.x,
                    y: this.position.y + this.direction.y
                };

                nextTile = dungeon.get_value(next.x, next.y);
                console.log(`反射"なし"の経路計算 次のタイル: ${nextTile}`);
                
                this.position = {x: next.x, y: next.y};
                magic_animation_data.push(next.x, next.y);
                
                // Air, Treasure はスルー、それ以外衝突
                // magic_animation_data の最後は、当たった相手の座標
                if (![world.tile_info.Air.Type, world.tile_info.Treasure.Type].includes(nextTile)){
                    console.log(`破壊石が衝突 Pos:${JSON.stringify(this.position)}`);
                    break;
                }
                console.log(`破壊石を進める Pos:${JSON.stringify(this.position)}`);
            }
        }

        return magic_animation_data;
    }

    // 反射がループしているか
    IsRefrectLoop(dogCount){
        let limit = 4;
        return dogCount > limit;
    }
}

class Magic{
    constructor(player, dungeon, maxLength){
        this._player = player;
        this._dungeon = dungeon;
        this.stones = [];
        this.maxLength = 5; // 石を入れられる数
    }

    //m : [l3, l4, l5]
    // m.push([r7,r9,r10])
    // m仮: [l3, l4, l5, r7,r9,r10]
    // m: [l3, l4, l5, r7,r9]

    // 複数の石を入れる
    pushStones(stones){ //次回やりましょう！
        stones.forEach(s => {
            this.pushStone(s);
        });
    }

    // 一つの石を入れる
    pushStone(stone){
        if(this.stones.length < this.maxLength){
            this.stones.push(stone);
        } 
        // はいらないよー処理
    }

    // 魔法の実行
    // playerPosition (x, y)
    // playerDirection vector(x=1, y=0) 右を向いているとき
    execute(dungeon, playerPosition, playerDirection){
        // コストの計算

        for (const stone of stones) {
            // マップの情報、向いている方向が必要
            let next_x = playerPosition.x + playerDirection.x;
            let next_y = playerPosition.y + playerDirection.y;
            dungeon.map.get_value()

            // 経路計算

            // マップ情報の更新

            // 石の配置

            // ダメージ計算
        }
    }

    // 対象物のHPを増減
    // magic_animation_data(石の移動経路全体)は将来的に引数から外すかもしれない
    doBreak(stone, magic_animation_data){
        if(magic_animation_data == null){return;}
        let target = magic_animation_data.last();
        let targetTile = this._dungeon.get_value(target.x, target.y);

        // 別の関数の話
        // ブレイク石の場合はマップに配置しない(現在配置しているので、石の種類を見て調整する必要がある)

        switch (targetTile) {
            case world.tile_info.Wall.Type:
                this._dungeon.dig_wall(target.x, target.y);
                // 壁を破壊
                break;
            case world.tile_info.R.Type:
            case world.tile_info.L.Type:
                // 将来的に石はダンジョンに直配置しない(宝箱などと同じ)場合は削除対象を変更する必要がある
                this._dungeon.dig_wall(target.x, target.y);
                // 石を破壊
                break;
            case world.tile_info.B.Type:
                // 本来マップに存在しない
                // とりあえず破壊
                break;
            case world.tile_info.Enemy.Type:
                // 敵にダメージ
                let enemy = this._dungeon._enemyList.attacked_enemy(target.x, target.y, stone.damage);
                if(!enemy.is_alive()){
                    this._player._stats.add_kill_enemy();
                }
                break;
            case world.tile_info.Player.Type:
                // 自分にダメージ？
                break;
            case world.tile_info.Air.Type:
            case world.tile_info.Treasure.Type:
            case world.tile_info.Bedrock.Type:
                // 何もしない
                break;
            default:
                console.log(`破壊処理 不正なタイルタイプ ${targetTile}`);
                break;
        }
    }
}

//------- ------ main 

let canvasSize = 600;
let my_dungeon;
let my_player;
let my_sight_pattern;
let my_mdMath;

function setup(){
    my_mdMath = new MDMath();

    canvasSize=windowHeight;

    createCanvas(canvasSize, canvasSize);
    background(50, 100, 150);

    room_config = new Room_Config(2, 2, 4, 4);
    
    my_dungeon = new Dungeon(16, 16, 5, room_config, 10, 10);

    my_player = new Player(my_dungeon); // 空き部屋の一番左上
    
    my_sight_pattern = new SightPattern(16, 16);
    
    display_all();

    // 継承が使えるかな？
    //    var test = new MainClass('hoge', 30);
    //    console.log('debug1:');
    //    test.output_log();
    //    console.log('debug2:');
    //    test.output_name();
    //    console.log(test.get_name());
}
 
function draw(){

}

let stone_distance = 5;
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

    // 魔法のテストったらテスト
    let animation_data = null;
    let stone = null;
    let stone_damage = -3;
    if (key == 'r'){
        // 右石
        stone = new Stone(world.tile_info.R.Type, 0, stone_damage, stone_distance);
        animation_data = stone.calc_route(my_dungeon, 
            {x: my_player._position_x, y: my_player._position_y},
            {x: 1, y: 0});
        console.log('Migi uchi!');
    }else if(key == 'l'){
        // 左石
        stone = new Stone(world.tile_info.L.Type, 0, stone_damage, stone_distance);
        animation_data = stone.calc_route(my_dungeon, 
            {x: my_player._position_x, y: my_player._position_y},
            {x: 1, y: 0});
        console.log('Left uchi!');
    }else if(key == 'b'){
        // 攻撃石
        stone = new Stone(world.tile_info.B.Type, 0, stone_damage, stone_distance);
        animation_data = stone.calc_route(my_dungeon, 
            {x: my_player._position_x, y: my_player._position_y},
            {x: 1, y: 0});
        console.log('Break uchi!');
    }else if(!isNaN(key) && key != ' '){
        // 数値 石の飛距離変更
        stone_distance = Number(key);
        console.log(`Changed distance=${stone_distance}`);
    }

    display_all();
    
    if(animation_data != null){
        let magic_animation = new MagicAnimation(my_dungeon, animation_data);
        magic_animation.draw_magic();
        // 破壊するのは将来的には、Magic.execute()で。
        if(stone.property == world.tile_info.B.Type){
            magic = new Magic(my_player, my_dungeon, 5);
            magic.doBreak(stone, animation_data);
        }
    }

    console.log("--------------------" + key);
}

function display_all() {
    my_dungeon.display();
    // my_objects.display_objects();
    // my_enemy.display_enemy();
    // my_treasurelist.display();
    my_dungeon.display_treasures();
    my_dungeon.display_enemies();
    // my_player.display();
    // my_player.display();
    
    // マスクの描画
    // my_dungeon.display_mask(my_player._position_x, my_player._position_y);
 
    my_player.display();

}