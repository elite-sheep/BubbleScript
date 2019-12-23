// Copyright 2019 Yuchen Wang

uniform sampler2D texture;
uniform vec2 delta;
varying vec2 coord;

void main() {
  vec4 info = texture2D(texture, coord);

  // update the normal
  vec3 dx = vec3(delta.x, texture2D(texture, vec2(coord.x + 0.5 * delta.x, coord.y)).r - info.r, 0.0);
  vec3 dy = vec3(0.0, texture2D(texture, vec2(coord.x, coord.y + 0.5 * delta.y)).r - info.r, 0.5 * delta.y);
  info.ba = normalize(cross(dy, dx)).xz;

  gl_FragColor = info;
}
