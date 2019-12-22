/*
 * WebGL Water
 * http://madebyevan.com/webgl-water/
 *
 * Copyright 2011 Evan Wallace
 * Copyright 2019 Yuchen Wang
 * Released under the MIT license
 */

import GL from "./lightgl.js"
import { gl } from "./main.js"
import { water } from "./main.js"

import causticsVertexShader from "../shaders/causticsvertexshader.glsl"
import causticsFragmentShader from "../shaders/causticsfragmentshader.glsl"
import cubeVertexShader from "../shaders/cubevertexshader.glsl"
import cubeFragmentShader from "../shaders/cubefragmentshader.glsl"
import sphereVertexShader from "../shaders/spherevertexshader.glsl"
import sphereFragmentShader from "../shaders/spherefragmentshader.glsl"
import waterVertexShader from "../shaders/watervertexshader.glsl"
import waterFragmentShader from "../shaders/waterfragmentshader.glsl"

function Renderer() {
  this.tileTexture = GL.Texture.fromImage(document.getElementById('tiles'), {
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
    wrap: gl.REPEAT,
    format: gl.RGB
  });
  this.lightDir = new GL.Vector(2.0, 2.0, -1.0).unit();
  this.waterMesh = GL.Mesh.plane({ detail: 200 });
  this.waterShaders = [];
  for (var i = 0; i < 2; i++) {
    this.waterShaders[i] = new GL.Shader(waterVertexShader, waterFragmentShader);
  }
  this.sphereCenter = new GL.Vector();
  this.sphereRadius = 0;
  this.sphereMesh = GL.Mesh.sphere({ detail: 10 });
  this.sphereShader = new GL.Shader(sphereVertexShader, sphereFragmentShader);

  this.cubeMesh = GL.Mesh.cube();
  this.cubeMesh.triangles.splice(4, 2);
  this.cubeMesh.compile();
  this.cubeShader = new GL.Shader(cubeVertexShader, cubeFragmentShader);

  this.causticTex = new GL.Texture(1024, 1024);
  var hasDerivatives = !!gl.getExtension('OES_standard_derivatives');
  this.causticsShader = new GL.Shader(causticsVertexShader, causticsFragmentShader);
}

Renderer.prototype.updateCaustics = function(water) {
  if (!this.causticsShader) return;
  var hasDerivatives = !!gl.getExtension('OES_standard_derivatives');
  var this_ = this;
  this.causticTex.drawTo(function() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    water.textureA.bind(0);
    this_.causticsShader.uniforms({
      light: this_.lightDir,
      water: 0,
      sphereCenter: this_.sphereCenter,
      sphereRadius: this_.sphereRadius,
      hasDerivatives: hasDerivatives
    }).draw(this_.waterMesh);
  });
};

Renderer.prototype.renderWater = function(water, sky) {
  var tracer = new GL.Raytracer();
  water.textureA.bind(0);
  this.tileTexture.bind(1);
  sky.bind(2);
  this.causticTex.bind(3);
  gl.enable(gl.CULL_FACE);
  for (var i = 0; i < 2; i++) {
    gl.cullFace(i ? gl.BACK : gl.FRONT);
    this.waterShaders[i].uniforms({
      light: this.lightDir,
      water: 0,
      tiles: 1,
      sky: 2,
      causticTex: 3,
      eye: tracer.eye,
      isUnderWater: i,
      sphereCenter: this.sphereCenter,
      sphereRadius: this.sphereRadius
    }).draw(this.waterMesh);
  }
  gl.disable(gl.CULL_FACE);
};

Renderer.prototype.renderSphere = function() {
  water.textureA.bind(0);
  this.causticTex.bind(1);
  this.sphereShader.uniforms({
    light: this.lightDir,
    water: 0,
    causticTex: 1,
    sphereCenter: this.sphereCenter,
    sphereRadius: this.sphereRadius
  }).draw(this.sphereMesh);
};

Renderer.prototype.renderCube = function() {
  gl.enable(gl.CULL_FACE);
  water.textureA.bind(0);
  this.tileTexture.bind(1);
  this.causticTex.bind(2);
  this.cubeShader.uniforms({
    light: this.lightDir,
    water: 0,
    tiles: 1,
    causticTex: 2,
    sphereCenter: this.sphereCenter,
    sphereRadius: this.sphereRadius
  }).draw(this.cubeMesh);
  gl.disable(gl.CULL_FACE);
};

export default Renderer;
