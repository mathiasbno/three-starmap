
attribute float size;
attribute vec3 color;

uniform bool attenuation;
uniform float starMin;
uniform float starMax;

varying vec2 vUv;
varying float vSize;
varying float vMag;
varying vec3 vColor;

void main() {
  float normalizedSize = 1.0 - (size) / (6.5);

  vColor = color;
  vMag = size;
  vUv = uv;
  vSize = clamp(starMax * normalizedSize, starMin, starMax);

  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

  gl_PointSize = vSize;

  if (attenuation) {
    gl_PointSize = ((vSize * 1000.) / 2.) / - mvPosition.z;
  }

  gl_Position = projectionMatrix * mvPosition;
  gl_Position.z = gl_Position.w; // set z to camera.far
}
