import * as THREE from "three";
import * as dat from "lil-gui";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { PointTextHelper } from "@jniac/three-point-text-helper";

import { visibleStars } from "./data/visibleStarsFormatted.js";
import { constelations } from "./data/ConstellationLines.js";

import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import { bvToRgb } from "./helper/colorIndex.mjs";

class StarsConstructor {
  constructor(params) {
    this.debug = {
      active: false,
      gui: null,
      showHelpers: false,
      ...params?.debug,
    };

    this.settings = {
      earthTilt: true,
      showConstellations: false,
      constellationColor: new THREE.Color(0xd1d9e6),
      constellationLineWidth: 2,
      attenuation: false,
      starMin: 2.3,
      starMax: 13.9,
      starFadeDactor: -1.4,
      starMinBrightnes: 6.5,
      ...params?.settings,
    };

    this.stars = visibleStars;
    this.constelationsGroup = new THREE.Group();
    this.constelationsGroup.visible = this.settings.showConstellations;

    this.setGeometry();
    this.setMaterial();

    // Debug
    if (this.debug.active) {
      this.debug.gui = this.debug.gui ? this.debug.gui : new dat.GUI();
      this.debugFolder = this.debug.gui.addFolder("stars");
      this.debugInit();
    }
  }

  setGeometry() {
    this.geometry = new THREE.BufferGeometry();
    const count = this.stars?.length;

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0, j = 0; i < count * 3; i += 3, j++) {
      positions[i] = this.stars[j].x;
      positions[i + 1] = this.stars[j].y;
      positions[i + 2] = this.stars[j].z;

      sizes[j] = this.stars[j].mag;

      const starColorRGB = bvToRgb(this.stars[j].ci);
      colors[i] = starColorRGB[0];
      colors[i + 1] = starColorRGB[1];
      colors[i + 2] = starColorRGB[2];
    }

    this.geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        attenuation: { value: this.settings.attenuation },
        starMin: { value: this.settings.starMin },
        starMax: { value: this.settings.starMax },
        starMinBrightnes: { value: this.settings.starMinBrightnes },
        starFadeDactor: { value: this.settings.starFadeDactor },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: false,
    });
  }

  debugInit() {
    if (this.debug.active) {
      const guiChanged = () => {
        this.material.uniforms.attenuation.value = this.settings.attenuation;
        this.material.uniforms.starMin.value = this.settings.starMin;
        this.material.uniforms.starMax.value = this.settings.starMax;
        this.material.uniforms.starFadeDactor.value =
          this.settings.starFadeDactor;
        this.material.uniforms.starMinBrightnes.value =
          this.settings.starMinBrightnes;
        this.material.uniformsNeedUpdate = true;
      };

      this.debugFolder
        .add(this.settings, "showConstellations")
        .onChange((value) => (this.constelationsGroup.visible = value));
      this.debugFolder
        .add(this.settings, "constellationLineWidth", 0.0, 20.0, 1)
        .onChange((value) => {
          for (const line of this.constelationsGroup.children) {
            line.material.linewidth = value;
          }
        });
      this.debugFolder
        .addColor(this.settings, "constellationColor")
        .onChange((value) => {
          for (const line of this.constelationsGroup.children) {
            line.material.color = value;
          }
        });
      this.debugFolder
        .add(this.settings, "attenuation")
        .onChange(() => guiChanged());
      this.debugFolder
        .add(this.settings, "starMin", 0.0, 20.0, 0.1)
        .onChange(() => guiChanged());
      this.debugFolder
        .add(this.settings, "starMax", 0.0, 40.0, 0.1)
        .onChange(() => guiChanged());
      this.debugFolder
        .add(this.settings, "starFadeDactor", -1.4, 6.5, 0.1)
        .onChange(() => guiChanged());
      this.debugFolder
        .add(this.settings, "starMinBrightnes", -1.4, 6.5, 0.01)
        .onChange(() => guiChanged());
    }
  }
}

export class Stars extends THREE.Points {
  constructor(params) {
    const stars = new StarsConstructor(params);

    super(stars.geometry, stars.material);

    this.settings = stars.settings;
    this.debug = stars.debug;
    this.stars = stars.stars;
    this.constelationsGroup = stars.constelationsGroup;

    // this.setStarNames();
    this.setConstelations();

    if (this.settings.earthTilt) {
      this.setEarthTilt();
    }

    if (this.debug.active && this.debug.showHelpers) {
      this.setWireframe();
      this.setCardinalDirections();
    }
  }

  setEarthTilt() {
    this.quaternion.setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      (Math.PI / 180) * 23.5
    );
  }

  setStarNames() {
    for (let star of this.stars) {
      if (!star.proper) continue;
      const name = new PointTextHelper({ charMax: 30 });
      name.display({
        text: star.proper,
        color: "cyan",
        size: 5,
        position: {
          x: star.x,
          y: star.y,
          z: star.z,
        },
      });

      this.add(name);
    }
  }

  setConstelations() {
    const constellationKeys = Object.keys(constelations);

    for (const id of constellationKeys) {
      const constellation = constelations[id];
      const points = [];
      for (let i = 0; i < constellation.count; i++) {
        const starId = constellation.stars[i];
        const star = this.stars.find((item) => item.hr === starId);

        // For some reason not all the stars are present in the dataset
        // at least not mapped up using the BSC star ID (that is mapped to hr in the HYG dataset
        // we are using for stars)
        if (!!star) {
          points.push(star.x, star.y, star.z);
        }
      }

      const geometry = new LineGeometry();
      geometry.setPositions(points);
      const matLine = new LineMaterial({
        color: this.settings.constellationColor,
        linewidth: this.settings.constellationLineWidth,
        worldUnits: false,
      });
      matLine.resolution.set(window.innerWidth, window.innerHeight);

      const line = new Line2(geometry, matLine);

      this.constelationsGroup.add(line);
    }

    this.add(this.constelationsGroup);
  }

  setWireframe() {
    const geometry = new THREE.SphereGeometry(200, 50, 50);
    const material = new THREE.MeshBasicMaterial({
      color: 0x6b717b,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.add(mesh);
  }

  setCardinalDirections() {
    const N = new PointTextHelper();
    N.display({
      text: "N",
      color: "cyan",
      size: 32,
      position: {
        x: 0,
        y: 200,
        z: 0,
      },
    });

    const S = new PointTextHelper();
    S.display({
      text: "S",
      color: "cyan",
      size: 32,
      position: {
        x: 0,
        y: -200,
        z: 0,
      },
    });

    const W = new PointTextHelper();
    W.display({
      text: "W",
      color: "cyan",
      size: 32,
      position: {
        x: 200,
        y: 0,
        z: 0,
      },
    });

    const E = new PointTextHelper();
    E.display({
      text: "E",
      color: "cyan",
      size: 32,
      position: {
        x: -200,
        y: 0,
        z: 0,
      },
    });

    this.add(N);
    this.add(S);
    this.add(W);
    this.add(E);
  }
}
