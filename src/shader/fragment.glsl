
varying vec2 vUv;
varying float vMag;
varying vec3 vColor;

uniform float starMin;
uniform float starMax;
uniform float starMinBrightnes;

float invLerp(float from, float to, float value){
  return (value - from) / (to - from);
}

void main() {
  vec2 uv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );

  // Draw circle
  float strength = 1. - step(0.5, distance(uv, vec2(0.5)));
  if (strength == 0.0 || vMag > starMinBrightnes) {
    discard;
  }

  float brightnesT = invLerp(starMin, starMax, vMag);
  float brightnes = mix(0.2, 1.0, clamp(brightnesT * 5.0, 0.0, 1.0));

  gl_FragColor = vec4(vColor, 1.0);
  // gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), 1.0);
}
