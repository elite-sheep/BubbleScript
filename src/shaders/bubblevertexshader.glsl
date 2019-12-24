// Copyright 2019 Yuchen Wang

uniform vec3 sphereCenter;
uniform float sphereRadius;

varying vec3 position;
varying vec3 actualPosition;

void main() {
  position = sphereCenter + gl_Vertex.xyz * sphereRadius + (1.0 - 0.1 * gl_Vertex.z) * sphereRadius;
  actualPosition = sphereCenter + gl_Vertex.xyz * sphereRadius;
  gl_Position = gl_ModelViewProjectionMatrix * vec4(position, 1.0);
}
