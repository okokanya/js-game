'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	plus(newVector) {
		if (!(newVector instanceof Vector)) {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
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
	constructor(
		pos = new Vector(0, 0),
		size = new Vector(1, 1),
		speed = new Vector(0, 0)
	) {
		if (
			!(
				(pos instanceof Vector) &
				(size instanceof Vector) &
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

// ** пример использования

// const items = new Map();
// const player = new Actor();
// items.set('Игрок', player);
// items.set('Первая монета', new Actor(new Vector(10, 10)));
// items.set('Вторая монета', new Actor(new Vector(15, 5)));

// function position(item) {
//   return ['left', 'top', 'right', 'bottom']
//     .map(side => `${side}: ${item[side]}`)
//     .join(', ');
// }

// function movePlayer(x, y) {
//   player.pos = player.pos.plus(new Vector(x, y));
// }

// function status(item, title) {
//   console.log(`${title}: ${position(item)}`);
//   if (player.isIntersect(item)) {
//     console.log(`Игрок подобрал ${title}`);
//   }
// }

// items.forEach(status);
// movePlayer(10, 10);
// items.forEach(status);
// movePlayer(5, -5);
// items.forEach(status);

// ----------
class Level {
	constructor(grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.player = this.actors.find(function(actor) {
			return actor.type === 'player';
		});

		if (typeof grid !== 'undefined') {
			this.height = grid.length;
			this.width = Math.max(
				...grid.map(function(arr) {
					return arr.length;
				})
			);
		} else {
			this.height = 0;
			this.width = 0;
		}
		this.status = null;
		this.finishDelay = 1;
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

		let actor = new Actor(pos, size);

		if (actor.bottom >= this.height) {
			return 'lava';
		}
		if (actor.left < 0 || actor.top < 0 || actor.right >= this.width) {
			return 'wall';
		}
		if (typeof this.grid === 'undefined') {
			return;
		}
		for (let y = Math.floor(actor.top); y < Math.ceil(actor.bottom); y++) {
			for (let x = Math.floor(actor.left); x < Math.ceil(actor.right); x++) {
				if (typeof (this.grid[x][y] !== 'undefined')) {
					return this.grid[x][y];
				}
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
		if (this.status !== null) {
			return;
		}

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

// ** пример использования
// const grid = [[undefined, undefined], ['wall', 'wall']];
// function MyCoin(title) {
// 	this.type = 'coin';
// 	this.title = title;
// }
// MyCoin.prototype = Object.create(Actor);
// MyCoin.constructor = MyCoin;

// const goldCoin = new MyCoin('Золото');
// const bronzeCoin = new MyCoin('Бронза');
// const player = new Actor();
// const fireball = new Actor();

// const level = new Level(grid, [goldCoin, bronzeCoin, player, fireball]);

// level.playerTouched('coin', goldCoin);
// level.playerTouched('coin', bronzeCoin);

// if (level.noMoreActors('coin')) {
// 	console.log('Все монеты собраны');
// 	console.log(`Статус игры: ${level.status}`);
// }

// const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
// if (obstacle) {
// 	console.log(`На пути препятствие: ${obstacle}`);
// }

// const otherActor = level.actorAt(player);
// if (otherActor === fireball) {
// 	console.log('Пользователь столкнулся с шаровой молнией');
// }
 

// ---- конец примера ---
class LevelParser {
	constructor(dictionary) {
		this.dictionary = dictionary;
	}

	actorFromSymbol(symbol) {
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
		return plan.map(el => {
			return el.split('').map(elem => {
				return this.obstacleFromSymbol(elem);
			});
		});
	}

	createActors(plan) {
		const actors = [];
		if (this.dictionary) {
			plan.forEach((string, y) => {
				string.split('').forEach((symbol, x) => {
					const actor = this.actorFromSymbol(symbol);
					if (typeof actor === 'function') {
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


// ----  пример использования ---
const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));
// ----  пример использования ---

