// title:  BBJam
// author: didigameboy
// desc:   basket ball action gam3z
// script: js

//optimized players shadow constructor and update
//added parent/children obj
//added skip intro button
//added font (occupies too much space on sprite sheet idont know if Ill keep)
//palette swat to writ font
//my pal 140c1cea893466707d4e4a4e854c30346524d04648757161597dceca85657f8f9b6daa2cd2aa996dc2cadad45edeeed6
//https://github.com/nesbox/TIC-80/wiki/Code-examples-and-snippets#palette-swapping
//animate title screen by code
//add easing function
//add intro sprite
//add gamestate - add menu
//create release button
//optimize objects to inicialize them with more or less parameters
//update game objects and animation control
//define game object
//define game loop/draw/input updates

//Global Vars - (res 240x136)
var rescale = 2; //game rescale
var anim_default_speed = 10; //anim speed, bigger is slower
var objects = [];  //store all game objects
var drawtable = []; //array of sprites to draw. the idea is to use index to order objects
var drawfirst = []; // array of sprites to draw before objects as shadows
var btn4pressed = false;
var btn5pressed = false;
var btn5released = false;
var debugmsg = "";
var debug_t = 0;
var gamestate = 0; //splash screen, - intro - menu - game - pause
var step = 0; //count step frames
var palette = "140c1cea893466707d4e4a4e854c30346524d04648757161597dceca85657f8f9b6daa2cd2aa996dc2cadad45edeeed6";
var allplayers = [];
var teamplayers = [];
var sintheta = 0;
var costheta = 0;

/** Animator constructor */
function Anim(name, init, end){
 	var a = new Object();
	a.name = name; //name of the animation
	a.init = init; //index for inicial frame
	a.end = end == undefined ? init : end; //index for last animation frame
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
function GameObject(x,y){
	var obj = new Object();
	obj.name = ""; //used to identify a specific instance
	obj.tag = ""; //used to specify a group of instances
	obj.sprites = []; //store animation objects
	obj.curr = -1; //current frame playing
	obj.anim = null; //current anim to play (object Anim) {name, init, end}
	obj.spd = 1; //object spd (using for moving)
 	obj.vspeed = 0; //object vertical speed
	obj.hspeed = 0; //object horizontal speed
	obj.children = [];
	obj.parent = [];
	obj.mask = {};
	obj.x = x;
	obj.y = y;
	obj.flip = 0; //(0,1,2,3)
	obj.tcolor = 0; //index of transparent color
	obj.scale = rescale; //game rescale, rescale all sprites one by one
	obj.visible = true; //set false 
	obj.rotate = 0; 
	obj.w = 1;
	obj.h = 1;
	obj.depth = 1; //using for z order
	obj.framestep = 0; //using to animate
	obj.addAnim = function(a){this.sprites.push(a)}
	obj.draw = function(){
		if (this.sprites.length > 0 && this.visible) {
			if (this.anim == null) this.anim = this.sprites[0];
			this.curr = this.anim.init + Math.floor(this.framestep/this.anim.speed);
			if (this.curr >= (this.anim.end + 1)){
				this.curr = this.anim.init;
				this.framestep = 0;
				this.anim.count++;
			}
			spr(this.curr, this.x, this.y, this.tcolor, this.scale, this.flip, this.rotate, this.w, this.h);
		}
		this.framestep++;
	}
	obj.setAnim = function(name){
		for (var i=0; i<this.sprites.length; i++){
			if (name == this.sprites[i].name)
				this.anim = this.sprites[i];
				this.framestep = 0;
		}
	}
	obj.getCurrentAnim = function(){ 
		return this.anim != null ? this.anim.name : "";
	}
	obj.getAnim = function(name){
		if (name == undefined) name = this.getCurrentAnim();
		for (var i=0; i<this.sprites.length; i++){
			if (name == this.sprites[i].name)
				return this.sprites[i];
		}
	}
	obj.update = function(args){}
	return obj;
}

/**
 * init game, create objects, animations, sprites etc
 */
function init(){ 	
	//player
	player = new GameObject(96, 70);
	player.addAnim(new Anim("idle",1,4)); //sprite pivots are top left
	var playerRun = new Anim("run",17,20);
	playerRun.speed = 5; //run animation is faster
	player.addAnim(playerRun);
	player.addAnim(new Anim("idle_ball",64,67));
	player.addAnim(new Anim("pass",33,34));
	player.addAnim(new Anim("defend",35,36));
	player.getAnim("defend").speed = 30;
	player.getAnim("defend").speed = 30;
	player.addAnim(new Anim("defend_diag",68,69));
	player.getAnim("defend_diag").speed = 30;
	player.addAnim(new Anim("shoot",49,51));
	player.getAnim("shoot").loop = false;
	player.getAnim("shoot").speed = 30;
	player.hasBall = false; //created atribute on the fly
	player.name = "player";
	player.tag = "player";
	player.state = "idle";

	coplayer = clone(player);
	coplayer.x = 96; 
	coplayer.x = 24; 
	coplayer.name = "coplayer";

	//other
	adv = new GameObject(80,24);
	adv.addAnim(new Anim("idle",5,8));
	adv.addAnim(new Anim("idle_ball",73,76));
	adv.addAnim(new Anim("run",21,24));
	adv.getAnim("run").speed = 5;
	adv.addAnim(new Anim("pass",37,38));
	adv.getAnim("pass").speed = 5;
	adv.getAnim("pass").loop = false;
	adv.addAnim(new Anim("defend",39,40));
	adv.addAnim(new Anim("defend_diag",71,72));
	adv.addAnim(new Anim("shoot",53,55));
	adv.getAnim("shoot").loop = false;
	adv.getAnim("shoot").speed = 30;	
	adv.name = "guest_a";
	adv.tag = "player";
	adv.state= "idle";
	coadv = clone(adv);
	coadv.x -= 14;
	coadv.name = "guest_b";	

	//ball
	ball = new GameObject(100,70);
	ball.addAnim(new Anim("idle",25));
	ball.setAnim("idle");
	ball.name = "ball";
	ball.owner = undefined;
	ball.target = undefined;
	ball.state = "idle";
	ball.floatx = ball.x;
	ball.floaty = ball.y;

	//insert to objects array
	objects.push(player);
	objects.push(coplayer);
	objects.push(adv);
	objects.push(coadv);
	objects.push(ball);
	
	//draw first objects
	playershadows = [];
	for (var i = 0; i < objects.length; i++) {
		if (objects[i].tag == "player"){
			lcShadow = new GameObject(player.x, player.y);
			lcShadow.addAnim(new Anim("idle",9));
			lcShadow.addAnim(new Anim("defend",10));
			lcShadow.addAnim(new Anim("shoot",11));
			lcShadow.setAnim("idle");
			lcShadow.name = "player_shadow_"+i;	
			lcShadow.tag = "player_shadow";
			objects[i].children.push(lcShadow);
			drawfirst.push(lcShadow);
			playershadows.push(lcShadow);
			allplayers.push(objects[i]);
		}
	} 	
	plShadow2 = new GameObject(adv.x, adv.y);
	plShadow2.addAnim(new Anim("idle",9,9));
	plShadow2.setAnim("idle");
	plShadow2.name = "player_shadow2";
	
	ballShadow = new GameObject(ball.x, ball.y);
	ballShadow.addAnim(new Anim("idle",26,26));
	ballShadow.setAnim("idle");
	ballShadow.name = "ball_shadow";
	
	drawfirst.push(ballShadow);

	player.update = function(){
		if (!btn4pressed && !btn5pressed){ //avoid moving on passing / shooting?
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
		}
		//buttons
		if(btn(4)) { //btnA or keyboar = Z
			btn4pressed = true;
			if (player.hasBall) {
				player.setAnim("shoot");
				player.state = "shooting";
			} else {
				player.state = "defending";
				player.setAnim("defend_diag");
			}
		}
		if (!btn(4)&& btn4pressed){ //btn4 released
			btn4pressed = false;
			//debugmsg = "btn4 released";
			//debug_t = 60;
		}
		if(btn(5)) {//btnB or keyboar = X
			btn5pressed = true;		
		}
		if (!btn(5) && btn5pressed){ //btn5 released
			btn5pressed = false;
			btn5released = true;
			if (player.hasBall) {
				player.state = ball.state = "pass";
			}			
		}
		if(btn(6)) { //btnX or keyb A
		}
		if(btn(7)) {//btnY or keyb S
		}
		//update anims
		if ((player.hspeed != 0 || player.vspeed != 0) && player.getCurrentAnim() != "run"){
			player.setAnim("run")
		}
		if (player.hspeed == 0 && player.vspeed == 0 && player.getCurrentAnim() != "idle" && player.getCurrentAnim() != "idle_ball" && player.getCurrentAnim() != "defend_diag" && player.getCurrentAnim() != "pass") {
			if (ball.owner == player) 
				player.setAnim("idle_ball");
			else 
				player.setAnim("idle");
		}
		if (ball.owner == player) {
			if (btn5pressed) {
				player.setAnim("pass");
			}
			if (btn5released) {
				if (player.getCurrentAnim() == "pass") {
					if (player.getAnim().count > 1){
						player.state = "idle";
						player.setAnim("idle");
						btn5released = false;
					}
				}
			}
		}
	}
	ball.update = function(){
		if (ball.state == "idle") {
			for (var i=0; i<allplayers.length; i++){
				if(ball.x == allplayers[i].x && ball.y == allplayers[i].y) {
					ball.owner = allplayers[i];
					allplayers[i].hasBall = true;
					ball.state = "hands";
				}
			}
		} 
		/*if (ball.owner != null) { //sprite size == 8
			
		}*/
		
		var theta = 0; //angle in degrees
		
		switch (ball.state) {
			case "idle":
				break;
			case "hands":
				var xflip = ball.owner.flip > 0 ? 12 : 0;
				ball.x = ball.owner.x + xflip;
				ball.y = ball.owner.y + 3*rescale + Math.floor(ball.owner.framestep/ball.owner.getAnim().speed)*rescale;
				//ball.rotate = Math.floor(ball.owner.framestep/ball.owner.getAnim().speed) % 4
				break;
			case "pass":
				//create target
				ball.owner = undefined;
				ball.state = "passing";
				ball.target = coplayer;
				player.hasBall = false;
				var x_delta = (ball.target.x - ball.x);
				var y_delta = (ball.target.y - ball.y);
				var angleRadians = Math.atan2(y_delta, x_delta);
				trace("angleRadians="+angleRadians)
				theta = angleRadians;
				ball.floatx = ball.x;
				ball.floaty = ball.y;
				costheta = Math.abs(Math.cos(theta).toFixed(3));				
				sintheta = Math.abs(Math.sin(theta).toFixed(3));
				ball.spd = 2;
				break;		
			case "passing": //go to target
				if (ball.x == ball.target.x && ball.y == ball.target.y) {
					ball.owner = ball.target;
					ball.state = "idle";
					var aux = player;
					player = coplayer;
					coplayer = aux;
					player.hasBall = true;
					player.state = "idle";
				} else {
					ball.floatx = approach(ball.floatx, ball.target.x, costheta*ball.spd);
					ball.floaty = approach(ball.floaty, ball.target.y, sintheta*ball.spd);
					ball.x = ball.floatx;
					ball.y = ball.floaty;
				}
				break;		
			case "shoot":
				ball.owner = undefined;
				ball.state = "shoot";	
				break;	
			default:
				break;
		}
	}
}

/** draw stuff before, objects and stuff as shadows */
function drawBegin(){
	for (var i=0; i<drawfirst.length; i++){
		drawfirst[i].draw();
	}
}

function draw() {
	cls(10) //clear tranparent color /bg color

	//draw first stuff
	drawBegin();

	//organize drawtable simulate layers with the draw call
	for (var i = 0; i < drawtable.length; i++) {
		drawtable[i] = undefined;
	}
	for (var i = 0; i < objects.length; i++) {
		var depth = Math.floor(objects[i].y); //if already has a object at this index/depth/y		 
		if (depth < 0) depth = 0; //cant have negative array index 
		while (typeof (drawtable[depth]) != "undefined") {
			depth++;
		}
		objects[i].depth = depth;
		//store the object athe the right index/depth/y --put the ball on first object to be draw
		if (objects[i].name == "ball" && typeof (objects[i].owner) != 'undefined') { //the ball receive the depth player plus something
			depth = objects[i].owner.depth;
			while (typeof (drawtable[depth]) != "undefined") {
				depth++;
			}
		}
		drawtable[depth] = objects[i];
	}
	//draw objects
	var aux = 110;
	for (var i = 0; i < drawtable.length; i++) {
		if (typeof (drawtable[i]) != "undefined") {
			drawtable[i].draw();
			//print(drawtable[i].name + ".draw() ", 1, aux);
			aux += 10;
		}
	}
	//debug
	if (debug_t > 0) {
		print(debugmsg, 0, 80);
		debug_t--
	}
	print("X:" + ball.x + " Y:" + ball.y, 0, 100);

}

function update(){
	//update animation states
	
	for (var i=0; i<objects.length; i++) {
		objects[i].update();
	}
	//update shadows states
	for (var i=0; i<playershadows.length; i++){
		playershadows[i].x = allplayers[i].x;
		playershadows[i].y = allplayers[i].y + 1;
		playershadows[i].flip = allplayers[i].flip;
		if (allplayers[i].getCurrentAnim() == "shoot")
			playershadows[i].setAnim("shoot");
		else if (allplayers[i].getCurrentAnim() == "defend_diag")
			playershadows[i].setAnim("defend");
		else playershadows[i].setAnim("idle");
	}
}

function splashscreen(){

}

function intro(){	
	cls(0);	
	if (typeof(intropoint) == 'undefined') {		
		intropoint = new Object();
		intropoint.x = 240; //(res 240x136)
		intropoint.y = 32; // screen character
		intropoint.step = 0;
		intropoint.logox = -128; //off screen
		intropoint.logoy = 1;
		intropoint.wait = 0;
		intropoint.flicker = 0;		
	}
	if (btn(4) && intropoint.wait < 100) { //skip
		intropoint.x = 81;
		intropoint.wait = 151;
		intropoint.logox = 46;
	}
	if (intropoint.x >80) {
		//x,y,w,h,color
		//rect(intropoint.x,intropoint.y-2,4,40,5);		
		//id x y [colorkey=-1] [scale=1] [flip=0] [rotate=0] [w=1 h=1]
		//slide char
		if (intropoint.step % 3 == 0) spr(88, intropoint.x+2, intropoint.y, 0, 1, 0,0,8,11); //fliker shadow
		spr(80, intropoint.x, intropoint.y, 0, 1, 0,0,8,11);
		var slidespd = intropoint.x > 120 ? 2 : 1;				
		intropoint.x -=slidespd;		
	} else if (intropoint.logox < 45){ //those ifs are like while since they are in game loop ;>
		//slide title		
		var slidespd = intropoint.logox < 10 ? 2 : 1;
		intropoint.logox += slidespd;
		drawtitlescreen()
	} else if (intropoint.wait < 120) {
		drawtitlescreen(1)
		intropoint.wait++;
	} else if (intropoint.wait < 150){
		drawtitlescreen(1);
		pal(15, 3); //swap colors (last color index is for font)
		print("PRESS START", 10, 81);
		pal(); //reset pal
		intropoint.wait++;
	} else if (intropoint.wait < 180){
		drawtitlescreen(1);
		//print("PRESS START", 10, 80)
		//font text, x, y, colorkey, char width, char height, fixed, scale -> width
		//pal();
		//font("PRESS START", 10, 80, 1, 1, true, 1); <- range error invalid stack index 8
		pal(15, 3); //swap colors (last color index is for font)
		print("PRESS START", 10, 81);
		pal(); //reset pal
		if (intropoint.flicker < 60){ //make it blink
			print("PRESS START", 10, 80);
		} else if (intropoint.flicker > 120) intropoint.flicker = 0;
		intropoint.flicker++;
		if( btn(5)) {	
			gamestate = 2;			
		}		
	}
	intropoint.step++;
}

function drawtitlescreen(p){
	spr(384, intropoint.logox, intropoint.logoy, 0, 1, 0,0, 16, 4);					 
	if (intropoint.step % 3 == 0 && p == undefined) spr(88, intropoint.x+2, intropoint.y, 0, 1, 0,0,8,11);
	spr(80, intropoint.x,intropoint.y, 0, 1, 0,0,8,11);
}

function menu(){

}

function pause(){
	
}

/**
 * call init
 */
init();
/**
 * Main LOOP //60fps
 */
function TIC()
{
	
	switch (gamestate) {
		case 0:
			intro();
			break;
		case 1: 
			menu();
			break;
		case 2:  //gameloop			
			update();//update objects
			draw(); //update screen
			break;
		case 3:
			pause();
			break;
		default:
			break;
	}
	
 }

 //UTILS
function approach(start, end, step){
	if (start < end){
		return Math.min(start + step, end);
	} else {
		return Math.max(start - step, end);
	}
}

/**
 * EaseQuadin, function from http://www.gizma.com/easing/
 * t:time, b:start value(0), c:change in value(1), d:duration
 */
function easeQuadin(t,b,c,d){	
	t /= d;
	return c*t*t + b;
}
/**
 * Swap color C0 with C1
 * https://github.com/nesbox/TIC-80/wiki/Code-examples-and-snippets#palette-swapping
 */
function pal(c0,c1){
	if(c0 === undefined && c1 === undefined){
		for(var i=0; i<16; i++){poke4(32736 + i, i)}
	} else poke4(32736+c0,c1);	
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function toDegrees (angle) {
	return angle * (180 / Math.PI);
  }

function toRadians (angle) {
	return angle * (Math.PI / 180);
  }