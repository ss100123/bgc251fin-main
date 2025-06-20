let nodeArray = [];
let linkArray = [];

const gridCount = 20; // 40은 너무 커서 성능 저하 → 20 추천
const friction = 0.99;
const forceMultiplier = 0.2;
const speedLimit = 5;

function setup() {
  const container = document.getElementById('canvas-container');
  const w = container.clientWidth;
  const h = container.clientHeight;
  const cnv = createCanvas(w, h);
  cnv.parent(container);

  nodeArray = createNodes();
  linkArray = createLinks(nodeArray);
}

function windowResized() {
  const container = document.getElementById('canvas-container');
  resizeCanvas(container.clientWidth, container.clientHeight);
}

function draw() {
  background(255);

  if (mouseIsPressed) {
    const cursor = createVector(mouseX, mouseY);
    const range = 80;
    const pullStrength = 50;

    nodeArray.forEach((n) => {
      if (!n.pinned) {
        const d = p5.Vector.dist(n.pos, cursor);
        if (d < range) {
          const dir = p5.Vector.sub(cursor, n.pos);
          dir.setMag((range - d) * pullStrength * 0.05);
          n.force.add(dir);
        }
      }
    });
  }

  linkArray.forEach((l) => l.update());
  nodeArray.forEach((n) => n.update());

  linkArray.forEach((l) => l.show());
  nodeArray.forEach((n) => n.show());
}

class Node {
  constructor(x, y, pinned) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.force = createVector(0, 0);
    this.pinned = pinned;
  }

  update() {
    if (this.pinned) return;

    const acc = this.force.copy().mult(forceMultiplier);
    this.vel.add(acc);
    this.vel.limit(speedLimit);
    this.pos.add(this.vel);
    this.force.set(0, 0);
    this.vel.mult(friction);
  }

  show() {
    stroke(0);
    strokeWeight(2);
    point(this.pos.x, this.pos.y);
  }
}

class Link {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.restLength = p5.Vector.dist(a.pos, b.pos);
  }

  update() {
    const dir = p5.Vector.sub(this.b.pos, this.a.pos);
    const dist = dir.mag();
    const stretch = dist - this.restLength;
    dir.normalize().mult(0.5 * stretch);

    if (!this.a.pinned) this.a.force.add(dir);
    if (!this.b.pinned) this.b.force.sub(dir);
  }

  show() {
    stroke(50);
    strokeWeight(1);
    line(this.a.pos.x, this.a.pos.y, this.b.pos.x, this.b.pos.y);
  }
}

function createNodes() {
  const nodes = [];
  for (let y = 0; y <= gridCount; y++) {
    for (let x = 0; x <= gridCount; x++) {
      const px = map(x, 0, gridCount, 0, width);
      const py = map(y, 0, gridCount, 0, height);
      const pinned = x === 0 || y === 0 || x === gridCount || y === gridCount;
      nodes.push(new Node(px, py, pinned));
    }
  }
  return nodes;
}

function createLinks(nodes) {
  const links = [];
  const getIndex = (x, y) => y * (gridCount + 1) + x;
  for (let y = 0; y < gridCount; y++) {
    for (let x = 0; x < gridCount; x++) {
      const i = getIndex(x, y);
      const right = getIndex(x + 1, y);
      const down = getIndex(x, y + 1);
      links.push(new Link(nodes[i], nodes[right]));
      links.push(new Link(nodes[i], nodes[down]));
    }
  }
  return links;
}
