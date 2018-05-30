'use strict';

function Vector(x = 0, y = 0) {
  this.x = x;
  this.y = y;

  this.plus = function(vector) {
    if (!vector instanceof Vector) throw 'Можно прибавлять к вектору только вектор типа Vector';
    const x = this.x + vector.x;
    const y = this.y + vector.y;
    return new Vector(x, y);
  }

  this.times = function(number) {
    const x = this.x * number;
    const y = this.y * number;
    return new Vector(x, y);
  }
}

  function Actor (pos = new Vector(0, 0), size = new Vector (1, 1), speed = new Vector (0, 0)) {
     if (!pos instanceof Vector) throw 'position error';
     if (!size instanceof Vector) throw 'size error';
     if (!speed instanceof Vector) throw 'speeed error';

      this.pos = pos;
      this.size = size;
      this.speed = speed;
    
      Object.defineProperty(this, "left", {
      value: this.pos.x,
      writable: false,
      configurable: false
    });

      Object.defineProperty(this, "top", {
      value: this.pos.y,
      writable: false,
      configurable: false
    });

      Object.defineProperty(this, "right", {
      value: this.pos.x + this.size.x,
      writable: false,
      configurable: false
    });

      Object.defineProperty(this, "bottom", {
      value: this.pos.y + this.size.y,
      writable: false,
      configurable: false
    });
    
      Object.defineProperty(this, "type", {
      value: 'actor',
      writable: false,
      configurable: false
    });

      this.isIntersect = function (object) {
        if (!object instanceof Actor) throw 'object type error';
        if (this.left < object.right && object.left < this.right) return true;
        if (this.top < object.bottom && object.top < this.bottom) return true;
        return false;
      }
  }


const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));
    
function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);

