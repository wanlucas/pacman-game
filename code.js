const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const scoreHTML = document.getElementById('score');
const highScoreHTML = document.getElementById('high-score');
const levelHTML = document.getElementById('level');

class Block {
  static width;
  static height;
  constructor(position, image) {
    this.position = {
      x: position.x,
      y: position.y
    };
    this.width = Block.width;
    this.height = Block.height;
    this.image = image;
  }

  draw(){
    c.drawImage(
      this.image,
      this.position.x, this.position.y,
      this.width, this.height
    );
  };

  update() {
    this.draw();
  }
};

class Gate {
  constructor(position) {
    this.position = {
      x: position.x, 
      y: position.y
    };
    this.images = {
      closed: getImage('_'),
      opened: getImage('"')
    };
    this.width = 0;
    this.height = Block.height;
  }

  draw(image) {
    c.drawImage(
      image,
      this.position.x, this.position.y,
      Block.width, Block.height
    );
  }

  update() {
    if(gatesOpened) {
      this.width = 0;
      this.draw(this.images.opened);
    }
    else {
      this.width = Block.width;
      this.draw(this.images.closed);
    }
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
      max: Block.width / 10
    }
    this.radius = (Block.width / 2) - 2;
    this.mouthOpn = 0.2;
    this.mouthDirection = 0;
  }

  draw() {
    c.save();
    c.translate(this.position.x, this.position.y);
    c.rotate(this.mouthDirection);
    c.translate(-this.position.x, -this.position.y)
    c.beginPath();
    c.fillStyle = 'yellow';
    c.lineTo(this.position.x, this.position.y);
    c.arc(
      this.position.x, this.position.y,
      this.radius, this.mouthOpn,
      Math.PI * 2 - this.mouthOpn
    );
    c.fill();
    c.closePath();
    c.restore();
  }

  updateInputs() {
    if(lastKey === 'd') {
      this.velocity.x = this.velocity.max;
      if(collidesWithTheBlock(player)) this.velocity.x = 0
      else this.mouthDirection = 0;
    }
    else if(lastKey === 'a') {
      this.velocity.x = -this.velocity.max;
      if(collidesWithTheBlock(player)) this.velocity.x = 0
      else this.mouthDirection = Math.PI;
    }
    else if(lastKey === 's') {
      this.velocity.y = this.velocity.max;
      if(collidesWithTheBlock(player)) this.velocity.y = 0
      else this.mouthDirection = Math.PI / 2;
    }

    else if(lastKey === 'w') {
      this.velocity.y = -this.velocity.max;
      if(collidesWithTheBlock(player)) this.velocity.y = 0
      else this.mouthDirection = Math.PI * 1.5;
    }  
  }

  move() {
    if(collidesWithTheBlock(this)) {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  update() {
    this.draw();
    this.updateInputs();
    outsideTheMapEvent(this);
    this.move();
    if(this.velocity.x || this.velocity.y) 
      this.mouthOpn > 1 ? this.mouthOpn = 0 : this.mouthOpn += 0.1;
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
  constructor(position, color) {
    this.color = color;
    this.position = {
      x: position.x,
      y: position.y
    }
    this.velocity = {
      x: 3,
      y: 0,
      max: Block.width / 10
    }
    this.radius = Block.width / 2 - 4
    this.scared = false;
    this.possibleDirections = new Array();
  }

  draw() {
    const actualColor = this.scared ? 'blue' : this.color;

    c.beginPath();
    c.fillStyle = actualColor;
    c.arc(
      this.position.x, this.position.y,
      this.radius, 0, Math.PI * 2
    );
    c.fill();
    c.closePath();

    c.beginPath();
    c.fillStyle = 'black';
    c.arc(
      this.position.x - this.radius / 2,
      this.position.y - this.radius / 3,
      this.radius / 6, 0, Math.PI * 2
    )

    c.arc(
      this.position.x + this.radius / 2,
      this.position.y - this.radius / 3,
      this.radius / 6, 0, Math.PI * 2
    )
    c.fill();
    c.closePath();
  }

  move() {
    const possibilities = getPossibleDirections(this);

    if(JSON.stringify(possibilities) !== JSON.stringify(this.possibleDirections)) {
      this.changeDirection(possibilities);
      this.possibleDirections = possibilities;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  
  changeDirection(possibilities) {
    if(possibilities.length > 0) {
      const newDirection = possibilities[
        Math.round(Math.random() * (possibilities.length - 1))
      ];

      this.velocity.x = newDirection.x;
      this.velocity.y = newDirection.y;
    }
    else this.turnBack();
  }

  turnBack() {
    this.velocity.x *= -1;
    this.velocity.y *= -1;
  }
  
  update() {
    this.draw();
    outsideTheMapEvent(this);
    this.move();
  }
}

const blocks = new Array(), ghosts = new Array();
const pellets = new Array(), powers = new Array();
var player, score, highScore = 0, actualLevel = 1;
var lastKey = null, gatesOpened = false, count;

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

    if(direction.x == -obj.velocity.x && direction.y == -obj.velocity.y)
      return false;

    return !collidesWithTheBlock(thisObj);
  });
};

function collidesWithTheCircle(target, circle) {
  const verDistance = target.position.x - circle.position.x;
  const horDistance = target.position.y - circle.position.y;
  const colDistance = target.radius + circle.radius;

  return Math.hypot(verDistance, horDistance) <= colDistance;
};

function collidesWithTheBlock(circle) {
  const constantRadius = Block.width / 2 - 0.2//to keep centralized

  return blocks.some(block => 
    circle.position.x + constantRadius + circle.velocity.x 
    >= block.position.x &&
    circle.position.x - constantRadius + circle.velocity.x 
    <= block.position.x + block.width &&
    circle.position.y + constantRadius + circle.velocity.y 
    >= block.position.y &&
    circle.position.y - constantRadius + circle.velocity.y
    <= block.position.y + block.height);     
};

function outsideTheMapEvent(circle) {
  if(circle.position.x >= canvas.width)
    circle.position.x = circle.radius;

  if(circle.position.x <= 0)
    circle.position.x = canvas.width - circle.radius;
}

function createMap() {
  const map = maps[actualLevel - 1];
  levelHTML.innerText = actualLevel;

  Block.width = Block.height = canvas.width / map[0].length;

  map.forEach((row, y) => {
    row.forEach((type, x) => {
      if(type === '.') createNewPellet({ x,y })
      else if(type === 'g') createNewGhost({ x,y })
      else if(type === 'p') createNewPlayer({ x,y })
      else if(type === 'o') createNewPower({ x,y })
      else if(type === '"') createNewGate({ x,y })
      else if(type != ' ') createNewBlock({ x,y }, type); 
    })
  });
};

function createNewBlock(position, blockType) {
  blocks.push(
    new Block(
      position = {
        x: Block.width * position.x,
        y: Block.height * position.y
      },
      image = getImage(blockType)
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

    case '"':
      image.src = './imgs/pipeCross.png';
      break;
  }

  return image;
};

function createNewGate(position) {
  blocks.push(
    new Gate(
      position = {
        x: Block.width * position.x,
        y: Block.height * position.y
      },
    )
  );
}

function createNewPellet(position) {
  pellets.push(
    new Pellet(
      position = {
        x: Block.width * position.x + Block.width / 2,
        y: Block.height * position.y + Block.height / 2
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
};

function createNewPlayer(position) {
  player = new Player(
    position = {
      x: Block.width * position.x + Block.width / 2,
      y: Block.height * position.y + Block.height / 2
    }
  );
};

function createNewGhost(position) {
  ghosts.push(
    new Ghost(
      position = {
        x: Block.width * position.x + Block.width / 2,
        y: Block.height * position.y + Block.height / 2
      },
      color = createRandomRGB()
    )
  );
};

function createRandomRGB() {
  return `RGB(
    ${Math.round((Math.random() * 200) + 55)},
    ${Math.round((Math.random() * 200) + 55)},
    ${Math.round((Math.random() * 200) + 55)}
  )`;
}

function openGates() {
  gatesOpened = true;
  setTimeout(()=> gatesOpened = false ,1000);
};

function gameOver() {
  if(score > highScore) highScore = score;
  highScoreHTML.innerText = highScore;

  setTimeout(()=> start() ,2000);
};

function run() {
  let animation = requestAnimationFrame(run);
  c.clearRect(0,0,canvas.width, canvas.height);

  scoreHTML.innerText = score;
  
  blocks.forEach((block) => {
    block.update();
  });

  pellets.forEach((pellet, i) => {
    pellet.draw();
    if(collidesWithTheCircle(player, pellet)) { 
      score += 10;
      delete pellets[i];
    }
  });
  
  powers.forEach((power, i) => {
    power.draw();
    if(collidesWithTheCircle(player, power)) {
      delete powers[i];
      
      ghosts.forEach((ghost)=> {
        ghost.scared = true;
        ghost.turnBack();
        setTimeout(()=> ghost.scared = false, 3000);
      })
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

  player && player.update();

  if(pellets.filter(e => e != '').length == 0) {
    levelUp();
    cancelAnimationFrame(animation);
  }
};

function levelUp() {
  actualLevel < maps.length ? actualLevel++ : alert('More levels are coming');
  
  setTimeout(()=> start() ,2000);
}

function start() {
  score = 0;
  count = 0;
  player = null, lastKey = null;

  ghosts.splice(0), pellets.splice(0);
  blocks.splice(0), powers.splice(0);

  createMap();
  run(); 
}

addEventListener('load', () => {
  start();
  addEventListener('keypress', ({ key }) => lastKey = key);
  alert('this game is in development');
  setInterval(()=> {
    count < 60 ? count++ : count = 0;
    
    if(count % 5 == 0) openGates();
  },1000);
});