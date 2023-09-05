import fs from "fs";

// You'll have to download the csv file and convert it to json
// import data from "../data/hygdata_v3.json" assert { type: "json" };

import { getPosition } from "./helper/index.mjs";

// Magnitude is a messure of how bright a star appears observed from earth.
// This is messured on a reverse logarythmic scale, so the lower the brighter

// Lowest in the data set is our own sun with a value of -27.3
// We exclude it since its most likly gonna be drawn seperatly in a skybox and its a massive gap up
// to the second brightest object Sirius at -1.4
const visibleStarsData = data.filter(
  (item) => item.mag <= 6.5 && item.mag >= -1.44
);

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
    proper: star.proper,
    az: azalt.azimuth,
    alt: azalt.altitude,
  });
}

console.log(stars);
console.log(`Exported ${stars.length} stars`);
console.log("");

let filename = "./data/visibleStarsFormatted.json";

if (process.argv[2]) {
  filename = `./data/${process.argv[2].split(".")[0]}.json`;
}

fs.writeFileSync(filename, JSON.stringify(stars));

export { visibleStarsData, stars as starsLatLng };
