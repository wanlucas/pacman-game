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
    c.fillRect(
      this.position.x, this.position.y,
      this.width, this.height
      );
  };
};

const map = [
  ['+','+','+','+','+','+'],
  ['+','-','-','-','+','+'], 
  ['+','-','-','-','-','+'],
  ['+','-','-','+','+','+'],
  ['+','+','+','+','+','+']
];
const boundaries = [];

const createMap = () => {

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

const run = () => {
  boundaries.forEach((boundarie) => boundarie.draw());
}

addEventListener('load', ()=> {
  createMap();
  run();
})