const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const scoreHTML = document.getElementById('score');
const highScoreHTML = document.getElementById('high-score');

const width = canvas.width = innerWidth;
const height = canvas.height = innerHeight;

class Block {
  static width = 25;
  static height = 25;
  constructor(position, image) {
    this.position = {
      x: position.x,
      y: position.y
    };
    this.width = 25, this.height = 25;
    this.image = image
  }
  draw(){
    c.drawImage(
      this.image,
      this.position.x, this.position.y,
      Block.width, Block.height
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
      y:0,
      max:4
    }
    this.radius = (Block.width / 2) - 2;
  }

  draw() {
    c.beginPath();
    c.fillStyle = 'yellow';
    c.arc(
      this.position.x, this.position.y,
      this.radius, 0, Math.PI * 2
    );
    c.fill();
    c.closePath();
  }

  updateInputs() {
    if(lastKey === 'd') {
      this.velocity.x = this.velocity.max;
      if(collidesWithTheBlock(player)) this.velocity.x = 0; 
    }
    else if(lastKey === 'a') {
      this.velocity.x = -this.velocity.max;
      if(collidesWithTheBlock(player)) this.velocity.x = 0;
    }
    else if(lastKey === 's') {
      this.velocity.y = this.velocity.max;
      if(collidesWithTheBlock(player)) this.velocity.y = 0;
    }
    else if(lastKey === 'w') 
      this.velocity.y = -this.velocity.max;
      if(collidesWithTheBlock(player)) this.velocity.y = 0;
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

class Pellet {
  constructor(position) {
    this.position = {
      x: position.x,
      y: position.y
    }
    this.radius = Block.width / 10
  }
  draw() {
    c.beginPath();
    c.fillStyle = 'orange';
    c.arc(
      this.position.x, this.position.y,
      this.radius, 0, Math.PI * 2
    );
    c.fill();
    c.closePath();
  }
}

class Power {
  constructor(position) {
    this.position = {
      x: position.x,
      y: position.y
    }
    this.radius = Block.width / 4
  }
  draw() {
    c.beginPath();
    c.fillStyle = 'orange';
    c.arc(
      this.position.x, this.position.y,
      this.radius, 0, Math.PI * 2
    );
    c.fill();
    c.closePath();
  }
}

class Ghost {
  constructor(position) {
    this.color = 'red'
    this.position = {
      x: position.x,
      y: position.y
    }
    this.velocity = {
      x: 3,
      y: 0,
      max: 4
    }
    this.radius = Block.width / 2 - 4
    this.scared = false
  }

  draw() {
    c.beginPath();
    c.fillStyle = this.color;
    c.arc(
      this.position.x, this.position.y,
      this.radius, 0, Math.PI * 2
    );
    c.fill();
    c.closePath();
  }
  
  move() {
    if(!collidesWithTheBlock(this)) {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
    else {
      const possibilities = getPossibleDirections(this);
      const newDirection = possibilities[
        Math.round(Math.random() * (possibilities.length - 1))
      ]
  
      this.velocity.x = newDirection.x;
      this.velocity.y = newDirection.y;
    };
  }

  update() {
    this.move();
    this.draw();
    this.color = this.scared ? 'blue' : 'red';
  }
}

const blocks = new Array();
const ghosts = new Array();
const pellets = new Array();
const powers = new Array();
var player;
var score = 0, highScore = 0;
var lastKey = null;

function getPossibleDirections(obj) {
  const vel = obj.velocity.max;
  const directions = [{x:vel, y:0}, {x:-vel, y:0}, {x:0, y:vel}, {x:0, y:-vel}];

  return directions.filter((direction) => {
    const thisObj = {
      ...obj,
      velocity : { 
        x: direction.x,
        y: direction.y
    }};

    return !collidesWithTheBlock(thisObj);
  });
}

function collidesWithTheCircle(target, circle) {
  const verDistance = target.position.x - circle.position.x;
  const horDistance = target.position.y - circle.position.y;
  const colDistance = target.radius + circle.radius;

  return Math.hypot(verDistance, horDistance) <= colDistance;
};

function collidesWithTheBlock(circle) {
  const radiusConstant = Math.floor(Block.width / 2) - 2; //to keep centralized
  return blocks.some(block => 
    circle.position.x + radiusConstant + circle.velocity.x 
    >= block.position.x &&
    circle.position.x - radiusConstant + circle.velocity.x 
    <= block.position.x + block.width &&
    circle.position.y + radiusConstant + circle.velocity.y 
    >= block.position.y &&
    circle.position.y - radiusConstant + circle.velocity.y
    <= block.position.y + block.height);     
};

function createMap() {
  const map = [
    ['{','_','_','_','_','_','_','_','_','~','_','_','_','_','_','_','_','_','}'],
    ['|','.','.','.','g','.','.','.','.','|','.','.','.','.','g','.','.','.','|'], 
    ['|','.','{','}','.','{','_','}','.','|','.','{','_','}','.','{','}','.','|'], 
    ['|','.','[',']','.','[','_',']','.','v','.','[','_',']','.','[',']','.','|'], 
    ['|','.','.','.','o','.','.','.','.','.','.','.','.','.','o','.','.','.','|'], 
    ['|','.','<','>','.','^','.','<','_','~','_','>','.','^','.','<','>','.','|'],
    ['|','.','.','.','.','|','.','.','.','|','.','.','.','|','.','.','.','.','|'],
    ['[','_','_','}','.','(','_','>',' ','v',' ','<','_',')','.','{','_','_',']'],
    [' ',' ',' ','|','.','|',' ',' ',' ',' ',' ',' ',' ','|','.','|',' ',' ',' '],
    [' ',' ',' ','|','.','|',' ','{','_','_','_','}',' ','|','.','|',' ',' ',' '], 
    ['_','_','_',']','.','v',' ','|',' ',' ',' ','|',' ','v','.','[','_','_','_'],
    [' ',' ',' ',' ','p',' ',' ','|',' ',' ',' ','|',' ',' ','.',' ',' ',' ',' '], 
    ['_','_','_','}','.','^',' ','|',' ',' ',' ','|',' ','^','.','{','_','_','_'], 
    [' ',' ',' ','|','.','|',' ','[','_','_','_',']',' ','|','.','|',' ',' ',' '], 
    [' ',' ',' ','|','.','|',' ',' ',' ',' ',' ',' ',' ','|','.','|',' ',' ',' '], 
    ['{','_','_',']','.','v',' ','<','_','~','_','>',' ','v','.','[','_','_','}'], 
    ['|','.','.','.','.','.','.','.','.','|','.','.','.','.','.','.','.','.','|'], 
    ['|','.','<','}','g','<','_','>','.','v','.','<','_','>','g','{','>','.','|'], 
    ['|','.','.','|','.','.','.','.','.','.','.','.','.','.','.','|','.','.','|'], 
    ['|','>','.','v','.','^','.','<','_','~','_','>','.','^','.','v','.','<',')'], 
    ['|','.','.','.','o','|','.','.','.','|','.','.','.','|','o','.','.','.','|'], 
    ['|','.','<','_','_','u','_','>','.','v','.','<','_','u','_','_','>','.','|'], 
    ['|','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','|'], 
    ['[','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_',']']
  ];

  map.forEach((row, y) => {
    row.forEach((blockType, x) => {
      if(blockType === '.') createNewPellet(x, y)
      else if(blockType === 'g') createNewGhost(x, y)
      else if(blockType === 'p') createNewPlayer(x, y)
      else if(blockType === 'o') createNewPower({ x,y })
      else if(blockType != ' ') createNewBlock(x, y, blockType); 
    })
  });
};

function createNewBlock(x, y, blockType) {
  blocks.push(
    new Block(
      position = {
        x: Block.width * x,
        y: Block.height * y
      },
      image = getImage(blockType)
    )
  );
};

function createNewPellet(x, y) {
  pellets.push(
    new Pellet(
      position = {
        x: Block.width * x + Block.width / 2,
        y: Block.height * y + Block.height / 2
      },
    )
  );
};

function createNewPower(position) {
  powers.push(
    new Power(
      position = {
        x: Block.width * position.x + Block.width / 2,
        y: Block.height * position.y + Block.height / 2
      },
    )
  );
}

function createNewPlayer(x, y) {
  player = new Player(
    position = {
      x: Math.round(Block.width * x + Block.width / 2),
      y: Math.round(Block.height * y + Block.height / 2)
    }
  );
};

function createNewGhost(x, y) {
  ghosts.push(
    new Ghost(
      position = {
        x: Math.round(Block.width * x + Block.width / 2),
        y: Math.round(Block.height * y + Block.height / 2)
      }
    )
  );
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

    case '}':
      image.src = './imgs/pipeCorner2.png';
      break;

    case '[':
      image.src = './imgs/pipeCorner4.png';
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

    case ')':
      image.src = './imgs/pipeConnectorLeft.png';
      break;

    case '(':
      image.src = './imgs/pipeConnectorRight.png';
      break;

    case '~':
      image.src = './imgs/pipeConnectorBottom.png';
      break;

    case 'u':
      image.src = './imgs/pipeConnectorTop.png';
      break;
  }
  return image;
};

function gameOver() {
  if(score > highScore) highScore = score;
  highScoreHTML.innerText = highScore;

  setTimeout(()=> {
    ghosts.splice(0), pellets.splice(0);
    player = null, lastKey = null;
  },1000);

  setTimeout(()=> {
    createMap();
    score = 0;
    run();
  },2000);
};

function run() {
  let animation = requestAnimationFrame(run);
  c.clearRect(0,0,canvas.width, canvas.height);

  scoreHTML.innerText = score;

  blocks.forEach((block) => {
    block.draw();
    if(player && collidesWithTheBlock(player))
      player.velocity.x = 0, player.velocity.y = 0; 
  });

  pellets.forEach((pellet, i) => {
    pellet.draw();
    if(collidesWithTheCircle(player, pellet)) { 
      score += 10;
      delete pellets[i];
    }
  });
  
  ghosts.forEach((ghost, i) => {
    ghost.update();
    if(collidesWithTheCircle(player, ghost)) {

      if(ghost.scared) delete ghosts[i]
      else {
        gameOver();
        cancelAnimationFrame(animation);
      }
    }
  });

  powers.forEach((power, i) => {
    power.draw();
    if(collidesWithTheCircle(player, power)) {
      delete powers[i];

      ghosts.forEach((ghost)=> {
        ghost.scared = true;
        setTimeout(()=> ghost.scared = false, 10000);
      })
    }
  });

  player && player.update();
};

function addInputEvents() {
  addEventListener('keypress', ({ key }) => {
    lastKey = key;
  });
};

addEventListener('load', () => {
  createMap();
  addInputEvents();
  run();
  alert('this game is in development');
});