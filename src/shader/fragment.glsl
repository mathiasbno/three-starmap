
varying vec2 vUv;
varying float vMag;
varying vec3 vColor;

uniform float starMin;
uniform float starMax;
uniform float starFadeDactor;
uniform float starMinBrightnes;

float invLerp(float from, float to, float value){
  return (value - from) / (to - from);
}

float remap(float value, float minIn, float maxIn, float minOut, float maxOut) {
  float t = invLerp(minIn, maxIn, value);
  return mix(minOut, maxOut, t);
}

void main() {
  vec2 uv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );

  // Draw circle
  float strength = 1. - step(0.5, distance(uv, vec2(0.5)));
  if (strength == 0.0 || vMag > starMinBrightnes) {
    discard;
  }

  // Calculate brightnews
  float brightnes = 1. - remap(vMag, starFadeDactor, 6.5, 0.0, 1.0);

  gl_FragColor = vec4(vColor, brightnes);
}
