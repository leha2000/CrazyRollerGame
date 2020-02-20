const Engine = Matter.Engine,
	Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies;


const Physics = {

	speed: 0,
	level: 0,
	winningArea:50,

	LEVELS: [
		{
			ground: [
				{x: 0, y: 500, w: 300, h: 20, shape: 'rect', friction:0.1},
				{x: 500, y: 500, w: 700, h: 20, shape: 'rect', friction:0, background:'#ff2211'},
				{x: 650, y: 400, w: 20, h: 200, shape: 'rect', friction:0.1, background:'#ffffff'},
			],
			staticObjects: [
				// {x: 400, y: 300, w: 700, h: 300, shape: 'rect', background:'#ffffff'},
			],
			thresholdPole:{x:150, y: 470, w: 20, h:50, shape:'rect', background:'#ff00ee'},
         	winningPole:{x:600,y:500,w:30, h: 150, shape:'rect', background:'#cc3133'},
			start: {x: 50, y: 170},
			win: {x: 125, y: 480, w: 10, h: 10},
			winningAroundWinningPole:false,
			instructions: "Use Arrow Keys to spin the roller clockwise and counterclockwise to roll it from platform " +
					"to platform and reach the red object without falling below."
		},
		{
			ground: [
				{x: 0, y: 500, w: 300, h: 20, shape: 'rect', friction:0.1},
				{x: 500, y: 500, w: 700, h: 20, shape: 'rect', friction:2, background:'#ff2211'},
				{x: 800, y: 400, w: 20, h: 200, shape: 'rect', friction:0.1, background:'#ffffff'},
			],
			staticObjects: [
				

			],
			thresholdPole:{x:150, y: 470, w: 20, h:50, shape:'rect', background:'#ff00ee'},
            winningPole:{x:600,y:500,w:30, h: 150, shape:'rect', background:'#cc3133'},
			start: {x: 50, y: 170},
			win: {x: 125, y: 480, w: 10, h: 10},
			winningAroundWinningPole:true,
			instructions: "Use Arrow Keys to spin the roller clockwise and counterclockwise to roll it from platform " +
					"reach out the pole with a flag to win the challenge, remember the surface is stickier than you think."
		},
		{
			ground: [
				{x: 0, y: 350, w: 300, h: 20, shape: 'rect', friction:0.1},
				{x: 255, y: 460, vertices: [{x: 330, y:200}, {x: 330, y: 380}, {x: 650, y: 380}], friction:1},
				{x: 500, y: 400, w: 600, h: 20, shape: 'rect', friction:0.1, background:'#ff2211'},
				{x: 800, y: 400, w: 20, h: 200, shape: 'rect', friction:0.1, background:'#ffffff'},
				
				
			],
			staticObjects: [

			],
			thresholdPole:{x:250, y: 400, w: 20, h:50, shape:'rect', background:'#ff00ee'},
            winningPole:{x:600,y:400,w:30, h: 150, shape:'rect', background:'#cc3133'},
			start: {x: 50, y: 170},
			win: {x: 125, y: 480, w: 10, h: 10},
			winningAroundWinningPole:true,
			instructions: "Use Arrow Keys to spin the roller clockwise and counterclockwise to roll it from platform " +
					"reach out the pole with a flag to win the challenge, remember the surface is stickier than you think."
		},
		{
			ground: [
				{x: 0, y: 350, w: 300, h: 20, shape: 'rect', friction:0.1},
				{x: 255, y: 460, vertices: [{x: 330, y:200}, {x: 330, y: 380}, {x: 650, y: 380}], friction:1},
				{x: 300, y: 400, w: 200, h: 20, shape: 'rect', friction:0.2, background:'#33cc33'},
				{x: 500, y: 400, w: 200, h: 20, shape: 'rect', friction:1, background:'#0000ff'},
				{x: 700, y: 400, w: 200, h: 20, shape: 'rect', friction:1, background:'#ff2211'},
				{x: 800, y: 400, w: 20, h: 200, shape: 'rect', friction:0.1, background:'#ffffff'},
				
			],
			staticObjects: [

			],
			thresholdPole:{x:320, y: 400, w: 20, h:50, shape:'rect', background:'#ff00ee'},
            winningPole:{x:700,y:400,w:30, h: 150, shape:'rect', background:'#cc3133'},
			start: {x: 50, y: 170},
			win: {x: 125, y: 480, w: 10, h: 10},
			winningAroundWinningPole:true,
			instructions: "Use Arrow Keys to spin the roller clockwise and counterclockwise to roll it from platform " +
					"reach out the pole with a flag to win the challenge, remember the surface is stickier than you think."
		},
		
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

	addLevel: function (level) {
		const ground = level.ground;
		const thresholdPole = level.thresholdPole;
		const winningPole = level.winningPole;
		const staticObject = level.staticObjects;
		this.addStaticObject(staticObject);
		this.addGround(ground);
		this.addPole(thresholdPole);
		this.addPole(winningPole);
		
	},

	addGround : function(grounds){

		let result = [];
		for (let i = 0; i < grounds.length; i++) {
			const g = grounds[i];
			let elem = this.createGround(g);
			elem.friction = 'friction' in g ? g.friction : 0.1;
			elem.frictionAir = 1;
			elem.frictionStatic = 0;
			result.push(elem);
		}
		World.add(this.engine.world, result);

	},

	addPole : function(pole){
      let elem = this.createGround(pole);
      elem.isSensor = true;
      World.add(this.engine.world, elem);
	},
	
	addStaticObject : function(staticObj){

		let result = [];
		for(let i = 0; i < staticObj.length; i++){
			const static = staticObj[i];
			let elem = this.createGround(static);
			elem.isSensor = true;
			result.push(elem);
		}
		World.add(this.engine.world, result);
	  },

	checkKeys: function (evt) {
		if(!Physics.IsInputPaused) {
			switch (evt.keyCode) {
				case 37:
					Physics.changeSpeed(-1);
					break;
				case 39:
					Physics.changeSpeed(1);
					break;
			}
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
		this.addLevel(level);
		document.getElementById('instructions').innerHTML = level.instructions;
		document.getElementById('level').innerText = 'level ' + (this.level + 1);
	},

	checkWinningPosition:function(circle){

		const winningPolePos = this.LEVELS[this.level].winningPole;
		const winningAroundPole = this.LEVELS[this.level].winningAroundWinningPole;

		if(!winningAroundPole){ // for tutorial level
			return this.checkMoreThanWinningPole(circle.position,winningPolePos);
		}else{
			if(circle.speed < 0.3 && Physics.IsInputPaused)
				if(this.checkAroundWinningPole(circle.position,winningPolePos,Physics.winningArea))
					return 1;
				else
					return -1;
		}

		return 0;
	},

	checkMoreThanWinningPole:function(positionCircle, positionWinning){

		if(positionCircle.x > positionWinning.x)
			return 1;
		else 
			return 0;

	},

	checkAroundWinningPole:function(positionCircle, positionWinning, thresholdDistance){

		const distX = positionCircle.x - positionWinning.x;
		const distY = positionCircle.y - positionWinning.y;

		const distanceBetweenPoints = Math.sqrt((distX * distX) + (distY * distY));
		if(distanceBetweenPoints < thresholdDistance)
			return 1;
		else
			return 0;
	},

	checkTresholdPole:function(position){

		const thresholdPos = this.LEVELS[this.level].thresholdPole;

		if(position.x > thresholdPos.x)
			return 1;
		else
			return 0;

	},

	checkState: function () {
		const income = this.checkWinningPosition(this.circle);
		if (income != 0) {
			this.endGame(income == 1);
			return;
		}

		const IsInputPaused = this.checkTresholdPole(this.circle.position);
		this.IsInputPaused = IsInputPaused;
		console.log(IsInputPaused);


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
				this.level = 0;
				this.setStatus("you completed the game");
				setTimeout("Physics.rerun(" + win + ")", 3000);
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
		Physics.IsInputPaused = false;
		Matter.World.clear(this.engine.world, !changeLevel);
		if (changeLevel) {
			this.buildLevel();
		}
		this.run();
	}
};
