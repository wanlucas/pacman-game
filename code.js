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
    if(keys.right.pressed && keys.lastKey === 'd')
      this.velocity.x = 5;
    else if(keys.left.pressed && keys.lastKey === 'a') 
      this.velocity.x = -5;
    else if(keys.bottom.pressed && keys.lastKey === 's')
      this.velocity.y = 5;
    else if(keys.top.pressed && keys.lastKey === 'w') 
      this.velocity.y = -5;
  }

  update() {
    this.draw();
    this.updateInputs();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
const boundaries = [];

const player = new Player(
  position = {
    x: Boundarie.width + Boundarie.width / 2,
    y: Boundarie.height + Boundarie.height / 2
  }
);

const keys = {
  right: {
    pressed: false
  },
  left: {
    pressed: false
  },
  bottom: {
    pressed: false
  },
  top: {
    pressed: false
  },
  lastKey: null
};

function createMap() {
  const map = [
    ['+','+','+','+','+','+'],
    ['+','-','-','-','-','+'], 
    ['+','-','+','+','-','+'],
    ['+','-','-','-','-','+'],
    ['+','+','+','+','+','+'],
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

function run() {
  c.clearRect(0,0,canvas.width, canvas.height);
  boundaries.forEach((boundarie) => boundarie.draw());
  player.update();
  requestAnimationFrame(run);
}

function addInputEvents() {
  addEventListener('keydown', ({ key }) => {
    keys.lastKey = key;
    if(key === 'd') keys.right.pressed = true;
    else if(key === 'a') keys.left.pressed = true;
    else if(key === 'w') keys.top.pressed = true;
    else if(key === 's') keys.bottom.pressed = true;
  });
  addEventListener('keyUp', ({ key }) => {
    if(key === 'd') keys.right.pressed = false;
    else if(key === 'a') keys.left.pressed = false;
    else if(key === 'w') keys.top.pressed = false;
    else if(key === 's') keys.bottom.pressed = false;
  });
};

addEventListener('load', ()=> {
  createMap();
  addInputEvents();
  run();
})