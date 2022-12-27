// This function is directly loiftet from the following fiddle: http://jsfiddle.net/AkjDw/2/
// The aproximation of star color based on the astronomical Color Index is apparently notoriesly
// hard to do without a large lookuptable or some sort of color ramp.
//
// Following the steps in the stackoverflow post this a good aproximation to the color based on
// the color index
// https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color

export function bvToRgb(bv) {
  var t = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));

  // t to xyY
  var x,
    y = 0;

  if ((t >= 1667) & (t <= 4000)) {
    x =
      (-0.2661239 * Math.pow(10, 9)) / Math.pow(t, 3) +
      (-0.234358 * Math.pow(10, 6)) / Math.pow(t, 2) +
      (0.8776956 * Math.pow(10, 3)) / t +
      0.17991;
  } else if (t > 4000) {
    x =
      (-3.0258469 * Math.pow(10, 9)) / Math.pow(t, 3) +
      (2.1070379 * Math.pow(10, 6)) / Math.pow(t, 2) +
      (0.2226347 * Math.pow(10, 3)) / t +
      0.24039;
  }

  if ((t >= 1667) & (t <= 2222)) {
    y =
      -1.1063814 * Math.pow(x, 3) -
      1.3481102 * Math.pow(x, 2) +
      2.18555832 * x -
      0.20219683;
  } else if ((t > 2222) & (t <= 4000)) {
    y =
      -0.9549476 * Math.pow(x, 3) -
      1.37418593 * Math.pow(x, 2) +
      2.09137015 * x -
      0.16748867;
  } else if (t > 4000) {
    y =
      3.081758 * Math.pow(x, 3) -
      5.8733867 * Math.pow(x, 2) +
      3.75112997 * x -
      0.37001483;
  }

  // xyY to XYZ, Y = 1
  var Y = 1.0;
  var X = y == 0 ? 0 : (x * Y) / y;
  var Z = y == 0 ? 0 : ((1 - x - y) * Y) / y;

  //XYZ to rgb
  var r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  var g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  var b = 0.0557 * X - 0.204 * Y + 1.057 * Z;

  //linear RGB to sRGB
  var R = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 0.5) - 0.055;
  var G = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 0.5) - 0.055;
  var B = b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 0.5) - 0.055;

  return [
    Math.round(R * 255) / 255,
    Math.round(G * 255) / 255,
    Math.round(B * 255) / 255,
  ];
}
