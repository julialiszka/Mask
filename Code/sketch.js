/*
Julia Liszka
Mask
2021
*/

let video;  // webcam input
let model;  // Face Landmarks machine-learning model
let face;   // detected face

let water, flower;
let mask;

let font;

let alignL = 0;
let alignR = 0;
let max = 0;
let print = 1;

// print details when a face is
// first found
let firstFace = true;

function preload() {
	flower = loadImage('assets/flower_no_bg.png');
	koi = loadImage('assets/koi_no_bg.png');
	koi2 = loadImage('assets/koi_no_bg2.png');
	pad = loadImage('assets/lilypad_no_bg.png');

	font = loadFont('assets/Pretty Lily.ttf');
}

function setup() {
	// createCanvas(windowWidth, windowHeight);
	createCanvas(1280, 960);
	video = createCapture(VIDEO);
	video.hide();

	// measurements to properly center video on screen
	alignL = (width - video.width)/2; // left
	alignR = (width + video.width)/2; // right

	loadFaceModel();
}

function loading() {
	background(77, 167, 139);
	textFont(font);
	textSize(100);
	fill(87, 117, 144);
	textAlign(CENTER, BASELINE);
	text('Loading...', width/2, height/2);
}

// load model
async function loadFaceModel() {
	loading();
  	model = await blazeface.load();
}

function draw() {
	let faceWidth = 0;
  	if (video.loadedmetadata && model !== undefined) {
    	getFace();
  	}

  	if (face !== undefined) {
		//display face data
		image(video, 0,0, width,height);

		// print the info
		if (firstFace) {
		  console.log(face) ;
		  firstFace = false;

		}

		let rightEye = face.landmarks[0];
		let leftEye =  face.landmarks[1];

		let mouth =  face.landmarks[3];

		let nose =     face.landmarks[2];

		let rightEar = face.landmarks[4];
		let leftEar =  face.landmarks[5];

		// the points are given based on the dimensions
		// of the video, which may be different than
		// your canvas – we can convert them using map()!
		rightEye = scalePoint(rightEye);
		leftEye =  scalePoint(leftEye);
		mouth = scalePoint(mouth);
		nose =     scalePoint(nose);
		rightEar = scalePoint(rightEar);
		leftEar = scalePoint(leftEar);
		let forehead = createVector(nose.x, nose.y-(leftEar.x-rightEar.x)/2);
		let chin = createVector(nose.x, nose.y+(leftEar.x-rightEar.x)/2);

		// from there, it's up to you to do fun
		// stuff with those points!
		fill(255);
		noStroke();

		
		if (faceWidth == 0){
			faceWidth = leftEar.x-rightEar.x;
		}


		pond(nose.x, nose.y, (leftEar.x-rightEar.x)/2+50);

		image(flower, forehead.x-flower.width/2, forehead.y-flower.height);

		koi.resize(flower.width/2, 0);
		koi2.resize(flower.width/2, 0);
		push();
		translate(rightEye.x-koi.width/2, rightEye.y-koi.height/2+20);
		rotate(-PI/4);
		image(koi, 0, 0);
		pop();

		push();
		translate(leftEye.x+koi2.width/2-50, leftEye.y-koi2.height);
		rotate(PI/4);
		image(koi2, 0, 0);
		pop();

		pad.resize(flower.width/6, 0);
		randomSeed(7);
		for (let i=0; i<10; i++) {
			let x = random(leftEar.x, rightEar.x);
			let y = random(forehead.y, chin.y);
			if ((abs(x-rightEye.x)<15 && abs(y-rightEye.y)<15) ||  
				(abs(x-leftEye.x)<15 && abs(y-leftEye.y)<15)) {
				i--;
			}
			else if (dist(x, y, nose.x, nose.y) > faceWidth) {
				console.log("out");
				i--;
			}
			else {
				push();
				translate(x, y);
				rotate(random(2*PI));
				image(pad, 0, 0);
				pop();
			}
		}
	}
}

function dist(x0, y0, x1, y1) {
	let a = (x0-x1)^2;
	let b =(y0-y1)^2
	return integer(sqrt(a + b));
}

function pond(x, y, radius) {
	randomSeed(199);
	fill('rgba(39, 125, 161, .3)');
	
	for (let i=0; i<4; i++) {
		beginShape();
		let startX = x;
		let startY = y;
		for (let angle = 0; angle < 2*PI; angle+=radians(15)) {
			
			let xPoint = x+radius*cos(angle)+random(13);
			let yPoint = y+radius*sin(angle)+random(13);
			if (angle == 0) {
				startX = xPoint;
				startY = yPoint;
			}
			else if (angle >= 2*PI-radians(10)) {
				xPoint = startX;
				yPoint = startY;
			}
			curveVertex(xPoint, yPoint);
		}
		endShape(CLOSE);
		radius *= 4/5;
	}
}

function scalePoint(pt) {
	let x = map(pt[0], 0, video.width, 0, width);
	let y = map(pt[1], 0, video.height, 0, height);
	return createVector(x, y);
}

async function getFace() {
	const predictions = await model.estimateFaces(
		document.querySelector('video'),
		false
		);

	if (predictions.length === 0) {
		face = undefined;
	}
	else { // grab the first face
		face = predictions[0];
	}
}

