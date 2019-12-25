// Copyright 2019 Yuchen Wang

varying vec2 coord;
varying vec3 position;

void main() {
  coord = gl_Vertex.xy * 0.5 + 0.5;
  position = gl_Vertex.xyz;
  gl_Position = vec4(gl_Vertex.xyz, 1.0);
}
