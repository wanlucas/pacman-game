const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const width = canvas.width = innerWidth;
const height = canvas.height = innerHeight;

class Boundarie {
  static width = 60;
  static height = 60;
  constructor(position) {
    this.position = {
      x: position.x,
      y: position.y
    };
    this.width = 60, this.height = 60;
  }
  draw(){
    c.fillStyle = 'black';
    c.fillRect(
      this.position.x, this.position.y,
      this.width, this.height
      );
  };
  update(){
  
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
    this.r = (Boundarie.width / 2) - 5
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
    this.velocity.x = 0, this.velocity.y = 0;

    if(lastKey === 'd')
      this.velocity.x = 5;
    else if(lastKey === 'a') 
      this.velocity.x = -5;
    else if(lastKey === 's')
      this.velocity.y = 5;
    else if(lastKey === 'w') 
      this.velocity.y = -5;
  }

  move() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  update() {
    this.draw();
    this.move();
    this.updateInputs();
  }
}


const boundaries = [];
const player = new Player(
  position = {
    x: Boundarie.width + Boundarie.width / 2,
    y: Boundarie.height + Boundarie.height / 2
  }
);
var lastKey = null;

function createMap() {
  const map = [
    ['+','+','+','+','+','+','+','+','+','+','+','+'],
    ['+','-','-','-','-','-','-','-','-','-','-','+'], 
    ['+','-','+','+','+','+','+','+','+','+','-','+'],
    ['+','-','-','-','-','-','-','-','-','-','-','+'],
    ['+','+','+','+','+','+','+','+','+','+','+','+']
  ];

  map.forEach((row,i) => {
    row.forEach((block, i2) => {
      if(block === '+') {
        boundaries.push(
          new Boundarie(
            position = {
              x: Boundarie.width * i2,
              y: Boundarie.height * i
            }
          )
        )
      }
    })
  });
};

function colission(boundarie) {
  if(player.position.x + player.r + player.velocity.x 
    >= 
    boundarie.position.x &&
    player.position.x - player.r + player.velocity.x 
    <=
    boundarie.position.x + boundarie.width &&
    player.position.y + player.r + player.velocity.y 
    >= 
    boundarie.position.y &&
    player.position.y - player.r + player.velocity.y
    <= 
    boundarie.position.y + boundarie.height) {

      player.velocity.x = 0, player.velocity.y = 0;
    }  
};

function run() {
  requestAnimationFrame(run);
  c.clearRect(0,0,canvas.width, canvas.height);
  boundaries.forEach((boundarie) => {
    boundarie.draw();
    colission(boundarie);
  });
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
})