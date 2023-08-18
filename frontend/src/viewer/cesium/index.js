import {
  Viewer,
  // Ion,
  Cartesian3,
  Math as CMath,
  HeadingPitchRoll,
  Transforms,
  ShadowMode,
  SunLight,
  sampleTerrainMostDetailed,
  createWorldTerrainAsync,
  Cartographic
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { toLonLat } from 'ol/proj';

window.CESIUM_BASE_URL = '/';
// Ion.defaultAccessToken = '';

let viewer;
let location = { lng: 0, lat: 0, alt: -9999 };
let terrainProvider;

const init = async () => {
  const sunLight = new SunLight();
  terrainProvider = await createWorldTerrainAsync();
  viewer = new Viewer('cesiumContainer', {
    terrainProvider,
    terrainShadows: ShadowMode.ENABLED,
    infoBox: false,
    selectionIndicator: false,
    shadows: true,
    shouldAnimate: true
  });

  // Doesn't work as expected.
  viewer.scene.light = sunLight;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.dynamicAtmosphereLighting = true;
  viewer.scene.globe.dynamicAtmosphereLightingFromSun = true;
};

init();

export const flyTo = async (lng, lat) => {
  const altitude = await getGroundAltitude(lng, lat);
  location = { lng, lat, alt: altitude };
  viewer.scene.camera.flyTo({
    destination: Cartesian3.fromDegrees(lng, lat, location.alt + 300),
    duration: 0.25 // seconds
  });
};

const getGroundAltitude = async (lng, lat) => {
  const position = Cartographic.fromDegrees(lng, lat);
  const updatedPosition = await sampleTerrainMostDetailed(terrainProvider, [position]);
  return updatedPosition[0].height;
};

export const createModel = async (url, coordinates) => {
  const altitude = await getGroundAltitude(...coordinates);
  const position = Cartesian3.fromDegrees(...coordinates, altitude);
  const heading = CMath.toRadians(135);
  const pitch = 0;
  const roll = 0;
  const hpr = new HeadingPitchRoll(heading, pitch, roll);
  const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

  const entity = viewer.entities.add({
    name: url,
    position,
    orientation,
    model: {
      uri: url
      // minimumPixelSize: 128,
      // maximumScale: 20000
    }
  });
  // viewer.trackedEntity = entity;
};

export const setFeaturesOnCesium = (features) => {
  viewer.entities.removeAll();
  features.forEach((feature) => {
    const type = feature.getGeometry().getType();
    if (type === 'Point') {
      createModelFromPoint(feature);
      return;
    }
    console.log(`Type: "${type}" is not implemented`);
  });
};

const createModelFromPoint = (feature) => {
  const coordinates = toLonLat(feature.getGeometry().getCoordinates());
  createModel(feature.get('kind'), coordinates);
};
