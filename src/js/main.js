/*
 * BubbleScript
 *
 * Copyright 2011 Evan Wallace
 * Copyright 2019 Yuchen Wang
 * Released under the MIT license
 */

import Bubble from "./bubble.js"
import Cubemap from "./cubemap.js"
import GL from "./lightgl.js"
import Renderer from "./renderer.js"
import Sphere from "./sphere.js"
import Water from "./water.js"

function text2html(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function handleError(text) {
  var html = text2html(text);
  if (html == 'WebGL not supported') {
    html = 'Your browser does not support WebGL.<br>Please see\
    <a href="http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">\
    Getting a WebGL Implementation</a>.';
  }
  var loading = document.getElementById('loading');
  loading.innerHTML = html;
  loading.style.zIndex = 1;
}

window.onerror = handleError;

export var gl = GL.create();
export var water;
var cubemap;
var renderer;
var angleX = -25;
var angleY = -200.5;

// Sphere physics info
var useSpherePhysics = false;
var paused = false;
var sphere;

var bubbles;
var timeStamp;
var vrDisplay;
var frameData = new VRFrameData()


console.log('out of function')

window.onload = function() {

  navigator.getVRDisplays().then(displays => {
    // Filter down to devices that can present.
    displays = displays.filter(display => display.capabilities.canPresent);

    // If there are no devices available, quit out.
    if (displays.length === 0) {
      console.warn('No devices available able to present.');
      return;
    }
    
    
    // Store the first display we find. A more production-ready version should
    // allow the user to choose from their available displays.
    vrDisplay = displays[0];
    //console.log(vrDisplay);

    vrDisplay.requestPresent([{ source: gl.canvas}]).then( function () {

    	console.log('request Present done.');
			drawVR();





		});
  });


};

 function animate() {
    var nextTime = new Date().getTime();
    if (!paused) {
      update((nextTime - prevTime) / 1000);
      draw();
    }
    prevTime = nextTime;
    requestAnimationFrame(animate);
  }


var vrSceneFrame;
function drawVR() {
	console.log('draw VR!')
  var ratio = window.devicePixelRatio || 1;
  var help = document.getElementById('help');

  function Matrixrize(lm){
		return  new GL.Matrix([lm[0], lm[1], lm[2], lm[3], lm[4], lm[5], lm[6], lm[7], lm[8], lm[9], lm[10], lm[11], lm[12], lm[13], lm[14], lm[15]]).transpose();
	};
	

  function onresize() {
    vrDisplay.getFrameData(frameData);
    //console.log('frameData');
		//console.log(frameData);
		console.log('onresize');
    const animating = () => {
			console.log('animating');
			var nextTime = new Date().getTime();
		  if (!paused) {
		    update((nextTime - prevTime) / 1000);
		    draw();
		  }
		  prevTime = nextTime;
      vrSceneFrame = vrDisplay.requestAnimationFrame(animating);
      const leftProjectionMatrix = frameData.leftProjectionMatrix;
      const leftViewMatrix = frameData.leftViewMatrix;
      const rightProjectionMatrix = frameData.rightProjectionMatrix;
      const rightViewMatrix = frameData.rightViewMatrix;
		
			var width = innerWidth - help.clientWidth - 20;
		  var height = innerHeight;


			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



			/*left*/
			var leftpjm = Matrixrize(leftProjectionMatrix);
		
			var leftvwm = Matrixrize(leftViewMatrix);

		  gl.canvas.width = width * ratio;
		  gl.canvas.height = height * ratio;
		  gl.canvas.style.width = width + 'px';
		  gl.canvas.style.height = height + 'px';


			//console.log('-2');
			//console.log(gl['projectionMatrix'].m);
			//console.log(gl['modelviewMatrix'].m);
		 
			gl.viewport(0, 0, gl.canvas.width*0.5, gl.canvas.height);
			gl.loadIdentity();

    	gl.translate(0, 0, -4);
    	gl.rotate(-angleX, 1, 0, 0);
    	gl.rotate(-angleY, 0, 1, 0);
    	gl.translate(0, 0.5, 0);
		
			gl.multMatrix(leftvwm);


      /********************************* Projection Mode *****************************************/
			gl.matrixMode(gl.PROJECTION);
			
			//console.log('-1');
			//console.log(gl['projectionMatrix'].m);
			//console.log(gl['modelviewMatrix'].m);
			
			gl.loadIdentity();

			//console.log('0');
			//console.log(gl['projectionMatrix'].m);
			//console.log(gl['modelviewMatrix'].m);

			//gl.perspective(45, gl.canvas.width*0.5 / gl.canvas.height, 0.01, 100);
			
			//console.log('1');
			//console.log(gl['projectionMatrix'].m);
			//console.log(gl['modelviewMatrix'].m);
			
			gl.multMatrix(leftpjm);

			//console.log('2');
			//console.log(gl.projectionMatrix.m);
			/********************************************************************************************/	

		  gl.matrixMode(gl.MODELVIEW);

		  draw(true);

			/*right*/
				
			var rightpjm = Matrixrize(rightProjectionMatrix);
		  //console.log(rightpjm)
		
			var rightvwm = Matrixrize(rightViewMatrix);
		  //console.log(rightvwm)

		  gl.viewport(gl.canvas.width*0.5, 0, gl.canvas.width*0.5, gl.canvas.height);
			gl.loadIdentity();
    	gl.translate(0, 0, -4);
    	gl.rotate(-angleX, 1, 0, 0);
    	gl.rotate(-angleY, 0, 1, 0);
    	gl.translate(0, 0.5, 0);
			gl.multMatrix(rightvwm);
		  gl.matrixMode(gl.PROJECTION); 
			gl.loadIdentity();
		  //gl.perspective(45, gl.canvas.width*0.5 / gl.canvas.height, 0.01, 100);
			gl.multMatrix(rightpjm);
		  gl.matrixMode(gl.MODELVIEW);
		  draw(false);
			vrDisplay.getFrameData(frameData);
			vrDisplay.submitFrame();	
			}
			animating();
  }

  document.body.appendChild(gl.canvas);
  gl.clearColor(0, 0, 0, 1);

  water = new Water();
  renderer = new Renderer();
  cubemap = new Cubemap({
    xneg: document.getElementById('xneg'),
    xpos: document.getElementById('xpos'),
    yneg: document.getElementById('ypos'),
    ypos: document.getElementById('ypos'),
    zneg: document.getElementById('zneg'),
    zpos: document.getElementById('zpos')
  });

  if (!water.textureA.canDrawTo() || !water.textureB.canDrawTo()) {
    throw new Error('Rendering to floating-point textures is required but not supported');
  }

  sphere = new Sphere(
    new GL.Vector(-0.4, -0.75, 0.2),
    0.25,
    new GL.Vector(),
  );

  bubbles = [];
  timeStamp = 0;

  for (var i = 0; i < 20; i++) {
    water.addDrop(Math.random() * 2 - 1, Math.random() * 2 - 1, 0.03, (i & 1) ? 0.01 : -0.01);
  }

  document.getElementById('loading').innerHTML = '';
  onresize();

  var requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function(callback) { setTimeout(callback, 0); };

  var prevTime = new Date().getTime();
  /*
  function animate() {
    var nextTime = new Date().getTime();
    if (!paused) {
      update((nextTime - prevTime) / 1000);
      draw();
    }
    prevTime = nextTime;
    requestAnimationFrame(animate);
  }*/
  window.onresize = onresize;

  var prevHit;
  var planeNormal;
  var mode = -1;
  var MODE_ADD_DROPS = 0;
  var MODE_MOVE_SPHERE = 1;
  var MODE_ORBIT_CAMERA = 2;

  var oldX, oldY;

  function startDrag(x, y) {
    oldX = x;
    oldY = y;
    var tracer = new GL.Raytracer();
    var ray = tracer.getRayForPixel(x * ratio, y * ratio);
    var pointOnPlane = tracer.eye.add(ray.multiply(-tracer.eye.y / ray.y));
    var sphereHitTest = GL.Raytracer.hitTestSphere(tracer.eye, ray, sphere.center, sphere.radius);
    if (sphereHitTest) {
      mode = MODE_MOVE_SPHERE;
      prevHit = sphereHitTest.hit;
      planeNormal = tracer.getRayForPixel(gl.canvas.width / 2, gl.canvas.height / 2).negative();
    } else if (Math.abs(pointOnPlane.x) < 1 && Math.abs(pointOnPlane.z) < 1) {
      mode = MODE_ADD_DROPS;
      duringDrag(x, y);
    } else {
      mode = MODE_ORBIT_CAMERA;
    }
  }

  function duringDrag(x, y) {
    switch (mode) {
      case MODE_ADD_DROPS: {
        var tracer = new GL.Raytracer();
        var ray = tracer.getRayForPixel(x * ratio, y * ratio);
        var pointOnPlane = tracer.eye.add(ray.multiply(-tracer.eye.y / ray.y));
        water.addDrop(pointOnPlane.x, pointOnPlane.z, 0.03, 0.01);
        if (paused) {
          water.updateNormals();
          // renderer.updateCaustics(water, sphere);
        }
        break;
      }
      case MODE_MOVE_SPHERE: {
        var tracer = new GL.Raytracer();
        var ray = tracer.getRayForPixel(x * ratio, y * ratio);
        var t = -planeNormal.dot(tracer.eye.subtract(prevHit)) / planeNormal.dot(ray);
        var nextHit = tracer.eye.add(ray.multiply(t));

        var radius = sphere.radius;
        sphere.center = sphere.center.add(nextHit.subtract(prevHit));
        sphere.center.x = Math.max(radius - 1, Math.min(1 - radius, sphere.center.x));
        sphere.center.y = Math.max(radius - 1, Math.min(10, sphere.center.y));
        sphere.center.z = Math.max(radius - 1, Math.min(1 - radius, sphere.center.z));
        prevHit = nextHit;
        // if (paused) renderer.updateCaustics(water, sphere);
        break;
      }
      case MODE_ORBIT_CAMERA: {
        angleY -= x - oldX;
        angleX -= y - oldY;
        angleX = Math.max(-89.999, Math.min(89.999, angleX));
        break;
      }
    }
    oldX = x;
    oldY = y;
    if (paused) draw();
  }

  function stopDrag() {
    mode = -1;
  }

  function isHelpElement(element) {
    return element === help || element.parentNode && isHelpElement(element.parentNode);
  }

  document.onmousedown = function(e) {
    if (!isHelpElement(e.target)) {
      e.preventDefault();
      startDrag(e.pageX, e.pageY);
    }
  };

  document.onmousemove = function(e) {
    duringDrag(e.pageX, e.pageY);
  };

  document.onmouseup = function() {
    stopDrag();
  };

  document.ontouchstart = function(e) {
    if (e.touches.length === 1 && !isHelpElement(e.target)) {
      e.preventDefault();
      startDrag(e.touches[0].pageX, e.touches[0].pageY);
    }
  };

  document.ontouchmove = function(e) {
    if (e.touches.length === 1) {
      duringDrag(e.touches[0].pageX, e.touches[0].pageY);
    }
  };

  document.ontouchend = function(e) {
    if (e.touches.length == 0) {
      stopDrag();
    }
  };

  document.onkeydown = function(e) {
    if (e.which == ' '.charCodeAt(0)) paused = !paused;
    else if (e.which == 'G'.charCodeAt(0)) useSpherePhysics = !useSpherePhysics;
    else if (e.which == 'L'.charCodeAt(0) && paused) draw();
    else if (e.which == 'B'.charCodeAt(0)) addBubble();
  };

  var frame = 0;

  function addBubble() {
    bubbles.push (new Bubble(
      new GL.Vector(-0.9 + 1.8 * Math.random(), -1.0, -0.9 + 1.8 * Math.random()),
      0.1 * Math.random(),
      new GL.Vector(0.0, 0.0, 0.0)
    ));
  }

  function update(seconds) {
    if (seconds > 1) return;
    frame += seconds * 2;


    if (mode == MODE_MOVE_SPHERE) {
      // Start from rest when the player releases the mouse after moving the sphere
      sphere.updateVelocity(new GL.Vector());
    } else if (useSpherePhysics) {
      sphere.simulate(seconds);

      bubbles.forEach(function(bubble) {
        bubble.simulate(seconds);
      });

      if (timeStamp == 0) {
        //addBubble();
      }
      timeStamp = (timeStamp + 1) % 20;
    }

    // Displace water around the sphere
    water.moveSphere(sphere);
    sphere.updateCenter(sphere.center);

    var aliveBubbles = []
    // Simulate bubble in water
    bubbles.forEach(function(bubble) {
      var isAlive = !water.moveSingleBubble(bubble, sphere);
      bubble.updateCenter(bubble.center);

      if (isAlive) {
        aliveBubbles.push(bubble);
      }
    });
    bubbles = aliveBubbles;

    // Update the water simulation and graphics
    water.stepSimulation();
    water.updateNormals();
    // renderer.updateCaustics(water, sphere);
  }

  function draw(clear=false) {
    // Change the light direction to the camera look vector when the L key is pressed
    if (GL.keys.L) {
      renderer.lightDir = GL.Vector.fromAngles((90 - angleY) * Math.PI / 180, -angleX * Math.PI / 180);
      // if (paused) renderer.updateCaustics(water, sphere);
    }
		if (clear){
			//console.log('gl.clear')
    	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
		/*
		gl.loadIdentity();
    gl.translate(0, 0, -4);
    gl.rotate(-angleX, 1, 0, 0);
    gl.rotate(-angleY, 0, 1, 0);
    gl.translate(0, 0.5, 0);
		*/
    gl.enable(gl.DEPTH_TEST);
    bubbles.forEach(function(bubble) {
      renderer.renderBubble(cubemap, bubble);
    })
    renderer.renderCube(sphere);
    renderer.renderWater(water, cubemap, sphere);
    renderer.renderSphere(sphere);
    gl.disable(gl.DEPTH_TEST);
  }



};
