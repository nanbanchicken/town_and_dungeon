let image_dict = {};
function preload(){
    image_dict['hart'] = loadImage('./assets/images/enemy.png');
    image_dict['box'] = loadImage('./assets/images/treasure.png');
}

const canvas_size = 600;
const image_cell_size = 400;
const cell_size = 100;
function setup(){
    createCanvas(canvas_size, canvas_size);
    background(0, 0, 0);
    frameRate(60);

    const close_box_position =  convert_index_to_image_position(0);
    const open_box_position =  convert_index_to_image_position(8);
    // https://p5js.org/reference/#/p5/image
    image(image_dict['box'], 
        cell_size * 0, 0, 
        cell_size, cell_size, 
        close_box_position.x * image_cell_size, close_box_position.y * image_cell_size, 
        image_cell_size, image_cell_size);
    image(image_dict['box'], 
        cell_size * 1, 0, 
        cell_size, cell_size, 
        open_box_position.x * image_cell_size, open_box_position.y * image_cell_size, 
        image_cell_size, image_cell_size);
}

// return {x, y}
function convert_index_to_image_position(index, image_comlun_count = 5){
    let position = {
        x: index % image_comlun_count, 
        y: int(index / image_comlun_count)};
    return position;
}