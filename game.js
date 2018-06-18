'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(newVector) {
    if (!(newVector instanceof Vector)) {
      throw new Error('Можно прибавлять только вектор типа Vector');
    }
    return new Vector(this.x + newVector.x, this.y + newVector.y);
  }
  times(number) {
    return new Vector(this.x * number, this.y * number);
  }
}
class Actor {
  constructor(
    pos = new Vector(0, 0),
    size = new Vector(1, 1),
    speed = new Vector(0, 0)
  ) {
    if (
      !(
        (pos instanceof Vector) &&
        (size instanceof Vector) &&
        (speed instanceof Vector)
      )
    ) {
      throw new Error('Можно передать только вектор типа Vector');
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
      throw new Error('Можно передать только объект типа Actor');
    }
    if (item === this) {
      return false;
    }
    return (
      this.top < item.bottom &&
      this.bottom > item.top &&
      this.left < item.right &&
      this.right > item.left
    );
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid.slice();
    this.actors = actors.slice();
    this.status = null;
    this.finishDelay = 1;
    this.height = this.grid.length;
    this.width = Math.max(0, ...grid.map(el => el.length));
    this.player = this.actors.find(el => el.type === 'player');
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }
  actorAt(newActor) {
    if (!(newActor instanceof Actor)) {
      throw new Error('аргумент - объект типа Actor');
    }
    return this.actors.find(elem => newActor.isIntersect(elem));
  }

  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Тип аргумента - Vector');
    }
    
    if (pos.x < 0 || pos.y < 0 || pos.x + size.x >= this.width) {
      return 'wall';
    }
    if(pos.y + size.y >= this.height) {
      return 'lava';
    }

    // лучше не объявлять переменные через запятую
    // переменные пишутся camelCase
    // если знанчение присваивается переменной один раз, то лучше использвоать const
    let Top = Math.floor(pos.y),
    Bottom = Math.ceil(pos.y + size.y),
    Left = Math.floor(pos.x),
    Right = Math.ceil(pos.x + size.x);

    for (let y = Top; y < Bottom; y++) {
      for (let x = Left ; x < Right ; x++) {                
        // лучше проверять целостность в конструкторе, если это нужно,
        // а дальше по коду не делать таких проверок
        const obstacle = this.grid[y] && this.grid[y][x];
        // фигурные скобки лучше не опускать
        if (obstacle) return obstacle;
      }
    }
  }

  removeActor(actor) {
    this.actors = this.actors.filter(item => item !== actor);
  }

  noMoreActors(type) {
    return !this.actors.some(item => item.type === type);
  }

  playerTouched(typeString, actorTouch) {
    // фигурные скобки лучше не опускать
    if (this.status) return;

    if (typeString === 'lava' || typeString === 'fireball') {
      this.status = 'lost';
    }

    
    if (typeString === 'coin') {
      this.removeActor(actorTouch);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}
class LevelParser {
  // личше добавить значение по-умолчанию
  constructor(dictionary) {
    // раз в Level вы создаёте копии массивов, тут тоже не мешало бы
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) {
    // лишняя проверка
    if (symbol === undefined) return;
    return this.dictionary[symbol];
  }

  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    }
    if (symbol === '!') {
      return 'lava';
    }
  }

  createGrid(plan) {
    // можно использовать короткую форму записи стрелочных функций
    // без фигурных скобок и return
    return plan.map(el => {
      return el.split('').map(elem => {
        return this.obstacleFromSymbol(elem);
      });
    });
  }

  createActors(plan) {
    const actors = [];
    // лучше сделать так, чтобы после создания объекта он был валиден
    if (this.dictionary) {
      plan.forEach((string, y) => {
        string.split('').forEach((symbol, x) => {
          const actor = this.actorFromSymbol(symbol);
          if (typeof actor === 'function') {
            // const
            let newActor = new actor(new Vector(x, y));
            if (newActor instanceof Actor) {
              actors.push(newActor);
            }
          }
        });
      });
    }
    return actors;
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }
}

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, new Vector(1, 1), speed);
  }
  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    // перемудрили, нужно упростить
    return new Vector(this.pos.x, this.pos.y).plus(
      new Vector(this.speed.x * time, this.speed.y * time)
    );
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    // const
    let newPosition = this.getNextPosition(time);
    if (level.obstacleAt(newPosition, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = newPosition;
    }
  }
}

class HorizontalFireball extends Fireball {
  // можно добавить значение по-умолчанию
  constructor(pos) {
    super(pos, new Vector(2, 0));
  }
}
class VerticalFireball extends Fireball {
  // можно добавить значение по-умолчанию
  constructor(pos) {
    super(pos, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(coords) {
    super(coords, new Vector(0, 3));
    this.startPos = coords;
  }
  handleObstacle() {
    this.pos = this.startPos;
  }
}
class Coin extends Actor {
  constructor(pos) {
    // const
    let size = new Vector(0.6, 0.6);
    let delta = new Vector(0.2, 0.1);
    super(pos, size);

    // pos должен задаваться через родительский конструктор
    this.pos = this.pos.plus(delta);
    this.startPos = new Vector(this.pos.x, this.pos.y);

    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    // лишнее создание объекта
    let newPosition = new Vector(this.startPos.x, this.startPos.y);
    this.updateSpring(time);
    return newPosition.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}
class Player extends Actor {
  constructor(pos) {
    // let size = new Vector(0.8, 1.5); -- original size of player

    // см. выше
    let size = new Vector(0.8, 0.8);
    let delta = new Vector(0, -0.5);

    super(pos, size);
    this.pos = this.pos.plus(delta);
  }

  get type() {
    return 'player';
  }
}

const actorDict = {
  '@': Player,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'v': FireRain,
  'o': Coin
}

const parser = new LevelParser(actorDict);
loadLevels()
  .then(schemas => runGame(JSON.parse(schemas), parser, DOMDisplay))
  .then(() => alert('Вы выиграли приз!'))
  .catch(err => alert.log(err));

