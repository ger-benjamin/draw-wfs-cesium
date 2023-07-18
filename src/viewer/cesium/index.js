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
  Cartographic,
  IonResource
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

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
  const position = Cartographic.fromDegrees(lng, lat);
  const updatedPosition = await sampleTerrainMostDetailed(terrainProvider, [position]);
  location = { lng, lat, alt: updatedPosition[0].height };
  viewer.scene.camera.flyTo({
    destination: Cartesian3.fromDegrees(lng, lat, location.alt + 300),
    duration: 0.25 // seconds
  });
};

export const createModel = (url, altitude) => {
  altitude += 0.01;
  if (location.alt === -9999) {
    return;
  }
  viewer.entities.removeAll();
  // 46°22′53.814″N 7°37′23.537″E
  const position = Cartesian3.fromDegrees(
    location.lng,
    location.lat,
    location.alt + altitude
  );
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
