/**
 * BubbleScript
 *
 * Copyright 2019 Yuchen Wang
 *
 */

import GL from "./lightgl.js"
import {PI, G, WaterDensity, BubbleDensity} from "./constants"

function Bubble(_center, _radius, _initVelocity) {
  this.oldCenter = this.center = _center;
  this.radius = _radius;
  this.velocity = _initVelocity;
}

Bubble.prototype.updateCenter = function(_newCenter) {
  this.oldCenter = this.center;
  this.center = _newCenter;
}

Bubble.prototype.updateVelocity = function(_velocity) {
  this.velocity = _velocity;
}

Bubble.prototype.simulate = function(_delta) {
  var percentUnderWater = Math.max(0, Math.min(1, (this.radius - this.center.y) / (2.0 * this.radius)));

  this.velocity = 
    this.velocity.add(G.multiply(_delta - WaterDensity / BubbleDensity * _delta * percentUnderWater));
  this.velocity = 
    this.velocity.subtract(this.velocity.unit().multiply(percentUnderWater * _delta * this.velocity.dot(this.velocity)));
  this.center = this.center.add(this.velocity.multiply(_delta));

  // Bounce off the bottom
  if (this.center.y < this.radius - 1) {
    this.center.y = this.radius - 1;
    this.velocity.y = Math.abs(this.velocity.y) * 0.75;
  }
}

Bubble.prototype.getVolume = function() {
  return 4.0 * PI * Math.pow(this.radius, 3.0) / 3.0;
}

export default Bubble;
