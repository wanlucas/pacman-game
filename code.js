const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const width = canvas.width = innerWidth;
const height = canvas.height = innerHeight;

class Wall {
  static width = 60;
  static height = 60;
  constructor(position, image) {
    this.position = {
      x: position.x,
      y: position.y
    };
    this.width = 60, this.height = 60;
    this.image = image
  }
  draw(){
    c.drawImage(
      this.image,
      this.position.x, this.position.y,
      this.width, this.height
    );
  };
  update() {
  }
};

class Player {
  constructor(position) {
    this.position = {
      x: position.x,
      y: position.y
    }
    this.velocity = {
      x:0,
      y:0
    }
    this.r = (Wall.width / 2) - 5;
  }

  draw() {
    c.beginPath();
    c.fillStyle = 'yellow';
    c.arc(
      this.position.x, this.position.y,
      this.r, 0, Math.PI * 2
    );
    c.fill();
    c.closePath();
  }

  updateInputs() {
    if(lastKey === 'd') {
      this.velocity.x = 5;
      if(collidesWithTheWall(player)) this.velocity.x = 0; 
    }
    else if(lastKey === 'a') {
      this.velocity.x = -5;
      if(collidesWithTheWall(player)) this.velocity.x = 0;
    }
    else if(lastKey === 's') {
      this.velocity.y = 5;
      if(collidesWithTheWall(player)) this.velocity.y = 0;
    }
    else if(lastKey === 'w') 
      this.velocity.y = -5;
      if(collidesWithTheWall(player)) this.velocity.y = 0;
  }

  move() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  update() {
    this.draw();
    this.updateInputs();
    this.move();
  }
}

const walls = new Array();
const player = new Player(
  position = {
    x: Wall.width + Wall.width / 2,
    y: Wall.height + Wall.height / 2
  }
);
var lastKey = null;

function createMap() {
  const map = [
    ['{','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','}'],
    ['|',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','|'], 
    ['|',' ','<','>',' ','{','_','_','>',' ','<','_','_','_','_','_','>',' ','+',' ','|'],
    ['|',' ',' ',' ',' ','|',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','|'],
    ['[','_','_','>',' ','|',' ','<','}',' ','<','_','_','>',' ','{','_','_','}',' ','v'],
    [' ',' ',' ',' ',' ','|',' ',' ','|',' ',' ',' ',' ',' ',' ','|',' ',' ','|',' ',' '],
    ['{','_','_','>',' ','[','_','_',']',' ','<','_','_','>',' ','[','_','_',']',' ','^'],
    ['|',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','|'], 
    ['[','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_',']']
  ];

  map.forEach((row,i) => {
    row.forEach((block, i2) => {
      if(block != ' ') {
        walls.push(
          new Wall(
            position = {
              x: Wall.width * i2,
              y: Wall.height * i
            },
            image = getImage(block)
          )
        )
      }
    })
  });
};

function getImage(type) {
  const image = new Image();
  
  switch(type) {
    case '_': 
      image.src = './imgs/pipeHorizontal.png';
      break;

    case '|':
      image.src = './imgs/pipeVertical.png';
      break;

    case '+':
      image.src = './imgs/block.png';
      break;

    case '{':
      image.src = './imgs/pipeCorner1.png';
      break;

    case '[':
      image.src = './imgs/pipeCorner4.png';
      break;

    case '}':
      image.src = './imgs/pipeCorner2.png';
      break;

    case ']':
      image.src = './imgs/pipeCorner3.png';
      break;

    case '<':
      image.src = './imgs/capLeft.png';
      break;

    case '>':
      image.src = './imgs/capRight.png';
      break;

    case 'v':
      image.src = './imgs/capBottom.png';
      break;

    case '^':
      image.src = './imgs/capTop.png';
      break;
  }
  return image;
}

function collidesWithTheWall(circle) {
  return walls.some(wall => 
    circle.position.x + circle.r + circle.velocity.x 
    >= wall.position.x &&
    circle.position.x - circle.r + circle.velocity.x 
    <= wall.position.x + wall.width &&
    circle.position.y + circle.r + circle.velocity.y 
    >= wall.position.y &&
    circle.position.y - circle.r + circle.velocity.y
    <= wall.position.y + wall.height);     
};

function run() {
  requestAnimationFrame(run);
  c.clearRect(0,0,canvas.width, canvas.height);

  walls.forEach((wall) => wall.draw());
  if(collidesWithTheWall(player))
    player.velocity.x = 0, player.velocity.y = 0;

  player.update();
}

function addInputEvents() {
  addEventListener('keypress', ({ key }) => {
    lastKey = key;
  });
};

addEventListener('load', ()=> {
  createMap();
  addInputEvents();
  run();
  alert('this game is in development');
})