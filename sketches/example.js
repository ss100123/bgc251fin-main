const { Responsive } = P5Template;

let node = [];
let link = [];

const grd = 20;
const friction = 0.99;
const motion = 0.2;
const speedLimit = 5;

function setup() {
  new Responsive().createResponsiveCanvas(400, 300, 'fill', false);
  node = mnode();
  link = linkp(node);
}

function draw() {
  background('#000');

  if (mouseIsPressed) {
    let cur = createVector(mouseX, mouseY);
    let range = 80;
    let pull = 50;
    for (let i = 0; i < node.length; i++) {
      let n = node[i];
      if (!n.jum) {
        let d = p5.Vector.dist(n.pos, cur);
        if (d < range) {
          let dir = p5.Vector.sub(cur, n.pos);
          dir.setMag((range - d) * pull * 0.05);
          n.force.add(dir);
        }
      }
    }
  }

  for (let i = 0; i < link.length; i++) link[i].update();
  for (let i = 0; i < node.length; i++) node[i].update();

  for (let i = 0; i < link.length; i++) link[i].show();
  for (let i = 0; i < node.length; i++) node[i].show();
}

class Node {
  constructor(x, y, jum) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.force = createVector(0, 0);
    this.jum = jum;
  }

  update() {
    if (this.jum) return;
    let acc = this.force.copy().mult(motion);
    this.vel.add(acc);
    this.vel.limit(speedLimit);
    this.pos.add(this.vel);
    this.force.set(0, 0);
    this.vel.mult(friction);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    point(this.pos.x, this.pos.y);
  }
}

class Link {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.rest = p5.Vector.dist(a.pos, b.pos);
  }

  update() {
    let dir = p5.Vector.sub(this.b.pos, this.a.pos);
    let dist = dir.mag();
    let stretch = dist - this.rest;
    dir.normalize().mult(0.5 * stretch);

    if (!this.a.jum) this.a.force.add(dir);
    if (!this.b.jum) this.b.force.sub(dir);
  }

  show() {
    stroke(255, 100);
    strokeWeight(1);
    line(this.a.pos.x, this.a.pos.y, this.b.pos.x, this.b.pos.y);
  }
}

function mnode() {
  let arr = [];
  for (let y = 0; y <= grd; y++) {
    for (let x = 0; x <= grd; x++) {
      let px = map(x, 0, grd, 0, width);
      let py = map(y, 0, grd, 0, height);
      let jum = x == 0 || y == 0 || x == grd || y == grd;
      arr.push(new Node(px, py, jum));
    }
  }
  return arr;
}

function linkp(node) {
  let arr = [];
  let idx = (x, y) => y * (grd + 1) + x;
  for (let y = 0; y < grd; y++) {
    for (let x = 0; x < grd; x++) {
      let i = idx(x, y);
      let right = idx(x + 1, y);
      let down = idx(x, y + 1);
      arr.push(new Link(node[i], node[right]));
      arr.push(new Link(node[i], node[down]));
    }
  }
  return arr;
}
