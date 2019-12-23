// Copyright 2019 Yuchen Wang

uniform sampler2D texture;
uniform vec2 delta;
varying vec2 coord;

void main() {
  vec4 info = texture2D(texture, coord);

  // Calculate neibour height
  vec2 dx = vec2(0.5 * delta.x, 0.0);
  vec2 dy = vec2(0.0, 0.5 * delta.y);
  float average = (
      texture2D(texture, coord - 0.5 * dx).r +
      texture2D(texture, coord - 0.5 * dy).r +
      texture2D(texture, coord + 0.5 * dx).r + 
      texture2D(texture, coord + 0.5 * dy).r) * 0.25;

  info.g += (average - info.r) * 2.0;
  info.g *= 0.995;
  info.r += info.g;
  gl_FragColor = info;
}
