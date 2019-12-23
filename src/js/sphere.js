/**
 * Bubble Script
 *
 * Copyright 2019 Yuchen Wang
 */

function Sphere(_center, _radius, _initVelocity, _gravity) {
  this.oldCenter = this.center = _center;
  this.radius = _radius;
  this.velocity = _initVelocity;
  this.gravity = _gravity;
}

Sphere.prototype.updateCenter = function(_newCenter) {
  this.oldCenter = this.center;
  this.center = _newCenter;
}

Sphere.prototype.updateVelocity = function(_velocity) {
  this.velocity = _velocity;
}

Sphere.prototype.simulate = function(_delta) {
  var percentUnderWater = Math.max(0, Math.min(1, (this.radius - this.center.y) / (2.0 * this.radius)));

  this.velocity = 
    this.velocity.add(this.gravity.multiply(_delta - 1.0 * _delta * percentUnderWater));
  this.velocity = 
    this.velocity.subtract(this.velocity.unit().multiply(percentUnderWater * _delta * this.velocity.dot(this.velocity)));
  this.center = this.center.add(this.velocity.multiply(_delta));

  // Bounce off the bottom
  if (this.center.y < this.radius - 1) {
    this.center.y = this.radius - 1;
    this.velocity.y = Math.abs(this.velocity.y) * 0.7;
  }
}

export default Sphere;
