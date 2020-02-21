const Engine = Matter.Engine,
	Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies;


const CarSounds = {

    accelerationSound: new Audio("sound/drive.mp3"),
    brakeSound: new Audio("sound/tyre.mp3"),

    state: 0,

    init: function () {
        this.accelerationSound.loop = true;
        this.accelerationSound.volume = 0.3;
        this.brakeSound.loop = true;
        this.brakeSound.volume = 0.3;
    },

    start: function (state) {
        if (this.state != state) {
            this.stop();
            this.state = state;
            this.sound(state).play();
            if (this.stopHandler != null) {
                clearTimeout(this.stopHandler);
            }
            this.stopHandler = setTimeout("CarSounds.stop()", 1000);
        }
    },

    sound: function (state) {
        return state == 1 ? this.accelerationSound : this.brakeSound;
    },

    stop: function () {
        if (this.state != 0) {
            this.sound(this.state).pause();
            this.state = 0;
        }
    }
};

const Physics = {

	speed: 0,
	level: 0,
	winningArea:50,

	LEVELS: [
		{
			ground: [
				{x: 200, y: 500, w: 400, h: 20, shape: 'rect'},
				{x: 360, y: 475, vertices: [{x: 0, y: 50}, {x: 100, y: 0}, {x: 100, y: 50}]},
				{x: 670, y: 500, w: 420, h: 20, shape: 'rect'},
			],
			staticObjects: [

				{x: 410, y: 300, w: 800, h: 600, shape: 'rect', backgroundImage:'img/level_1.png'},

			],
			thresholdPole:{x: 1000, y: 470, w: 20, h:50, shape:'rect', background:'#ff00ee'},
			winningPole:{x:700, y:470, w:30, h: 150, shape:'rect', backgroundImage: 'img/red-flag.png'},
			start: {x: 50, y: 170},
			win: {x: 125, y: 480, w: 10, h: 10},
			winningAroundWinningPole:false,

			instructions: "Use Arrow Keys to spin the roller clockwise and counterclockwise to roll it from platform" +
					"to platform to reach out the pole with a flag to win the challenge."+
					"<br/><br/> ps : gravity is just like fire, you need to befriend it &#128513;"

		},
		{
			ground: [
				{x: 175, y: 500, w: 450, h: 20, shape: 'rect'},
				{x: 300, y: 500, w: 150, h: 20, shape: 'rect', background: 'red', friction: 0},
				{x: 500, y: 500, w: 200, h: 20, shape: 'rect'},
				{x: 565, y: 482, vertices: [{x: 0, y: 50}, {x: 100, y: 0}, {x: 100, y: 50}]},
				{x: 870, y: 500, w: 420, h: 20, shape: 'rect'},
			],
			staticObjects: [
				{x: 400, y: 300, w: 850, h: 620, shape: 'rect', backgroundImage:'img/level_2.png'},
			],
			grassAreas: [{left: 225, right: 375}],
			thresholdPole:{x: 1000, y: 470, w: 20, h:50, shape:'rect', background:'#ff00ee'},
			winningPole:{x:700, y:470, w:30, h: 150, shape:'rect', backgroundImage: 'img/red-flag.png'},
			start: {x: 25, y: 170},
			win: {x: 125, y: 480, w: 10, h: 10},
			winningAroundWinningPole:false,
			instructions: "Use Arrow Keys to spin the roller clockwise and counterclockwise to roll it from platform " +
					"to platform to reach out the pole with a flag to win the challenge.<br><br>" +

					"<br/><br/> ps : psssttt... make sure you adapt yourself when you walk &#129488;"

		},
		{
			ground: [
				{x: 210, y: 200, w: 400, h: 20, shape: 'rect'},
				{x: 510, y: 200, w: 200, h: 20, shape: 'rect', background: '#0000FF', friction: 0},
				{x: 650, y: 280, vertices: [{x: 650, y: 280}, {x: 330, y: 330}, {x: 650, y: 330}]},
				{x: 350, y: 350, vertices: [{x: 350, y: 350}, {x: 0, y: 300}, {x: 0, y: 350}]},
				{x: 130, y: 340, w: 120, h: 20, shape: 'rect', friction: 0, background: 'blue'},
				{x: 50, y: 500, vertices: [{x: 55, y: 500}, {x: 55, y: 550}, {x: 200, y: 550}]},

			],
			staticObjects: [
				{x: 400, y: 300, w: 850, h: 620, shape: 'rect', backgroundImage:'img/level_3.png'},
			],
			thresholdPole:{x:1000, y: 450, w: 20, h:50, shape:'rect', background:'#ff00ee'},
            winningPole:{x:140,y:485,w:20, h: 100, shape:'rect', backgroundImage: 'img/red-flag.png'},
			start: {x: 50, y: 170},
			win: {x: 125, y: 480, w: 10, h: 10},
			winningAroundWinningPole:true,
			instructions: "Use Arrow Keys to spin the roller clockwise and counterclockwise to roll it from platform " +
					"to platform to reach out the pole with a flag to win the challenge.<br><br>" +

                "<br/><br/> ps : so you think you already master it? let's see how you handle this then &#128527;"

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

	addLevel: function (level) {
		const ground = level.ground;
		const thresholdPole = level.thresholdPole;
		const winningPole = level.winningPole;
		const staticObject = level.staticObjects;
		
		
		this.addGround(ground);
		this.addPole(thresholdPole);
		this.addPole(winningPole);
		this.addStaticObject(staticObject);
		
		
		
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
			let inc = 0;
			const rotation = Physics.circle.angularVelocity >= 0 ? 1 : -1;
			switch (evt.keyCode) {
				case 37:
					inc = -1;
					CarSounds.start(-rotation);
					break;
				case 39:
					inc = 1;
					CarSounds.start(rotation);
					break;
				default:
					return;
			}

			if (!Physics.isGrass()) {
				Physics.changeSpeed(inc);
				return;

			}

			if (inc * Physics.circle.angularVelocity > 0) { // inverse effect on acceleration
				inc *= -1;
			} else { // reduce braking
				inc *= 0.5;
			}

			Physics.changeSpeed(inc);
		}
	},

    // changes acceleration to braking or reduces braking
	isGrass: function () {
		const level = this.LEVELS[this.level];
		const x = this.circle.position.x;

		if ('grassAreas' in level) {
			const grassAreas = level.grassAreas;
			for (let i = 0; i < grassAreas.length; i++) {
				if (grassAreas[i].left <= x && x <= grassAreas[i].right) {
					return true;
				}
			}
		}
		return false;
	},

	changeSpeed: function(inc) {
		const speed = this.circle.angularVelocity + inc * 0.01;
		Body.setAngularVelocity(this.circle, speed);
	},

	init: function () {
	    CarSounds.init();

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

	// Check for end game: return 1 for win, -1 for game over, 0 to keep game.
	checkEndGamePosition: function(circle) {
		const position = circle.position;
		if (position.y > 590) {
			return -1;
		}

		if (this.isGrass() && Math.abs(this.circle.angularVelocity) < 0.02) {
		    return -1;
        }

		const winningPolePos = this.LEVELS[this.level].winningPole;
		const winningAroundPole = this.LEVELS[this.level].winningAroundWinningPole;

		if (!winningAroundPole) { // for tutorial level
			return this.checkMoreThanWinningPole(position, winningPolePos);
		} else {
			if (this.checkAroundWinningPole(position, winningPolePos, Physics.winningArea))
				return 1;
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

	checkThresholdPole:function(position){

		const thresholdPos = this.LEVELS[this.level].thresholdPole;

		const dx = position.x - thresholdPos.x;
		const dy = position.y - thresholdPos.y;
		if (Math.sqrt(dx * dx + dy * dy) < 10)
			return 1;
		else
			return 0;

	},

	checkState: function () {
		const income = this.checkEndGamePosition(this.circle);
		if (income != 0) {
			this.endGame(income == 1);
			return;
		}

		const IsInputPaused = this.checkThresholdPole(this.circle.position);
		this.IsInputPaused = IsInputPaused;

		// this.snail.position = this.circle.position;

		const speed = Math.round(this.circle.angularVelocity * 100);
		const speedText = speed < 0 ? "< " + (-speed) : speed + (speed > 0 ? " >" : "");
		this.setStatus(speedText);
	
		setTimeout("Physics.checkState()", 100);
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
		const circleProps = {render:{visible:true, sprite:{ texture:'img/drone.png'}}};
		const circle = Bodies.circle(start.x, start.y, 20,circleProps);
		circle.friction = 0.1;
		circle.frictionAir = 0;
		circle.frictionStatic = 0;

		// const snailProps = {isSensor:true, isStatic:true, render:{sprite:{ texture:'img/snail.001.png'}}};
		// const snail = Bodies.circle(start.x, start.y, 20,snailProps);
		

		Matter.World.add(this.engine.world, [circle]);
		// Matter.World.add(this.engine.world, [snail]);
		
		this.circle = circle;
		// this.snail = snail;

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
