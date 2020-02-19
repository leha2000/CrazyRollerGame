const Engine = Matter.Engine,
	Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies;


const Physics = {

	speed: 0,
	level: 0,

	LEVELS: [
		{
			ground: [
				{x: 310, y: 200, w: 600, h: 20, shape: 'rect'},
				{x: 650, y: 280, vertices: [{x: 650, y: 280}, {x: 330, y: 330}, {x: 650, y: 330}]},
				{x: 300, y: 350, vertices: [{x: 350, y: 350}, {x: 0, y: 300}, {x: 0, y: 350}]},
				{x: 55, y: 500, vertices: [{x: 55, y: 500}, {x: 55, y: 550}, {x: 200, y: 550}]},
				{x: 160, y: 450, w: 20, h: 100, shape: 'rect', background: '#FF0000'},
			],
			start: {x: 50, y: 170},
			win: {x: 125, y: 480, w: 10, h: 10},
			instructions: "Use Arrow Keys to spin the roller clockwise and counterclockwise to roll it from platform " +
					"to platform and reach the red object without falling below."
		},
		{
			ground: [
				{x: 310, y: 200, w: 600, h: 20, shape: 'rect'},
				{x: 650, y: 280, vertices: [{x: 650, y: 280}, {x: 330, y: 330}, {x: 650, y: 330}]},
				{x: 350, y: 350, vertices: [{x: 350, y: 350}, {x: 0, y: 300}, {x: 0, y: 350}]},
				{x: 120, y: 340, w: 140, h: 20, shape: 'rect'},
				{x: 55, y: 500, vertices: [{x: 55, y: 500}, {x: 55, y: 550}, {x: 200, y: 550}]},
				{x: 160, y: 450, w: 20, h: 100, shape: 'rect', background: '#FF0000'},
			],
			start: {x: 50, y: 170},
			win: {x: 125, y: 480, w: 10, h: 10},
			instructions: "Use Arrow Keys to spin the roller clockwise and counterclockwise to roll it from platform " +
					"to platform and reach the red object without falling below.<br>More platforms!"
		}
	],

	createGround: function(g) {
		let color = '#cccccc';
		if ('background' in g) {
			color = g.background;
		}
		let props = {isStatic: true, render: {fillStyle: color}};
		if ('backgroundImage' in g) {
			props.render.sprite = {texture: g['backgroundImage']};
		}

		if (g.shape == 'rect') {
			return Bodies.rectangle(g.x, g.y, g.w, g.h, props);
		}
		return Bodies.fromVertices(g.x, g.y, g.vertices, props);
	},

	addLevel: function (grounds) {
		let result = [];
		for (let i = 0; i < grounds.length; i++) {
			const g = grounds[i];
			let elem = this.createGround(g);
			elem.friction = 'friction' in g ? g.friction : 0.1;
			elem.frictionStatic = 0;
			result.push(elem);
		}
		World.add(this.engine.world, result);
	},

	checkKeys: function (evt) {
		switch (evt.keyCode) {
			case 37:
				Physics.changeSpeed(-1);
				break;
			case 39:
				Physics.changeSpeed(1);
				break;
		}
	},

	changeSpeed: function(inc) {
		const speed = this.circle.angularVelocity + inc * 0.01;
		Body.setAngularVelocity(this.circle, speed);
	},

	init: function () {
		this.engine = Engine.create();
		this.render = Render.create({
		    element: document.getElementById('sim'),
		    engine: this.engine,
			options: {wireframes: false}
		});

		Render.run(this.render);
		Engine.run(this.engine);

		this.buildLevel();
	},

	buildLevel: function () {
		let level = this.LEVELS[this.level];
		this.addLevel(level.ground);
		document.getElementById('instructions').innerHTML = level.instructions;
		document.getElementById('level').innerText = 'level ' + (this.level + 1);
	},

	checkPosition: function(position) {
		const x = position.x;
		const y = position.y;
		if (y > 500) {
			return -1;
		}
		const win = this.LEVELS[this.level].win;
		if ((x > win.x && x < win.x + win.w) && (y > win.y && y < win.y + win.h)) {
			return 1;
		}
		return 0;
	},

	checkState: function () {
		const income = this.checkPosition(this.circle.position);
		if (income != 0) {
			this.endGame(income == 1);
			return;
		}

		const speed = Math.round(this.circle.angularVelocity * 100);
		const speedText = speed < 0 ? "< " + (-speed) : speed + (speed > 0 ? " >" : "");
		this.setStatus(speedText);

		this.checkFunc = setTimeout("Physics.checkState()", 100);
	},

	endGame: function (win) {
		this.setStatus(win ? "Win!" : "Game over!");
		if (win) {
			this.level += 1;
			if (this.level >= this.LEVELS.length) {
				return;
			}
		}
		setTimeout("Physics.rerun(" + win + ")", 3000);
	},

	setStatus: function (text) {
		document.getElementById('speed').innerText = text;
	},

	run: function () {
		const start = this.LEVELS[this.level].start;
		const circle = Bodies.circle(start.x, start.y, 20);
		circle.friction = 0.1;
		circle.frictionAir = 0;
		circle.frictionStatic = 0;

		Matter.World.add(this.engine.world, [circle]);
		this.circle = circle;

		window.addEventListener('keydown', this.checkKeys);
		this.checkState();
	},

	rerun: function (changeLevel) {
		Matter.World.clear(this.engine.world, !changeLevel);
		if (changeLevel) {
			this.buildLevel();
		}
		this.run();
	}
};
