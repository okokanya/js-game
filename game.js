'use strict';

class Vector {
	constructor(x = 0,y = 0) {
		this.x = x;
		this.y = y
	  }
	plus(newVector) {
		if (!(newVector instanceof Vector)) {
			throw new Error ('Можно прибавлять к вектору только вектор типа Vector');
		}
		return new Vector(this.x + newVector.x, this.y + newVector.y);
	}
 	times(number) {
 		return new Vector(this.x * number, this.y * number);
 	}
}

const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector & size instanceof Vector & speed instanceof Vector)) {
      throw new Error("Можно передать только вектор типа Vector");
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }
  act() {}

  get left() {
    return this.pos.x;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get top() {
    return this.pos.y;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return 'actor';
  }

  isIntersect(item) {
    if (!(item instanceof Actor)) {
      throw new Error("Можно передать только объект типа Actor");
    }
    if (item === this) {
      return false;
    }
    return this.top < item.bottom && this.bottom > item.top && this.left < item.right && this.right > item.left
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

// ----------


