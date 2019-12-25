// Copyright 2019 Yuchen Wang

uniform sampler2D texture;
uniform vec3 oldCenter;
uniform vec3 newCenter;
uniform float radius;
varying vec2 coord;
varying vec3 position;

float volumeInSphere(vec3 center) {
  vec3 toCenter = vec3(coord.x * 2.0 - 1.0, 0.0, coord.y * 2.0 - 1.0) - center;
  float t = length(toCenter) / radius;
  float dy = exp(-pow(t * 1.5, 6.0));
  float ymin = min(0.0, center.y - dy);
  float ymax = min(max(0.0, center.y + dy), ymin + 2.0 * dy);
  return (ymax - ymin) * 0.1;
}

// Fluid reconstraction kernel function.
float W(float h, float d) {
  if (d > h)
    return 0.8 * h;
  else {
    return (315.0 * pow(h-d, 3.0)) / (64.0 * 3.1415926 * pow(h, 4.0));
  }
}

void main() {
  /* get vertex info */
  vec4 info = texture2D(texture, coord);

  float oldVolume = volumeInSphere(oldCenter);
  info.r += oldVolume;

  float newVolume = volumeInSphere(newCenter);
  if (newVolume > 0.0) { 
    // Fluid surface reconstruction
    float h = 2.0 * radius * (2.0 + info.r - newCenter.y);
    float dis = pow(length(newCenter - position), 2.0);
    info.r += 0.005 * (W(h, dis) - W(h/2.0, dis));
   }

  gl_FragColor = info;
}
