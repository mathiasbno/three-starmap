import fs from "fs";
import data from "../data/hygdata_v3.json" assert { type: "json" };

import { getPosition } from "./helper/index.mjs";

// Magnitude is a messure of how bright a star appears observed from earth.
// This is messured on a reverse logarythmic scale, so the lower the better
//
// Lowest in the data set is Sirius with a value of -27.3
// But there is a big gap up to the next brightest star
const visibleStarsData = data.filter((item) => item.mag <= 6.5);

const coordsToPoints = (coordinate, radius) => {
  const deg2Rad = Math.PI / 180;
  const phi = (90 - coordinate.lat) * deg2Rad;
  const theta = (coordinate.lng + 180) * deg2Rad;
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return {
    x,
    y,
    z,
  };
  // return {
  //   x: Number(x.toFixed(5)),
  //   y: Number(y.toFixed(5)),
  //   z: Number(z.toFixed(5)),
  // };
};

const stars = [];
const radius = 200;

for (let star of visibleStarsData) {
  const rightAscension = star.ra;
  const longitude = (rightAscension * 360) / 24 - 180;

  const diclination = star.dec;
  const latitude = diclination;

  const azalt = getPosition(star, new Date(), latitude, longitude);

  const point = coordsToPoints({ lat: latitude, lng: longitude }, radius);

  stars.push({
    ...point,
    ra: star.ra,
    dec: star.dec,
    mag: star.mag,
    ci: star.ci,
    bf: star.bf,
    hr: star.hr,
    az: azalt.azimuth,
    alt: azalt.altitude,
    // az: Number(azalt.azimuth.toFixed(5)),
    // alt: Number(azalt.altitude.toFixed(5)),
  });
}

console.log(stars);

fs.writeFileSync("./data/visibleStarsFormatted.json", JSON.stringify(stars));

export { visibleStarsData, stars as starsLatLng };
