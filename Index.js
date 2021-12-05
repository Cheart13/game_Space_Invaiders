(function (){

	let shoted=false;
	let score=0;
	let lifes=3;
	let enemiesNumber=60
	let Game = function (ID){

		let canvas= document.getElementById(ID);
		let ctx = canvas.getContext('2d');
		let CanvSize={
			x:canvas.width,
			y:canvas.height
		}


		this.bodies = createEnemies(this).concat([new Player(this, CanvSize)]);

		var self= this;

		loadsound('Shootsound.', function (shootsound){
			
	
		});

		let tick = function (){
			self.update(CanvSize);
			self.drow(ctx, CanvSize);
			requestAnimationFrame(tick);
			
		}
				
		tick();

		
	
	
		
	}

	Game.prototype={
		drow: function(ctx, CanvSize){
			ctx.clearRect(0, 0,CanvSize.x, CanvSize.y);
			for(let i = 0; i<this.bodies.length; i++){
				drawRect(ctx, this.bodies[i]);
				drawScoreLifes(ctx);

			}
			if(this.bodies.length==1){
				drowWinMessage(ctx,CanvSize);
				setInterval(this, 10000);
			}
			if(lifes===0){
				drowLooseMessage(ctx,CanvSize);
				setInterval(this, 10000);
			}
			
		},
		
		update: function (CanvSize){
			console.log(this.bodies.length);

			let bodies = this.bodies;
			let reborne= false;

			let notColiding = (obj1) =>  {
				return bodies.filter(function(obj2){
					if(collisionDetection(obj1, obj2)){
						shoted=false;
						if(obj2 instanceof Enemy){
							score+=10;
							enemiesNumber--;
						}
						if(obj2 instanceof Player){
							lifes--;
							if(lifes>0){
								reborne=true;
								//addBody()
							}
							else{

							}
						}
						         
						return true;
					}
					return collisionDetection(obj1, obj2);

				}).length===0;
			}

			this.bodies = this.bodies.filter(notColiding);

			for(let i = 0; i<this.bodies.length; i++){
				if(this.bodies[i].position.y<=0||this.bodies[i].position.y>=490){
					this.bodies.splice(i,1);
				}

			}
			for(let i = 0; i<this.bodies.length; i++){
				this.bodies[i].update();
			}
			if(reborne){
				this.bodies.push(new Player(this, CanvSize));
				reborne=false;
			}
			
		},

		addBody: function(body){
			
			this.bodies.push(body);
			
		},

		addBullet: function(bullet){
			
			this.bodies.push(bullet);
			shoted=true;
			
		},

		enemiesBelow: function(enemy){
			return this.bodies.filter(function(b){
				return b instanceof Enemy &&
				b.position.y  > enemy.position.y &&
				b.position.x - enemy.position.x < enemy.size.width;
			}).length > 0;

		}

		
	}

	function drawScoreLifes(ctx) {
		ctx.font = "16px Arial";
		ctx.fillStyle = "black";		
		ctx.fillText("Score: "+score, 10, 20);
		ctx.fillText("lifes: "+lifes, 10, 490);
		
	}
	function drowWinMessage(ctx, CanvSize){
		ctx.clearRect(0, 0,CanvSize.x, CanvSize.y);
		ctx.font = "32px Arial";
		ctx.fillStyle = "red";		
		ctx.fillText('You Won! Congradulations!!!', CanvSize.x/2-190,  CanvSize.y/2-16);
		
	}
	function drowLooseMessage(ctx, CanvSize){
		ctx.clearRect(0, 0,CanvSize.x, CanvSize.y);
		ctx.font = "36px Arial";
		ctx.fillStyle = "Black";		
		ctx.fillText('Game over', CanvSize.x/2-100,  CanvSize.y/2-11);
		
	}
	

	function loadsound(soundfile, callback){
		function loaded(){
			callback(sound);
			sound.removeEventListener('conplaythough',loaded);
		}
		let sound = new Audio(soundfile);
		sound.addEventListener('conplaythough',loaded);
		sound.load();
	}
	

	let Player = function(game, CanvSize){
		this.game = game;
		this.size = {width: 62, height: 20};
		this.colour='red';
		this.position={x:CanvSize.x/2-this.size.width/2, y: CanvSize.y-65}
		this.shoted=false;
		this.Keyboard = new Keyboard();
	}
	
//
	Player.prototype ={
		update: function(CanvSize){


			if(this.Keyboard.isDown(this.Keyboard.KEYS.LEFT)){
				this.position.x -= 2;
			}
			if(this.Keyboard.isDown(this.Keyboard.KEYS.RIGHT)){
				this.position.x += 2;
			}
			if(this.Keyboard.isDown(this.Keyboard.KEYS.SPACE)){
				if(!shoted){
				console.log('Shoot');
				let bullet= new Bullet(
					{x:this.position.x+this.size.width/2, y:this.position.y-20},
					{x:0, y:-4}
					);
				
				this.game.addBullet(bullet);
				//this.game.shootsound.load();
				//this.game.shootsound.play();
				
				}
				
				

			}
			
			console.log(this.shoted);
		}
	}

	let Bullet = function(position, velocity){
		this.size = {width: 4, height: 12};
		this.colour='black';
		this.velocity=velocity;
		this.position=position;
		
	}

	Bullet.prototype={
		update: function(){
			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;
			if (this.position.y<=0){
				shoted=false;
			}
			
		}
	}

	let Enemy = function(game, position){
		this.game=game;
		this.colour='green';
		this.size ={width:20, height:20}
		this.position= position;
		this.patrolX= 0;
		this.speedX = 0.6;
	}

	Enemy.prototype={
		update: function(){
			let shooting;
			
				shooting=0.0025;
			
			if(enemiesNumber<=44&&enemiesNumber>=20){
				shooting=0.005;
			}else
			if(enemiesNumber<=20){
				shooting=0.01;
			}
			if(enemiesNumber<8){
				shooting=0.025;
			}
			if(this.patrolX<-10 ||this.patrolX>=800-450){
				this.speedX = -this.speedX;
			}
			
			this.position.x += this.speedX;
			this.patrolX += this.speedX;

			if(Math.random()< shooting && !this.game.enemiesBelow(this)) {
			let bullet= new Bullet(
				{x:this.position.x+this.size.width/2, y:this.position.y+this.size.height+1},
				{x:0, y:3}
				);
			
			this.game.addBody(bullet);
			}
		}
	}

	function createEnemies(game){
		let enemies=[];
		for(let i=0;i<enemiesNumber;i++){
			let posx = 30+ (i%12) *35;
			let posy = 30+ (i%5) *35;
			enemies.push(new Enemy(game, {x:posx, y:posy}));

		}
		return enemies;

	}

	function collisionDetection(obj1, obj2){

		return (obj1 != obj2 && 
			obj1.position.x < obj2.position.x + obj2.size.width  && 
			obj1.position.x + obj1.size.width  > obj2.position.x &&
			obj1.position.y < obj2.position.y + obj2.size.height && 
			obj1.position.y + obj1.size.height > obj2.position.y);

	}

	let Keyboard = function() {
		let keyState={}

		window.onkeydown = function(e){
			keyState[e.keyCode]=true;
		}

		window.onkeyup = function(e){
			keyState[e.keyCode]=false;
		}

		this.isDown = function(keyCode){
			return (keyState[keyCode]===true);
		}

		this.KEYS = {LEFT:37, RIGHT:39, SPACE:32};


	}

	function drawRect(ctx, body){
		if(body.colour){
		ctx.fillStyle = body.colour;
		}
		ctx.fillRect(body.position.x, body.position.y, body.size.width, body.size.height);
	}
	
	window.onload = function() {
		new Game('canvas');
	}

})();

