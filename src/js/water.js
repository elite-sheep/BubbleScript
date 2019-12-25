/*
 * BubbleScript
 *
 * Copyright 2011 Evan Wallace
 * Copyright 2019 Yuchen Wang
 * Released under the MIT license
 */

import GL from "./lightgl.js"
import { gl } from "./main.js"

import dropFragmentShader from "../shaders/dropfragmentshader.glsl"
import normalFragmentShader from "../shaders/normalfragmentshader.glsl"
import moveBubbleFragmentShader from "../shaders/movebubblefragmentshader.glsl"
import moveSphereFragmentShader from "../shaders/movespherefragmentshader.glsl"
import removeBubbleFragmentShader from "../shaders/removebubblefragmentshader.glsl"
import updateFragmentShader from "../shaders/updatefragmentshader.glsl"
import vertexShader from "../shaders/basevertexshader.glsl"

// The data in the texture is (position.y, velocity.y, normal.x, normal.z)
function Water() {
  this.plane = GL.Mesh.plane();
  if (!GL.Texture.canUseFloatingPointTextures()) {
    throw new Error('This demo requires the OES_texture_float extension');
  }
  var filter = GL.Texture.canUseFloatingPointLinearFiltering() ? gl.LINEAR : gl.NEAREST;
  this.textureA = new GL.Texture(256, 256, { type: gl.FLOAT, filter: filter });
  this.textureB = new GL.Texture(256, 256, { type: gl.FLOAT, filter: filter });
  if ((!this.textureA.canDrawTo() || !this.textureB.canDrawTo()) && GL.Texture.canUseHalfFloatingPointTextures()) {
    filter = GL.Texture.canUseHalfFloatingPointLinearFiltering() ? gl.LINEAR : gl.NEAREST;
    this.textureA = new GL.Texture(256, 256, { type: gl.HALF_FLOAT_OES, filter: filter });
    this.textureB = new GL.Texture(256, 256, { type: gl.HALF_FLOAT_OES, filter: filter });
  }
  this.dropShader = new GL.Shader(vertexShader, dropFragmentShader);
  this.updateShader = new GL.Shader(vertexShader, updateFragmentShader);
  this.normalShader = new GL.Shader(vertexShader, normalFragmentShader);
  this.sphereShader = new GL.Shader(vertexShader, moveSphereFragmentShader);
  this.bubbleShader = new GL.Shader(vertexShader, moveBubbleFragmentShader);
  this.removeBubbleShader = new GL.Shader(vertexShader, removeBubbleFragmentShader);
}

Water.prototype.addDrop = function(x, y, radius, strength) {
  var this_ = this;
  this.textureB.drawTo(function() {
    this_.textureA.bind();
    this_.dropShader.uniforms({
      center: [x, y],
      radius: radius,
      strength: strength
    }).draw(this_.plane);
  });
  this.textureB.swapWith(this.textureA);
};

Water.prototype.removeBubble = function(bubble) {
  var this_ = this;
  this.textureB.drawTo(function() {
    this_.textureA.bind();
    this_.removeBubbleShader.uniforms({
      oldCenter: bubble.oldCenter,
      newCenter: bubble.center,
      radius: bubble.radius,
    }).draw(this_.plane);
  });
  this.textureB.swapWith(this.textureA);
}

Water.prototype.moveSingleBubble = function(bubble, sphere) {
  var this_ = this;
  this.textureB.drawTo(function() {
    this_.textureA.bind();
    this_.bubbleShader.uniforms({
      oldCenter: bubble.oldCenter,
      newCenter: bubble.center,
      radius: bubble.radius,
    }).draw(this_.plane);
  });
  this.textureB.swapWith(this.textureA);

  var center = bubble.center;
  var radius = bubble.radius;
  if ( center.subtract(sphere.center).length < radius + sphere.radius
    || center.y + radius > 0.01 * radius
    || center.x - radius < -1.0
    || center.z - radius < -1.0
    || 1.0 - center.x < radius
    || 1.0 - center.z < radius) {
    this.removeBubble(bubble);
    return true;
  }

  return false;
}

Water.prototype.moveSphere = function(sphere) {
  var this_ = this;
  this.textureB.drawTo(function() {
    this_.textureA.bind();
    this_.sphereShader.uniforms({
      oldCenter: sphere.oldCenter,
      newCenter: sphere.center,
      radius: sphere.radius
    }).draw(this_.plane);
  });
  this.textureB.swapWith(this.textureA);
};

Water.prototype.stepSimulation = function() {
  var this_ = this;
  this.textureB.drawTo(function() {
    this_.textureA.bind();
    this_.updateShader.uniforms({
      delta: [1 / this_.textureA.width, 1 / this_.textureA.height]
    }).draw(this_.plane);
  });
  this.textureB.swapWith(this.textureA);
};

Water.prototype.updateNormals = function() {
  var this_ = this;
  this.textureB.drawTo(function() {
    this_.textureA.bind();
    this_.normalShader.uniforms({
      delta: [1 / this_.textureA.width, 1 / this_.textureA.height]
    }).draw(this_.plane);
  });
  this.textureB.swapWith(this.textureA);
};

export default Water;
