// syumino programming
// https://www.youtube.com/channel/UClZj9tdR1TRkxglnaA55pJA
// twitter @Suminoprogramm1
// Nanban and Junji

class GameManager {

    game_status_type = {
        Clear: Symbol(0),
        Over: Symbol(1),
        Play: Symbol(2),
    }

    constructor(){
        this._game_status = this.game_status_type.Play;
        this._restart_text = "\n\nキーを入力してリスタートしてみよう！";
    }

    is_game_over(){
        const status = this._game_status == this.game_status_type.Over;
        return status;
    }

    is_game_clear(){
        const status = this._game_status == this.game_status_type.Clear;
        return status;
    }

    game_over(){
        this._game_status = this.game_status_type.Over;
        this.display_game_over();
    }

    game_clear(){
        this._game_status = this.game_status_type.Clear;
        this.display_game_clear();
    }

    game_init(){
        this._game_status = this.game_status_type.Play;
        // TODO: 再開ではなく最初からプレイさせたい
    }

    display_game_over(){
        alert(`ゲームオーバーしたよー${this._restart_text}`);
    }

    display_game_clear(){
        alert(`ゲームクリアだよーーめでたいぞ～～～！！${this._restart_text}`);
    }
}

class World {

    tile_info = {
        Bedrock: {Type: -1, Color: 'rgb(0,0,0)'}, // 岩盤
        Air: { Type: 0, Color: 'rgb(255,255,255)' }, // 空間
        Wall: { Type: 1, Color: 'rgb(100,100,100)' }, // 壁
        Player: { Type: 2, Color: 'rgb(255,0,0)' }, // プレイヤー
        Treasure: { Type: 3, Color: 'rgb(0,255,0)'}, // 宝箱
        Enemy: { Type: 4, Color: 'rgb(255,140,103)'}, // 敵
        // 魔法の石
        R: { Type: 100, Color: 'rgb(255,125,125)'}, // 右魔法石 薄い赤
        L: { Type: 101, Color: 'rgb(125,125,255)'}, // 左魔法石 薄い青
        B: { Type: 102, Color: 'rgb(125,0,125)'},   // 破壊石　紫
        C: { Type: 103, Color: 'rgb(255,255,0)'},   // 回復石 黄
    };

    item_category = {
        Weapon: Symbol(0),
        Stone: Symbol(1),
        Misc: Symbol(2)
    }

    assets = {
        Images: {
            Enemies: {
                Slime: {
                    Cache: null, // 全体画像のキャッシュ assets.Image.Enemies.Slime.Cache
                    SouceSize: 400, // 1画像の大きさ
                    Yowai : {
                        Index: 0,
                        Position: null, // MDPoint
                    }
                }
            },
            Treasure: {
                Cache: null, //assets.Image.Tresure.Cache
                SouceSize: 400, // 1画像の大きさ
                Close: {
                    Index: 0,
                    Position: null, // MDPoint
                },
                Open: {
                    Index: 7,
                    Position: null, // MDPoint
                }
            }
        }
    }
}
// world.assets.Images.Enemies['スライム']

// world.tile_info
// world.tile_info['B'].Type
// world.tile_info.B.Type
let world = new World();

class MDPoint {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(point){
        let result = new MDPoint(this.x + point.x, this.y + point.y);
        return result;
    }

    sub(point){
        let result = new MDPoint(this.x - point.x, this.y - point.y);
        return result;
    }

    set(x, y){
        this.x = x;
        this.y = y;
    }

    copy(){
        return new MDPoint(this.x, this.y);
    }

    equal(point){
        return (this.equal_x(point) && this.equal_y(point));
    }

    equal_x(point){
        return (this.x == point.x);
    }

    equal_y(point){
        return (this.y == point.y);
    }

    to_string(){
        return `x: ${this.x} y: ${this.y}`;
    }
}

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
        return new MDPoint(newX, newY);
    }
}

// 武器
// attack: double
// durability: int
// attribute: enumで入れたい(無属性、炎属性...)
class MDItemWeapon {
    constructor(attack, durability, attribute){
        this.attack = attack;
        this.durability = durability;
        this.attribute = attribute;
    }
}

// 将来的にStoneクラスの名前をMDItemStoneに変更する
class MDItemStone {
    /**
     * 魔法石を初期化
     * @param {tile_info} property 石の属性 ex. world.tile_info.R.Type
     * @param {int} cost 実行コスト
     * @param {int} damage 攻撃力(回復の場合は負の値)
     * @param {int} maxDistance 石の飛距離
     */
    constructor(property, cost, damage, maxDistance){
        this.property = property; // R, L, B(tile_info)
        this.cost = cost; // 実行コスト
        this.damage = damage;
        this.maxDistance = maxDistance; // 飛行距離

        this.leftDistance = maxDistance; // 残りの距離
        this.position = new MDPoint(0, 0);
        this.direction = new MDPoint(0, 0);
    }

    // 2021/12/18 うごいた！
    // leftDistance にバグあり。１つ遠くまで飛ぶよ。
    // 2022/1/22 なおったよ！(置くのをあとにしたよ)
    // （元execute) 魔法石の飛ぶルート/magic_animatiion_dataを返す
    // position: MDPoint 石の初期位置
    // direction: MDPoint 石の飛ぶ方向
    calc_route(dungeon, position, direction){
        let magic_animation_data = new MagicAnimationData(this.property, 300);

        console.log('Stone.calc_route : ')
        this.position = position.copy(); //石をプレイヤ位置を分離して生成
        this.direction = direction.copy();
        let watchDogCount = 0; // 進んだ距離 反射がループしているか監視

        while (this.leftDistance >= 0) {
            let next = this.position.add(this.direction);
    
            let nextTile = dungeon.get_value(next);
            console.log(`反射ありの経路計算 次のタイル: ${nextTile}`);
            switch (nextTile) {
                case world.tile_info.Air.Type:
                    this.leftDistance -= 1;
                    this.position.set(next.x, next.y);
                    magic_animation_data.push(next);
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
                let next = this.position.add(this.direction);
                nextTile = dungeon.get_value(next);
                console.log(`反射"なし"の経路計算 次のタイル: ${nextTile}`);
                
                this.position.set(next.x, next.y);
                magic_animation_data.push(next);
                
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

// とりあえず消耗品
class MDItemMisc { // miscellaneous
    constructor(hoge, durability){
        this.hoge = hoge;
        this.durability = durability; // 持続時間的ななにか
    }
}

// プレイヤーやダンジョンに登場するアイテムを扱う
// name: str
// rarity: enum
// item: MDItemWeapon, MDItemStone, MDItemMisc
class MDItem {
    constructor(name, rarity, item){
        this.name = name;
        this.rarity = rarity;
        this.item = item;
        this.type = typeof item;
    }
}

// size: int インベントリサイズ
// items: null | array[MDItem] インベントリに入れておきたいアイテム
class MDInventory {
    constructor(size, items) {
        this.inventory = new Array(size).fill(null);
        if(items != null){ this.add_range(items); }
    }

    // インベントリ容量
    get size(){
        return this.inventory.length;
    }

    // item: MDItem
    // return: bool 追加に成功したか
    // [a,b,null,null] -> null_index = 2
    // [a,null,b,null] -> null_index = 1
    // [a,b,c,d] -> null_index == -1 // can't add item
    add(item){
        let null_index = this.inventory.indexOf(null);
        let can_add_item = (null_index > -1);
        if(can_add_item){
            this.inventory[null_index] = item;
        }

        return can_add_item;
    }

    // null, MDItem1, MDItem2, null, null
    // 新しいアイテムが入ってきたら
    // MDItem3, MDItem1, MDItem2, null, null
    // ちょっと気になるアイテムがあるから目立つ位置に移動させる（ユーザが手動で
    // null, MDItem1, MDItem2, null, MDItem3
    // あ、アイテムがいっぱいだ！要らないアイテムは何？
    // MDItem1, MDItem2, MDItem3, null, null

    // items: array[MDItem]
    // return: array[MDItem] 追加できなかったアイテム
    // ex.
    // inventory = [hoge, null, null]
    // add_inventory([piyo]);
    // inventory = [hoge, piyo, null]
    add_range(items){
        let failds = [];
        if(items == null){ return []; }

        // inventory = [hoge1, null, hoge2]の時にhoge2まで処理が進むかチェックすること
        items.forEach(item => {
            if(item == null){ return; } //へーやるじゃん（じゅんちゃん）
            
            let isSuccess = this.add(item);
            if(!isSuccess){ failds.push(item); }
        });

        return failds;
    }

    // 配列を上書き
    // ex.
    // inventory = [hoge, null, null]
    // set_inventory([piyo])
    // inventory = [piyo, null, null]
    // set_inventory([piyo, momo])
    // inventory = [piyo, momo, null]
    set_range(items){
        this.inventory = new Array(this.size).fill(null);
        let failds = this.add_range(items);
        return failds;
    }
    
    /**
     * インベントリ内のアイテムをすべてリストで取得
     * @return {[MDItem]} アイテム配列
     */
    get_items(){
        return this.inventory;
    }

}

// item1 = new MDItem("ring1", "5", new MDItemWeapon(...));

// foreach item itemcontainer{
//    if(item.type == "yakuso"){
//        player.drink(item2);
//    }
// }

class MDUtility {
    // 2 つの値の間のランダムな整数を得る min以上、max未満
    static get_random_range(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }
}

function mdMathTest(){
    let right = new MDPoint(1, 0);
    let down = new MDPoint(0, 1);
    let left = new MDPoint(-1, 0);
    let up = new MDPoint(0, -1);

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
        // min = new MDPoint(min_width, min_hight)
        // min = new MDBounds(min_width, min_hight)
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
            let position = new MDPoint(0, 0);
            for(position.x = 0; position.x < sight_size; position.x += 1){
                for(position.y = 0; position.y < sight_size; position.y += 1){
                    if(Math.abs(position.x - mid_index) + Math.abs(position.y - mid_index) <= mid_index){
                        pattern.update(position, 1);
                    }
                }
            }
        }
        
        return pattern;
    }

    // player_position: MDPoint
    get_pattern(player_position, type, sight_size){
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
        let position = new MDPoint(0, 0);
        for(position.x = start; position.x <= end; position.x += 1){
            for(position.y = start; position.y <= end; position.y += 1){
                // プレイヤーからの相対座標とパターンの絶対座標の変換
                let pattern_abs = position.sub(new MDPoint(start, start));
                // value == 1が見える位置
                let value = pattern.get_value(pattern_abs);
                let dungeon_abs = player_position.add(position);
                if(value == 1 && 
                  (0 < dungeon_abs.x && dungeon_abs.x < this._width - 1) &&
                  (0 < dungeon_abs.y && dungeon_abs.y < this._height - 1))
                  {
                    result.push(new MDPoint(position.x, position.y));
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
    update(position, value) {
        let i = this.convert_2dTo1d(position);
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

    // 2次元の位置(position)を1次元の位置に変換
    // position: MDPoint
    convert_2dTo1d(position) {
        return position.y * this._width + position.x;
    }
    
    // position: MDPointの値を取得
    get_value(position) {
        var index = this.convert_2dTo1d(position);
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
        this._prev_player_position = new MDPoint(2, 2);
        this._prev_sight_patterns = []; 

        this.mask = new MDMap(w, h, this._sight_info.Black.Type); 
        this._sight_pattern = new SightPattern(w, h);
    }
    
    // player_position: MDPoint
    display(dungeon, player_position) {
        console.log("Mask.display");

        let position = new MDPoint(-1, -1);
        for (position.y = 1; position.y < this._height - 1; position.y += 1) {
            for (position.x = 1; position.x < this._width - 1; position.x += 1) {
                
                let mask_value = this.mask.get_value(position);
                if (mask_value == this._sight_info.Black.Type) {
                    // 見たことのない場所
                    this._draw_tile(position, this._sight_info.Black.Type);
                }
                else if(mask_value == this._sight_info.Gray.Type){
                    // 一度見たことのある場所
                    let dungeon_value = dungeon.map.get_value(position);
                    if (dungeon_value == world.tile_info.Treasure.Type) {//???? != treasure?
                        this._draw_tile(position, this._sight_info.Gray.Type);
                    }else if(dungeon_value == world.tile_info.Air.Type) {
                        this._draw_tile(position, this._sight_info.Gray.Type);
                    }
                }
                else if(mask_value == this._sight_info.Transparent.Type){
                    // 視界がクリアな場所
                    // if (this._is_in_sight(position, player_position, -1)) {
                    //     continue;
                    // }
                }else{
                    alert('Dungeon_Mask: 変な値入ってます');
                }
            }
        }

        // why get_value() value == 0? 2021/08/14
        // console.log('display_mask: '+'dungeon_value(player) =' + dungeon.get_value(player_position));

    }

    // sight: 視界
    _is_in_sight(position, player_position, sight) {
        return position.equal(player_position);
    }
    
    _get_tile_color(tile_type) {
        for (let item in this._sight_info) {
            if (this._sight_info[item].Type == tile_type)
                return this._sight_info[item].Color;
        }
        return this._sight_info.Bedrock.Color; // error
    }

    _draw_tile(position, tile_type) {
        let color = this._get_tile_color(tile_type);
        fill(color);

        rect(position.x * 20, position.y * 20, 20, 20);
    }

    // 視界を広げる
    // sight: 視界サイズ
    update(player_position, sight) {
        let patterns = this._sight_pattern.get_pattern(player_position, 'cross', sight);
        this.fill_prev_sight();
        this.fill_sight_pattern(player_position, patterns);
        this.store_sight_info(player_position, patterns);
    }


    // 前回の視界（透明）を灰色で埋める
    fill_prev_sight(){
        for(let pattern of this._prev_sight_patterns){
            this.mask.update(this._prev_player_position.add(pattern), this._sight_info.Gray.Type);
        }
    }

    // 視界範囲を透明で塗りつぶす
    fill_sight_pattern(player_position, patterns){
        // [MDPoint(-1, 0), ...] 視界あける位置リスト（補正値）
        for(let pattern of patterns){
            this.mask.update(player_position.add(pattern), this._sight_info.Transparent.Type);
        }
    }

    // 視界情報を保管
    store_sight_info(player_position, patterns){
        this._prev_player_position = player_position;
        this._prev_sight_patterns = patterns;
    }
}


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
        this.map = new MDMap(this._width, this._height, world.tile_info.Wall.Type);
        // this.map = new MDMap(this._width, this._height, world.tile_info.Air.Type);

        // 岩盤で周囲を囲む
        let position = new MDPoint(0 ,0);
        for (position.y = 0; position.y < this._height; position.y++) {
            for (position.x = 0; position.x < this._width; position.x++) {
                if (!(position.x == 0 || position.x == this._width - 1 || 
                      position.y == 0 || position.y == this._height - 1)){ continue; }
                this.fill_bedrock(position);
            }
        }
    }

    // player_position: MDPoint
    display_mask(player_position) {
        this._mask.display(this, player_position);
    }
    
    // player_position: MDPoint
    update_mask(player_position, sight) {
        this._mask.update(player_position, sight);
    }
 
    display()  {
        console.log("dungeon.display");
        
        let position = new MDPoint(0, 0);
        for(position.y = 0; position.y < this._height; position.y++){
            for(position.x = 0; position.x < this._width; position.x++){
                this._draw_tile(position, this.get_value(position));
            }
        }
    }

    // 座標に格納されている値を取得
    // position: MDPoint
    get_value(position){
        // TODO
        // mapオブジェクトと、enemy, treasure の優先度を考える
        //
        // magic_stone_listはまだない(マップに値を直接挿入している)
        if(this._treasureList.is_exist_treasure(position)){
            return world.tile_info.Treasure.Type;
        }
        else if(this._enemyList.is_exist_enemy(position)){
            return world.tile_info.Enemy.Type;
        }

        // 魔法石の情報もmap内に入っている
        return this.map.get_value(position);
    }

    // プレイヤーを表示
    // position: MDPoint
    display_player(position) {
        image(player_image, position.x * cell_px, position.y * cell_px, cell_px, cell_px);
    }

    // position: MDPoint
    display_air(position) {
        this._draw_tile(position, world.tile_info.Air.Type);
    }

    // position: MDPoint
    display_stone(position, stone_animation) {
        this._draw_tile(position, stone_animation.property);
    }

    display_treasures() {
        this._treasureList.display();
    }

    display_enemies() {
        this._enemyList.display();
    }
    
    // position: MDPoint
    display_treasure(position) {
        this._draw_tile(position, world.tile_info.Treasure.Type);
    }

    // position: MDPoint
    display_enemy(position) {
        this._draw_tile(position, world.tile_info.Enemy.Type);
    }

    // 魔法石を置く
    // position: MDPoint
    add_stone(position, stone_animation){
        // stoneListは現状他で参照していない
        this._stoneList.push({position, property: stone_animation.property});
        this.map.update(position, stone_animation.property);
    }

    // 

    _get_tile_color(tile_type) {
        for (let item in world.tile_info) {
            if (world.tile_info[item].Type == tile_type)
                return world.tile_info[item].Color;
        }
        return world.tile_info.Bedrock.Color; // error
   
    }

    _draw_tile(position, tile_type){
        switch (tile_type) {
            case world.tile_info.Enemy.Type:
            case world.tile_info.Treasure.Type:
                this._draw_tile_image(position, tile_type);
                break;
            default:
                this._draw_tile_color(position, tile_type);
                break;
        }
    }

    // tile_typeの色を塗りつぶす
    // position: MDPoint
    _draw_tile_color(position, tile_type) {
        // 色
        let color = this._get_tile_color(tile_type);
        if (tile_type == world.tile_info.Enemy.Type){
            let enemy = this._enemyList.get_enemy(position);
            let alpha = enemy.hp * 0.1;
            color = `rgba(255, 140, 103, ${alpha})`;
        }
        fill(color);

        // 形
        if (tile_type == world.tile_info.Player.Type) {
            ellipseMode(CENTER);
            let offset = 20 / 2;
            let center = new MDPoint(position.x * 20 + offset, position.y * 20 + offset);
            ellipse(center.x, center.y, 15, 15);
        }  else {
            rect(position.x * 20, position.y * 20, 20, 20);
        }
    }

    // tile_typeの画像を描く
    // position: MDPoint
    _draw_tile_image(position, tile_type){
        let image_source_info = null;
        let image_info = null;
        switch (tile_type) {
            case world.tile_info.Enemy.Type:
                image_source_info = world.assets.Images.Enemies.Slime;
                image_info = image_source_info.Yowai;
                break;
            case world.tile_info.Treasure.Type:
                // 常にしまった状態の宝箱として表示される
                // TODO 開いた状態の画像と切り替えて使いたい
                image_source_info = world.assets.Images.Treasure;
                image_info = image_source_info.Close;
                break;
            default:
                break;
        }
        
        image(image_source_info.Cache, 
            // 表示先の左上座標、高さ、幅
            position.x * cell_px, position.y * cell_px,
            cell_px, cell_px,
            // 元画像の左上座標、高さ、幅
            image_info.Position.x * image_source_info.SouceSize, image_info.Position.y * image_source_info.SouceSize, 
            image_source_info.SouceSize, image_source_info.SouceSize);
    }

    

    /* 部屋関係 */

    _make(){
        this._make_room(this._room_count);
    }

    _make_room(room_count) {
        console.log("_make_room");

        for (let count = 0; count < room_count; count++) {
            let w = MDUtility.get_random_range(this._room_config.min_width, this._room_config.max_width + 1);
            let h = MDUtility.get_random_range(this._room_config.min_height, this._room_config.max_height + 1);
            
            this._make_one_room(w, h);
        }
    }
    
    _make_one_room(room_width, room_height) {
        console.log("_make_one_room");

        // 作る部屋の左上 upperlfet の座標(周囲の岩盤を考慮)
        let left_x = MDUtility.get_random_range(1, (this._width - 1) - (room_width - 1));
        let upper_y = MDUtility.get_random_range(1, (this._height - 1) - (room_height - 1));

        let position = new MDPoint(0, 0);
        for (position.y = upper_y ; position.y < upper_y + room_height; position.y++) {
            for (position.x = left_x ; position.x < left_x + room_width; position.x++) {
                this.dig_wall(position);
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
        // 岩盤を避けるため1, 1から
        const bedrockOffset = 1;
        let position = new MDPoint(0, 0);
        for (position.y = 0 + bedrockOffset; position.y < this._height - bedrockOffset; position.y++) {
            for (position.x = 0 + bedrockOffset; position.x < this._width - bedrockOffset; position.x++) {
                let index = this.map.convert_2dTo1d(position);
                this._treasure_white_list.push(index);
            }
        }
    }

    // 宝箱の位置の壁に穴をあける
    _dig_wall_in_treasure(){
        for(let treasure of this._treasureList.get()){
            this.dig_wall(treasure._position);
        }
    }

    /* 敵関係 */
    _create_enemy(enemy_count){
        this._create_enemy_white_list();
        this._enemyList = new EnemyList(this, enemy_count);
        this._dig_wall_in_enemy();
    }

    // 敵のホワイトリスト
    // 敵が重ならないように
    _create_enemy_white_list() {
        const bedrockOffset = 1;
        let position = new MDPoint(0, 0);
        for (position.y = 0 + bedrockOffset; position.y < this._height - bedrockOffset; position.y++) {
            for (position.x = 0 + bedrockOffset; position.x < this._width - bedrockOffset; position.x++) {
                let index = this.map.convert_2dTo1d(position);
                this._enemy_white_list.push(index);
            }
        }
    }

    // 宝箱の位置の壁に穴をあける
    _dig_wall_in_enemy(){
        for(let enemy of this._enemyList.get()){
            this.dig_wall(enemy._position);
        }
    }

    /* その他 */
    // mapのx, yの位置を岩盤で埋める
    // position: MDPoint
    fill_bedrock(position) {
        this.map.update(position, world.tile_info.Bedrock.Type);
    }
    
    // mapのx, yの位置に空間を開ける
    // position: MDPoint
    dig_wall(position){
        let value = this.map.get_value(position);
        if (value == world.tile_info.Bedrock.Type) {
            return;
        }
        this.map.update(position, world.tile_info.Air.Type);
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
        let position = new MDPoint(MDUtility.get_random_range(1, (this._width - 1)), 
                                    MDUtility.get_random_range(1, (this._height - 1)));

        let index = this.map.convert_2dTo1d(position);
        return index;
    }

    // 宝箱の座標をランダムに取得(被りなし)
    get_random_treasure_index() {
        let white_list_index = MDUtility.get_random_range(0, this._treasure_white_list.length);
        let map_index = this._treasure_white_list[white_list_index];
        // 使用済みの要素を削除
        this._treasure_white_list.splice(white_list_index, 1);
        
        return map_index;
    }

    // 敵の座標をランダムに取得(被りなし)
    get_random_enemy_index() {
        let white_list_index = MDUtility.get_random_range(0, this._enemy_white_list.length);
        let map_index = this._enemy_white_list[white_list_index];
        // 使用済みの要素を削除
        this._enemy_white_list.splice(white_list_index, 1);
        
        return map_index;
    }

    // position: MDPoint
    is_bedrock(position) {
        let value = this.map.get_value(position);
        return (value == world.tile_info.Bedrock.Type);
    }
    
    // position: MDPoint
    is_wall(position) {
        let value = this.map.get_value(position);
        return (value == world.tile_info.Wall.Type);
    }

    // 宝箱関係
    // position: MDPoint
    is_exist_treasure(position) {
        return this._treasureList.is_exist_treasure(position);
    }

    /**
     * 宝箱を取得
     * 宝箱なしの場合はnul
     * @param {MDPoint} position 座標
     * @return {Treasure} 宝箱
     */
    get_treasure(position){
        return this._treasureList.get_treasure(position);
    }
    
    // position: MDPoint
    is_opened_treasure(position) {
        return this._treasureList.is_opened_treasure(position);
    }
    
    // position: MDPoint
    open_treasure(position) {
        return this._treasureList.open_treasure(position);
    }

    // 敵関係
    // position: MDPoint
    is_exist_enemy(position) {
        return this._enemyList.is_exist_enemy(position);
    }

    // position: MDPoint
    attack_enemy(position) {
        return this._enemyList.attack_enemy(position);
    }

    // position: MDPoint
    attacked_enemy(position, damage) {
        return this._enemyList.attacked_enemy(position, damage);
    }

}
//----

class MDObject{

    // color: str 'rgb(0,0,60)'
    constructor(my_dungeon, color) {
        this._dungeon = my_dungeon;
        
        this._position = new MDPoint(0, 0);
        
        this._color = null;
    }

    make() {
    }

    //position: MDPoint
    is_exist(position) {
        let is_exist = this._position.equal(position);
        return is_exist;
    }
    
    display() {
        console.log("MDObject.display");

        // 色情報を一緒に与えられるといいな
        // this._dungeon.display(this._position, this.color);
    }
}

class MDObjectList{

    constructor(my_dungeon, count) {
        this._dungeon = my_dungeon;
        this._count = count;
        this._object_list = []; //is_exist()を持つものにかぎる/MDobjectの継承クラスに限る

        // ここで_makeすると継承されたクラスの_makeを呼び出してしまう
        //this._make();
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

    // position: MDPoint
    get_md_object(position) {
        for (let i = 0; i < this._count; i++) {
            if (this._object_list[i].is_exist(position)) {
                return this._object_list[i];
            }
        }

        return null;
    }

    // position: MDPoint
    is_exist(position) {
        let md_object = this.get_md_object(position);
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

    /**
     * プレイヤ初期化
     * @param {Dungeon} my_dungeon ダンジョン
     */
    constructor(my_dungeon) {
        this._dungeon = my_dungeon;
        this._hp = 5;
        this._hp_max = 10;
        this._strength = 1; // damage to enemy
        this._position = new MDPoint(0, 0);
        this._inventory = new MDInventory(3, null);
        this._sight_size = 5;

        this._make();

        this._stats = new Player_Stats();
        hp_view.update_player_hp(this._hp);
    }

    _make() {
        console.log("player.make");
        
        let index = this._dungeon.get_random_index();
        // ToDo position.x, position.y にまとめたい
        this._position.x = this._dungeon.map.convert_1dTo2d_x(index);
        this._position.y = this._dungeon.map.convert_1dTo2d_y(index);
        this._dungeon.dig_wall(this._position);
        this._dungeon.update_mask(this._position, this._sight_size);
    }
    
    display() {
        console.log("player.display");

        // this._dungeon.display_dungeon();
        this._dungeon.display_player(this._position);
        this._stats.display();
    }

    // direction: MDPoint 移動量
    move(direction) {
        let next = this._position.add(direction);
        treasure_iventory_view.delete_table_body_contents();

        if (this._dungeon.is_bedrock(next)) {
            // 行き先が岩盤の移動はなし
        } else if (this._dungeon.is_wall(next)) {
            // 行き先が壁の場合は掘る(移動はなし)
            this._dungeon.dig_wall(next);
            this.increase_hp(1);
            this._stats.add_dig_wall();
        } else {
            // 敵がいるか
            let is_exist_enemy = this._dungeon.is_exist_enemy(next);
            if(is_exist_enemy){
                let enemy = this._dungeon.attacked_enemy(next, this._strength);
                this.increase_hp(-1);
                if(!enemy.is_alive()){
                    this._stats.add_kill_enemy();
                }
                return;
            }

            // 進む
            this._position = next;
            this._stats.add_walk();
            this._dungeon.update_mask(next, this._sight_size); // 視界サイズ

            // 宝箱
            this.treasture_handle(); //現在地に宝箱があるか、あれば処理する
        }
    }

    is_alive(){
        return hp > 0;
    }

    // ダメージを与える場合は -1 (<0)
    // 回復させる場合は +1 (>0)
    increase_hp(value){
        this._hp += value;

        if (this._hp > this._hp_max){
            this._hp = this._hp_max;
        }

        hp_view.update_player_hp(this._hp);
        
        // TODO: これはkeypressで判定する
        if (this._hp  <= 0){
            my_game_manager.game_over();
        }

        return this;
    }

    // 宝箱の操作？
    treasture_handle(){
        // let is_exist_treasure = this._dungeon.is_exist_treasure(this._position);
        let treasure = this._dungeon.get_treasure(this._position);
        // null だと returnしてくれるはず
        if (!treasure){return;}
        this.open_treasure(treasure);
        this.get_treasure_items(treasure);

    }

    open_treasure(treasure){
        let is_opened = treasure.is_opened();
        if (is_opened){return;}

        this._dungeon.open_treasure(this._position);
        this._stats.add_pickup_treasure();
    }

    /**
     * 宝箱からアイテムを取得
     * @param {Treasure} treasure 宝箱
     */
    get_treasure_items(treasure){
        let treasure_items = treasure.get_items();
        console.info(`宝箱の元のアイテム: ${treasure_items}`);
        
        // let is_exist_items = (treasure_items.length == 0);
        // if (!is_exist_items){return;}

        let fails = this.add_inventory(treasure_items);
        treasure.set_inventory(fails);

        console.info(`プレイヤのアイテム: ${this._inventory.get_items()}`);
        console.info(`宝箱の残りのアイテム: ${treasure.get_items()}`);

        player_iventory_view.recreate_body(this._inventory);
        treasure_iventory_view.recreate_body(treasure._inventory);
    }

    /**
     * インベントリにアイテムを追加
     * @param {[MDITEM]} items アイテム
     * @return {[MDITEM]} 入らなかったアイテム
     */
    add_inventory(items){
        let failds = this._inventory.add_range(items);
        return failds;
    }

    /**
     * インベントリをアイテムで上書き
     * @param {[MDITEM]} items アイテム
     * @return {[MDITEM]} 入らなかったアイテム
     */
    set_inventory(items){
        let failds = this._inventory.set_range(items);
        return failds;
    }
}

class HpView {

    constructor() {
        this._player_hp = 0;
        this._enemy_hp = '-';
        
        this.init_table_dom();  
        this.get_table_dom();  
    }

    init_table_dom(){
        const contents = [
            {text: 'プレイヤ', id:'player-hp', value: this._player_hp}, 
            {text: 'エネミー', id:'enemy-hp', value: this._enemy_hp}, 
        ]

        let body_contents = this.create_table_body_contents(contents);

        let table_element = `
        <table border="1">
          <thead>
          <tr>
              <th colspan="2">HP</th>
          </tr>
          </thead>
          <tbody>
            ${body_contents}
          </tbody>
        </table>`;

        let hp_div = document.getElementById('hp');
        hp_div.innerHTML = table_element;
    }

    // ex. {text: '歩数', id:'player-stats-walk', value: '0'}, 
    create_table_body_contents(contents){
        let elements = '';
        for(const tr of contents){
            elements += `
            <tr>
                <td>${tr.text}</td>
                <td id="${tr.id}">${tr.value}</td>
            </tr>\n`;
        }

        return elements;
    }

    get_table_dom(){
        this._player_hp_element = document.getElementById('player-hp');
        this._enemy_hp_element = document.getElementById('enemy-hp');
    }
    
    update_player_hp(hp) {
        this._player_hp = hp;
    }

    update_enemy_hp(hp) {
        this._enemy_hp = hp;
    }

    hide_enemy_hp(){
        this._enemy_hp = '-';
    }
    
    display() {
        this._player_hp_element.textContent = this._player_hp;
        this._enemy_hp_element.textContent = this._enemy_hp;
    }
}

class Player_Stats {

    constructor() {
        this._walk = 0;
        this._dig_wall = 0;
        this._pickup_treasures = 0;
        this._kill_enemies = 0;
        
        this.init_table_dom();  
        this.get_table_dom();  
    }

    init_table_dom(){
        const contents = [
            {text: '歩数', id:'player-stats-walk', value: '0'}, 
            {text: '掘った数', id:'player-stats-dig-wall', value: '0'}, 
            {text: '拾った宝箱', id:'player-stats-pickup-treasures', value: '0'}, 
            {text: '倒した敵', id:'player-stats-kill-enemies', value: '0'}, 
            {text: '石の飛距離', id:'player-stats-stone-distance', value: '0'}, 
        ]

        let body_contents = this.create_table_body_contents(contents);

        let table_element = `
        <table border="1">
          <thead>
          <tr>
              <th colspan="2">統計</th>
          </tr>
          </thead>
          <tbody>
            ${body_contents}
          </tbody>
        </table>`;

        let stats_div = document.getElementById('stats');
        stats_div.innerHTML = table_element;
    }

    // ex. {text: '歩数', id:'player-stats-walk', value: '0'}, 
    create_table_body_contents(contents){
        let elements = '';
        for(const tr of contents){
            elements += `
            <tr>
                <td>${tr.text}</td>
                <td id="${tr.id}">${tr.value}</td>
            </tr>\n`;
        }

        return elements;
    }

    get_table_dom(){
        this._walk_element = document.getElementById('player-stats-walk');
        this._dig_wall_element = document.getElementById('player-stats-dig-wall');
        this._pickup_treasures_element = document.getElementById('player-stats-pickup-treasures');
        this._kill_enemies_element = document.getElementById('player-stats-kill-enemies');
        this._stone_distance_element = document.getElementById('player-stats-stone-distance');
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
        this._walk_element.textContent = this._walk;
        this._dig_wall_element.textContent = this._dig_wall;
        this._pickup_treasures_element.textContent = this._pickup_treasures;
        this._kill_enemies_element.textContent = this._kill_enemies;
        this._stone_distance_element.textContent = stone_distance;
    }
}

class InventoryView {
    // string: div_id 割り当てるHTML ID
    // string: title テーブルタイトル
    // MDInventory: inventory インベントリ
    constructor(div_id, title, inventory){
        this.div_id = div_id;
        this.div_element = document.getElementById(div_id);
        this.body_element = null;

        this.init_table_dom(title, inventory);
        this.get_table_dom();
    }

    // 初回インベントリ表示
    init_table_dom(title, inventory){
        const body_contents = this.create_table_body_contents(inventory);

        let table_element = `
        <table border="1">
          <thead>
            <tr>
                <th>${title}</th>
            </tr>
          </thead>
          <tbody>
            ${body_contents}
          </tbody>
        </table>`;

        this.div_element.innerHTML = table_element;
    }

    // 2回目以降のインベントリ表示
    recreate_body(inventory){
        const body_contents = this.create_table_body_contents(inventory);

        this.body_element.innerHTML = body_contents;
    }

    get_table_dom(){
        this.body_element = this.div_element.querySelector(`table > tbody`);
    }

    // MDIngentory: inventory
    create_table_body_contents(inventory){
        if(inventory == null){ return ''; }

        const items = inventory.get_items();
        let elements = '';
        for (let i = 0; i < inventory.size; i++) {
            const item = items[i];
            elements += `
            <tr>
                <td>${item == null ? '空' : item.constructor.name}</td>
            </tr>\n`;
        }

        return elements;
    }

    delete_table_body_contents(){
        this.body_element.textContent = '';
    }

    // bool: is_show 表示に切り替えるか
    show_table(is_show){
        this.div_element.hidden = !is_show;
    }
}

class Treasure extends MDObject{

    constructor(my_dungeon) {
        super(my_dungeon, null);

        this._position = new MDPoint(0, 0);
        this._inventory = new MDInventory(5, null);

        this._opened = false;
        this._make();
    }

    _make() {
        console.log("treasure.make");

        // ランダム位置に配置(岩盤以外)
        let index = this._dungeon.get_random_treasure_index();
        // TODO: convert_1dTo2d_x, yをMDPointで返す
        this._position = new MDPoint(this._dungeon.map.convert_1dTo2d_x(index), this._dungeon.map.convert_1dTo2d_y(index))
    }

    is_opened() {
        return this._opened;
    }
    
    open() {
        this._opened = true;
        // player.inventory <- this.inventory
    }

    display(){
        console.log("treasure.display");

        this._dungeon.display_treasure(this._position);
    }

    add_inventory(items){
        this._inventory.add_range(items);
    }

    /**
     * インベントリにアイテムを追加
     * @param {[MDItem]} items アイテム配列
     * @return {[MDItem]} アイテム配列
     */
    set_inventory(items){
        let fails = this._inventory.set_range(items);
        return fails;
    }

    /**
     * イベントリ内のアイテムをすべて取得
     * @return {[MDItem]} アイテム配列
     */
    get_items(){
        return this._inventory.get_items();
    }
}

class TreasureList extends MDObjectList{

    constructor(my_dungeon, count) {
        super(my_dungeon, count);
        this._make();
    }

    _make(){
        for (let i = 0; i < this._count; i++) {
            let treasure = new Treasure(this._dungeon);
            treasure.add_inventory(this._get_random_items(2));
            this._object_list.push(treasure);
        }
    }

    // num : int : number of items
    // ランダムといいつついまは石だけだよ
    _get_random_items(num){
        let array = [];
        for(let i = 0; i < num; i++){
            //random select 
            const category = this.get_random_category();
            switch (category) {
                case world.item_category.Weapon:
                    array.push(this._create_item_weapon() );
                    break;                     
                case world.item_category.Stone:
                    array.push(this._create_item_stone() );     
                    break;
                default:
                    console.error('未実装のアイテムカテゴリが使用されました。');
                    break;
            }

        }
        return array;
    }

    // アイテムのカテゴリをランダムに取得
    get_random_category(){
        const categories = [
            { value: world.item_category.Weapon, rate: 3 },
            { value: world.item_category.Stone, rate: 7 }
        ];

        let roulette = [];
        for (const cate of categories) {
            for (let i = 0; i < cate.rate; i++) { roulette.push(cate.value); }    
        }
        
        const result = MDUtility.get_random_range(0, roulette.length);
        return roulette[result];
    }

    // return MDStoneItem
    _create_item_stone(){
        let a = new MDItemStone(world.tile_info.R.Type, 0, 0, 5); //富豪プログラミング 
        return a;
    }

    _create_item_weapon(){
        // この辺はあとで他クラスに移動する
        // アイテムテーブルとかほしい
        let weapon = new MDItemWeapon(3, 5, "Fire");
        return weapon;
    }

    // position: MDPoint
    get_treasure(position){
        return this.get_md_object(position);
    }

    // position: MDPoint
    is_exist_treasure(position){
        return this.is_exist(position);
    }

    // position: MDPoint
    is_opened_treasure(position) {
        let treasure = this.get_treasure(position);
        if (treasure == null)
            return false;
        
        return treasure.is_opened(); // Treasure が is_opend()を持ってる前提
    }
    
    // position: MDPoint
    open_treasure(position) {
        let treasure = this.get_treasure(position);
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
        this._hp = MDUtility.get_random_range(1, 10);
        this._position = new MDPoint(0, 0);

        this._make();
    }

    _make() {
        console.log("enemy.make");

        // ランダム位置に配置(岩盤以外)
        let index = this._dungeon.get_random_enemy_index();
        // TODO: x, yをまとめる
        this._position = new MDPoint(this._dungeon.map.convert_1dTo2d_x(index), this._dungeon.map.convert_1dTo2d_y(index))
    }

    get hp(){
        return this._hp;
    }

    get position(){
        return this._position;
    }
    
    attack() {
        console.log("enemy.attack 未実装");
    }

    attacked(damage) {
        console.log("enemy.attacked");

        this._hp -= damage;
        hp_view.update_enemy_hp(this._hp);

        if (!this.is_alive()){
            // マップ外に移動させる
            this._position.set(-1, -1);
            hp_view.hide_enemy_hp();
        }
    }

    is_alive(){
        return this._hp > 0;
    }

    display(){
        console.log("enemy.display");

        if(this.is_alive){
            this._dungeon.display_enemy(this._position);
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

    // position: MDPoint
    get_enemy(position){
        return this.get_md_object(position);
    }

    // position: MDPoint
    is_exist_enemy(position){
        return this.is_exist(position);
    }

    // TODO: 年明けにデバッグ、これをよんでGameClear判定する
    is_exist_alive_enemy(){
        for (let i = 0; i < this._count; i++) {
            const is_alive = this._object_list[i].is_alive();
            if (is_alive){ return true; }
        }

        return false;
    }

    // enemyがtargetに攻撃する
    // position: MDPoint
    attack_enemy(position, target) {
        let enemy = this.get_enemy(position);
        if (enemy == null) {
            return false;
        }

        enemy.attack(target);
        return enemy;
    }

    // enemyがtarget?攻撃される
    // position: MDPoint
    attacked_enemy(position, damage) {
        let enemy = this.get_enemy(position);
        if (enemy == null) {
            return false;
        }

        enemy.attacked(damage);
        
        const is_exist_alive_enemy = this.is_exist_alive_enemy();
        if(!is_exist_alive_enemy){
            my_game_manager.game_clear();
        }

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
                this.dungeon.display_air(prev_position);    
            }

            const position = stone_animation.route[i]; // {x: 1, y: 2}
            prev_position = position;
            
            this.dungeon.display_stone(position, stone_animation);
            console.log('draw_stone loop');
            // アニメフレーム待機
            await this.sleep(stone_animation.speed);
        }
        
        // ダンジョンに石を配置
        if(stone_animation.route.length == 0){ return; } 
        // if(ston.property == 'B'){ return; }  // 将来有効化 デバッグ用に破壊石もマップに配置する
        let last_position = stone_animation.route[stone_animation.route.length - 1];
        this.dungeon.add_stone(last_position, stone_animation);
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
        this.route = []; // [MDPoint(1, 2), MDPoint(3, 4)] // 石の位置(経路)
        this.speed = speed; // 5 描画時間(ms) 
    }

    // position: MDPoint
    push(position){
        this.route.push(position);
    }

    last(){
        if (this.route.length == 0){return null;}
        return this.route[this.route.length - 1];
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
        let targetTile = this._dungeon.get_value(target);

        // 別の関数の話
        // ブレイク石の場合はマップに配置しない(現在配置しているので、石の種類を見て調整する必要がある)

        switch (targetTile) {
            case world.tile_info.Wall.Type:
                this._dungeon.dig_wall(target);
                // 壁を破壊
                break;
            case world.tile_info.R.Type:
            case world.tile_info.L.Type:
                // 将来的に石はダンジョンに直配置しない(宝箱などと同じ)場合は削除対象を変更する必要がある
                this._dungeon.dig_wall(target);
                // 石を破壊
                break;
            case world.tile_info.B.Type:
                // 本来マップに存在しない
                // とりあえず破壊
                break;
            case world.tile_info.Enemy.Type:
                // 敵にダメージ
                let enemy = this._dungeon._enemyList.attacked_enemy(target, stone.damage);
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

const dungeon_width = 16;
const cell_px = 20;
const canvasSize = dungeon_width * cell_px;
let my_game_manager;
let my_dungeon;
let my_player;
let my_sight_pattern;
let my_mdMath;
let hp_view;
let player_iventory_view;
let treasure_iventory_view;
let player_image;

function preload(){
    player_image = loadImage('assets/nan.png');
    init_enemy_image();
    init_treasure_image();
}

// 敵画像を用意
function init_enemy_image(){
    // Slime
    slime = {
        Cache: loadImage('./assets/images/enemy.png'),
        SouceSize: 400
    }
    slime['Yowai'] = {
        Index : 0,
        Position : convert_index_to_image_position(0),
    } 
    world.assets.Images.Enemies['Slime'] = slime;
}

// 宝箱画像を用意
function init_treasure_image(){
    treasure = {
        Cache: loadImage('./assets/images/treasure.png'),
        SouceSize: 400
    }
    treasure['Close'] = {
        Index : 0,
        Position : convert_index_to_image_position(0),
    } 
    treasure['Open'] = {
        Index : 7,
        Position : convert_index_to_image_position(7),
    } 
    world.assets.Images.Treasure = treasure;
}

// 複数の画像を含む画像から特定の画像の左上位置を取得
// image_comlun_count: 全体画像の中で1画像が何個横に並んでいるか
function convert_index_to_image_position(index, image_comlun_count = 5){
    let top_left = new MDPoint(index % image_comlun_count,  int(index / image_comlun_count));
    return top_left;
}

function setup(){
    my_game_manager = new GameManager();
    my_mdMath = new MDMath();

    createCanvas(canvasSize, canvasSize);
    background(255, 255, 255);

    hp_view = new HpView();
    
    room_config = new Room_Config(2, 2, 4, 4);
    
    my_dungeon = new Dungeon(dungeon_width, dungeon_width, 5, room_config, 10, 10);

    my_player = new Player(my_dungeon); // 空き部屋の一番左上
    
    my_sight_pattern = new SightPattern(dungeon_width, dungeon_width);
    
    player_iventory_view = new InventoryView('player-inventory', 'プレイヤのインベントリ', my_player._inventory);
    treasure_iventory_view = new InventoryView('treasure-inventory', '宝箱のインベントリ', null);

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
    if (my_game_manager.is_game_clear() || my_game_manager.is_game_over()) { 
        location.reload();
        return; 
    }
    
    let player_direction = null;
    if (key == 'w') { //up
        player_direction = new MDPoint(0, -1);
    } else if (key == 'a') { //left
        player_direction = new MDPoint(-1, 0);
    } else if (key == 's') { //right
        player_direction = new MDPoint(0, 1);
    } else if (key == 'd') { //down
        player_direction = new MDPoint(1, 0);
    }
    if(player_direction != null){
        my_player.move(player_direction);
    }

    // 魔法のテストったらテスト
    let animation_data = null;
    let stone = null;
    let stone_damage = 3; // hp -= damage
    let stone_direction = new MDPoint(1, 0); // (1,0)はテスト用
    if (key == 'r'){
        // 右石
        stone = new MDItemStone(world.tile_info.R.Type, 0, stone_damage, stone_distance);
        animation_data = stone.calc_route(my_dungeon, my_player._position, stone_direction);
        console.log('Migi uchi!');
    }else if(key == 'l'){
        // 左石
        stone = new MDItemStone(world.tile_info.L.Type, 0, stone_damage, stone_distance);
        animation_data = stone.calc_route(my_dungeon, my_player._position, stone_direction);
        console.log('Left uchi!');
    }else if(key == 'b'){
        // 攻撃石
        stone = new MDItemStone(world.tile_info.B.Type, 0, stone_damage, stone_distance);
        animation_data = stone.calc_route(my_dungeon, my_player._position, stone_direction);
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

    // TODO: GameOver, GameClearの判定をここでやる
    // 敵の数, プレイヤーのHPが変更されるのはKeyPressされた時だけ

    console.log("--------------------" + key);
}

function display_all() {
    background(255, 255, 255);
    my_dungeon.display();
    // my_objects.display_objects();
    // my_enemy.display_enemy();
    // my_treasurelist.display();
    my_dungeon.display_treasures();
    my_dungeon.display_enemies();
    // my_player.display();
    // my_player.display();
    
    // マスクの描画
    my_dungeon.display_mask(my_player._position);
 
    my_player.display();
    hp_view.display();
}