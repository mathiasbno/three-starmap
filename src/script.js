import * as THREE from "three";
import * as dat from "lil-gui";
import Stats from "stats.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Stars } from "./Stars";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Geometry
const latLng = new THREE.Vector2(59.9139, 10.7522);
const date = new Date();
const timeOfDay = { hour: 12, minutes: 0, seconds: 0 };
const dayInYear = { day: 226 };

date.setHours(timeOfDay.hour);
date.setMinutes(timeOfDay.minutes);
date.setSeconds(timeOfDay.seconds);

gui.add(latLng, "x").min(-90).max(90).step(0.01).name("lat");
gui.add(latLng, "y").min(-180).max(180).step(0.01).name("lng");
gui.add(timeOfDay, "hour").min(0).max(24).step(0.001).name("Hour of day");
gui.add(timeOfDay, "minutes").min(0).max(60).step(0.001).name("Minute of day");
gui.add(timeOfDay, "seconds").min(0).max(60).step(0.001).name("Seconds of day");
gui.add(dayInYear, "day").min(0).max(365).step(1).name("Day in year");

/**
 * Starts
 */
const stars = new Stars({
  debug: { active: true, gui: gui },
  settings: {
    starMin: 2.3,
    starMax: 13.9,
  },
});
// stars.scale.setScalar(4);
scene.add(stars);

/**
 * Stats
 */

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  90,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0.25, -0.25, 300);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0b0e15, 1);

/**
 * Animate
 */
const clock = new THREE.Clock();

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

Date.prototype.addMinutes = function (m) {
  this.setTime(this.getTime() + 24 * m * 60 * 1000);
  return this;
};

Date.prototype.addSeconds = function (s) {
  this.setTime(this.getTime() + 24 * 60 * s * 1000);
  return this;
};

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  stats.begin();

  const _date = new Date(date);

  _date.setHours(timeOfDay.hour);
  _date.setMinutes(timeOfDay.minutes);
  _date.addSeconds(timeOfDay.seconds);
  _date.setDate(date.getDate() + dayInYear.day);

  let hourOfDay = timeOfDay.hour;
  const latOffset = 360 * (hourOfDay / 24 - 0.5);

  stars.rotation.y = THREE.MathUtils.degToRad(latLng.y + latOffset);
  stars.rotation.x = THREE.MathUtils.degToRad(latLng.x);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  stats.end();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
