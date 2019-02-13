// title:  BBJam
// author: didigameboy
// desc:   basket ball action gam3z
// script: js

//Global Vars - (res 240x136)
var rescale = 2; //game rescale
var anim_default_speed = 10; //anim speed, bigger is slower
var objects = [];  //store all game objects
var drawtable = []; //array of sprites to draw. the idea is to use index to order objects
var drawfirst = []; // array of sprites to draw before objects as shadows

/** Animator constructor */
function Anim(name, init, end){
 	var a = new Object();
	a.name = name; //name of the animation
	a.init = init; //index for inicial frame
	a.end = end; //index for last animation frame
	a.speed = anim_default_speed; //anim specific speed, bigger is slower
	a.loop = true; //loop animation true|false
	a.count = 0; //count how many loops it did
	return a;
}

/** Extended animator constructor*/
function Anim_ext(name, init, end, speed, loop){
	var a = new Anim(name, init, end);
	a.speed = speed;
	a.loop = loop;
	return a;
}

/**
 * Basic game object
 * @param {*x position} lcx 
 * @param {*y position} lcy 
 */
function Instance(lcx,lcy){
	var obj = new Object();
	obj.name = ""; //used to identify a specific instance
	obj.tag = ""; //used to specify a group of instances
	obj.sprites = []; //store animation objects
	obj.curr = -1; //current frame playing
	obj.anim = null; //current anim to play (object Anim) {name, init, end}
	obj.spd = 1; //object spd (using for moving)
 	obj.vspeed = 0; //object vertical speed
	obj.hspeed = 0; //object horizontal speed
	obj.x = lcx;
	obj.y = lcy;
	obj.flip = 0; //(0,1,2,3)
	obj.tcolor = 0; //index of transparent color
	obj.scale = rescale; //game rescale, rescale all sprites one by one
	obj.visible = true; //set false 
	obj.rotate = 0; 
	obj.w = 1;
	obj.h = 1;
	obj.depth = 1; //using for z order
	obj.step = 0; //using to animate
	obj.addAnim = function(a){this.sprites.push(a)}
	obj.draw = function(){
		if (this.sprites.length > 0 && this.visible) {
			if (this.anim == null) this.anim = this.sprites[0];
			this.curr = this.anim.init + Math.floor(this.step/this.anim.speed);
			if (this.curr >= (this.anim.end + 1)){
				this.curr = this.anim.init;
				this.step = 0;
				this.anim.count++;
			}
			spr(this.curr, this.x, this.y, this.tcolor, this.scale, this.flip, this.rotate, this.w, this.h);
		}
		this.step++;
	}
	obj.setAnim = function(name){
		for (var i=0; i<this.sprites.length; i++){
			if (name == this.sprites[i].name)
				this.anim = this.sprites[i];
				this.step = 0;
		}
	}
	obj.getCurrentAnim = function(){ 
		return this.anim.name;
	}
	obj.getAnim = function(name){ 
		for (var i=0; i<this.sprites.length; i++){
			if (name == this.sprites[i].name)
				return this.sprites[i];
		}
	}
	return obj;
}

/**
 * init game, create objects, animations, sprites etc
 */
function init(){ 	
	//player
	player = new Instance(96, 24);
	player.addAnim(new Anim("idle",1,4)); //sprite pivots are top left
	var playerRun = new Anim("run",17,20);
	playerRun.speed = 5; //run animation is faster
	player.addAnim(playerRun);
	player.addAnim(new Anim("pass",33,34));
	player.addAnim(new Anim("defend",35,36));
	player.addAnim(new Anim("shoot",49,51));
	player.setAnim("idle");
	player.name = "player";
	//other
	adv = new Instance(80,24);
	adv.addAnim(new Anim("idle",5,8));
	adv.addAnim(new Anim("run",21,24));
	adv.getAnim("run").speed = 5;
	adv.addAnim(new Anim("pass",37,38));
	adv.getAnim("pass").speed = 5;
	adv.getAnim("pass").loop = false;
	adv.addAnim(new Anim("defend",39,40));
	adv.addAnim(new Anim("shoot",53,55));
	adv.getAnim("shoot").loop = false
	adv.setAnim("idle");
	adv.name = "other";
	//ball
	
	ball = new Instance(100,70);
	ball.addAnim(new Anim("idle",25,25));
	ball.setAnim("idle");
	ball.name = "ball";
	ball.owner = null;
	ball.state = "";

	//insert to objects array
	objects.push(player);
	objects.push(adv);
	objects.push(ball);
	
	//draw first objects
	plShadow = new Instance(player.x, player.y);
	plShadow.addAnim(new Anim("idle",9,9));
	plShadow.setAnim("idle");
	plShadow.name = "player_shadow";	
	
	plShadow2 = new Instance(adv.x, adv.y);
	plShadow2.addAnim(new Anim("idle",9,9));
	plShadow2.setAnim("idle");
	plShadow2.name = "player_shadow2";
	
	ballShadow = new Instance(ball.x, ball.y);
	ballShadow.addAnim(new Anim("idle",26,26));
	ballShadow.setAnim("idle");
	ballShadow.name = "ball_shadow";

	drawfirst.push(plShadow);
	drawfirst.push(plShadow2);
	drawfirst.push(ballShadow);

}

/** draw stuff before, objects and stuff as shadows */
function drawBegin(){
	for (var i=0; i<drawfirst.length; i++){
		drawfirst[i].draw();
	}
}

function draw(){
	cls(10) //clear tranparent color /bg color
	//ind x y tcolor scale flip rotate w h
	//print("READY TO BBJAM!",74,84)

	//draw first stuff
	drawBegin();

	//organize drawtable simulate layers with the draw call
	for (var i=0; i<drawtable.length; i++){
		drawtable[i] = undefined;
	}
	for (var i=0; i<objects.length; i++) {
		var depth = objects[i].y; //if already has a object at this index/depth/y
		if (depth < 0) depth = 0; //cant have negative array index 
		while (typeof(drawtable[depth]) != "undefined") {
			depth++;
		}
		//store the object athe the right index/depth/y
		drawtable[depth] = objects[i];
	}
	//draw objects
	var aux = 110;
	for (var i=0; i<drawtable.length; i++) {
		if (typeof(drawtable[i]) != "undefined") {
			drawtable[i].draw();
			//print(drawtable[i].name + ".draw() ", 1, aux);
			aux +=10;
		}
	}
	//debug
	print("X:"+player.x + " Y:"+player.y, 0, 100);
}

function inputs(){
	if(btn(0)){ //up
		player.y -= player.spd; 
		player.vspeed = player.spd;
	} else if(btn(1)){ //down
		player.y += player.spd; 
		player.vspeed = player.spd;
	} else {
		player.vspeed = 0;
	}
	if(btn(2)){ //left
		player.x -= player.spd; 
		player.flip = 1; 
		player.hspeed = player.spd;
	}
	else if(btn(3)){ //right
		player.x += player.spd; 
		player.flip = 0; 
		player.hspeed = player.spd;
	} else {
		player.hspeed = 0;
	}
	if(btn(4)) ball.state = "pass";
	if(btn(5)) ball.state = "shoot";
}

function update(){
	if ((player.hspeed != 0 || player.vspeed != 0) && player.getCurrentAnim() != "run"){
		player.setAnim("run")
	}
	if (player.hspeed == 0 && player.vspeed == 0 && player.getCurrentAnim() != "idle"){
		player.setAnim("idle")
	}
	plShadow.x = player.x;
	plShadow.y = player.y + rescale;
	plShadow.flip = player.flip;
	plShadow2.x = adv.x;
	plShadow2.y = adv.y + rescale;
	plShadow2.flip = adv.flip;
	ballShadow.x = ball.x;
	ballShadow.y = player.y;	

	//ball update
	if (ball.x == player.x && ball.y == player.y) ball.owner = player;
	if (ball.owner != null) {
		ball.x = ball.owner.x;
		ball.y = ball.owner.y;
	}

	switch (ball.state) {
		case "pass":
			ball.owner = null;
			ball.state = "passing";
			break;
		
		case "shoot":
			ball.owner = null;
			ball.state = "shooting";	
			break;
	
		default:
			break;
	}
}

function approach(start, end, step){
	if (start < end){
		return Math.min(start + step, end);
	} else {
		return Math.max(start - step, end);
	}
}

/**
 * call init
 */
init();
/**
 * Main //60fps
 */
function TIC()
{
	//update controls
	inputs();
	//update objects
	update();
	//update screen
	draw();
 }