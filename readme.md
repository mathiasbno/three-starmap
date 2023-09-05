## THREE starmap

A small point mesh for displaying realistic stars as a starmap using THREE.js. As well as showing the 88 modern constellations.

![Dec-28-2022 15-35-08](https://user-images.githubusercontent.com/5957456/209828033-3216a79c-0969-4e0e-a362-144602e5ce72.gif)

### How does it work

#### Stars

THREE starmap is based on the [HYG dataset](https://github.com/astronexus/HYG-Database) consisting of close to 120 000 registered stars. I have converted the dataset from csv to json just to make it easier to import and work with when formatting the data.

Filtering and formatting the data we reduce the dataset down to about 8913 stars that are visible by the naked eye based on the [apparent magnitude](https://en.wikipedia.org/wiki/Apparent_magnitude) of less then 6.5. The scale is a reverse logarithmic scale, that means that the lower the number the brighter in the night sky. Sirius is the brightest with apparent magnetude of -1.44. Our own sun is about -27.

In the formatter we also convert the cartesian coordinates into points on a sphere.

We then plot the stars on a sphere using the points calculated in the formatter and color them based on the star's color index. Scale and brightnes is calculated from the apparent magnitude.

#### Constellations

You can also add the [88 modern constellations](https://en.wikipedia.org/wiki/IAU_designated_constellations). We use [Constellation lines dataset](https://github.com/hemel-waarnemen-com/Constellation-lines) that contains all the 88 constellations mapped to the star IDs in the [Yale Bright Star Catalog](http://tdc-www.harvard.edu/catalogs/bsc5.html). Coninsidently this id is the same as the `hr` field in the HYG dataset.

I have also converted this to json to be easier to work with. The dataset contains a list of stars to visit in order to draw a line trough the constellation. This means that some times we visit the same star twise as we backtrack the line. Some constellations are also consistent of two parts.

For some reason there are a few stars that are not mapped up corectly so we have to skip them.

### Quick Start

#### Install

```bash
$ npm install three-starmap
or
$ pnpm add three-starmap
or
$ yarn add three-starmap
```

#### Use

```js
import Stars from "three-starmap";

…

const stars = new Stars();
scene.add(stars);
```

#### Vite

When using vite we need to configure Vite to handle glsl files.

Add glsl plugin for Vite:

```bash
$ yarn add vite-plugin-glsl
```

And update the config to handle glsl, we also need to make sure that it can handle glsl files coming from the `node_modules` folder:

```js
import glsl from "vite-plugin-glsl";

…

{
  plugins: [glsl()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".glsl": "text",
      },
    },
  },
}
```

#### Settings

Settings are buildt up in two parts, the debug part and the stars setting part. Pass this object to the `Stars` class.

Settings below is the _default values_, if you dont intend to change them you can skip them.

```js
const settings = {
  {
  debug: {
    // Activates the debug panel using lil-gui
    active: false,
    // If you have your own lil-gui debug panel you can
    // pass it in to append the three-starmap panel to yours
    // Otherwise, if debug is active, we'll create a new lil-gui instance for you
    gui: null,
    // Show helper wireframe and cardinal directions
    showHelpers: false
  },
  settings: {
    // Tilt star map on axis to mimic earths tilt
    earthTilt: true,
    // Show constellations
    showConstellations: false,
    // Color on line used to draw constallations
    constellationColor: new THREE.Color(0xd1d9e6),
    // Line width for drawing constallations
    constellationLineWidth: 2,
    // Star size attenuation
    attenuation: false,
    // Min and max star size as shown on night sky in pixels
    starMin: 2.3,
    starMax: 13.9,
    // Star magnitude to be calculated as 100% opacity (inverse logarytm scale, lower is brighter)
    // If you want all the stars to be the same brightnes you can set this to 6.5
    starFadeDactor: -1.4,
    // Minimumbrightnes of star, filters away all stars with
    // apparent magnetude greater then value
    // Max 6.5 (all visible stars)
    starMinBrightnes: 6.5,
  },
}

const stars = new Stars(settings);
```

#### Formatter

To run the formatter and export your own json file of stars you can clone the project

```bash
$ git clone git@github.com:mathiasbno/three-starmap.git
$ cd three-starmap
```

```bash
$ npm install
```

or

```bash
$ yarn install
```

Now you can run the formatter using the built in script

```
$ yarn run format
```

This will replace the `./data/visibleStarsFormatted.json` file in the `./data` folder. Tweak the `formatter.mjs` file to get the desired output

You can add the filename at the end if you want it to be a new file.

```
$ yarn run format "filename"
```

This will end up in the data folder `./data/filename.json`

_Note that you need node v18.xx.x or later to use this, as we do some experimental imports of json files._

#### Dev and demo

To develop and run a demo of the stars you can clone the project.

```bash
$ git clone git@github.com:mathiasbno/three-starmap.git
$ cd three-starmap
```

```bash
$ npm install
```

or

```bash
$ yarn install
```

Now you can run the dev server and demo by doing

```bash
$ yarn run dev
```

#### Bonus

You can input the lat/lng for your position on earth to rotate the night sky so the correct part of space is showing.

```js
…

const latLng = new THREE.Vector2(59.916826, 10.727947);
const hourOfDay = 12;
const latOffset = 360 * (hourOfDay / 24 - 0.5);

stars.rotation.y = THREE.MathUtils.degToRad(latLng.y + latOffset);
stars.rotation.x = THREE.MathUtils.degToRad(latLng.x);
```
