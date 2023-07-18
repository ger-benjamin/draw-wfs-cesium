import {Viewer, Tearrain, Ion, Cartesian3, Math as CMath, HeadingPitchRoll, Transforms, ShadowMode, Terrain, SunLight} from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

window.CESIUM_BASE_URL = '/';
//Ion.defaultAccessToken = '';

const baseAltitude = 1400;
const leukerbad = {name: 'Leukerbad', loc: [7.623205, 46.381615]};

const sunLight = new SunLight();

const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
  terrainShadows: ShadowMode.ENABLED,
  infoBox: false,
  selectionIndicator: false,
  shadows: true,
  shouldAnimate: true,
});

// Doesn't work as expected.
viewer.scene.light = sunLight;
viewer.scene.globe.enableLighting = true;
viewer.scene.globe.dynamicAtmosphereLighting = true;
viewer.scene.globe.dynamicAtmosphereLightingFromSun = true;

const flyTo = (lng, lat) => {
  viewer.scene.camera.flyTo({
      destination: Cartesian3.fromDegrees(lng, lat, baseAltitude + 300),
  })
}
flyTo(...leukerbad.loc);

createModel = (url, height) => {
  viewer.entities.removeAll();

  // 46°22′53.814″N 7°37′23.537″E
  const position = Cartesian3.fromDegrees(
    7.623205,
    46.381615,
    height
  );
  const heading = CMath.toRadians(135);
  const pitch = 0;
  const roll = 0;
  const hpr = new HeadingPitchRoll(heading, pitch, roll);
  const orientation = Transforms.headingPitchRollQuaternion(
    position,
    hpr
  );

  const entity = viewer.entities.add({
    name: url,
    position: position,
    orientation: orientation,
    model: {
      uri: url,
      minimumPixelSize: 128,
      maximumScale: 20000,
    },
  });
  //viewer.trackedEntity = entity;
}

const options = [
  {
    text: "Aircraft",
    onselect: function () {
      createModel(
        "./SampleData/models/CesiumAir/Cesium_Air.glb",
        120.0 + baseAltitude
      );
    },
  },
  {
    text: "Drone",
    onselect: function () {
      createModel(
        "./SampleData/models/CesiumDrone/CesiumDrone.glb",
        120.0 + baseAltitude
      );
    },
  },
  {
    text: "Ground Vehicle",
    onselect: function () {
      createModel(
        "./SampleData/models/GroundVehicle/GroundVehicle.glb",
        0 + baseAltitude
      );
    },
  },
  {
    text: "Hot Air Balloon",
    onselect: function () {
      createModel(
        "./SampleData/models/CesiumBalloon/CesiumBalloon.glb",
        1000.0 + baseAltitude
      );
    },
  },
  {
    text: "Milk Truck",
    onselect: function () {
      createModel(
        "./SampleData/models/CesiumMilkTruck/CesiumMilkTruck.glb",
        0 + baseAltitude
      );
    },
  },
  {
    text: "Skinned Character",
    onselect: function () {
      createModel(
        "./SampleData/models/CesiumMan/Cesium_Man.glb",
        0 + baseAltitude
      );
    },
  },
  {
    text: "Unlit Box",
    onselect: function () {
      createModel(
        "./SampleData/models/BoxUnlit/BoxUnlit.gltf",
        10.0 + baseAltitude
      );
    },
  },
  {
    text: "Draco Compressed Model",
    onselect: function () {
      createModel(
        "./SampleData/models/DracoCompressed/CesiumMilkTruck.gltf",
        0 + baseAltitude
      );
    },
  },
  {
    text: "KTX2 Compressed Balloon",
    onselect: function () {
      if (!Cesium.FeatureDetection.supportsBasis(viewer.scene)) {
        window.alert(
          "This browser does not support Basis Universal compressed textures"
        );
      }
      createModel(
        "./SampleData/models/CesiumBalloonKTX2/CesiumBalloonKTX2.glb",
        1000.0 + baseAltitude
      );
    },
  },
  {
    text: "Instanced Box",
    onselect: function () {
      createModel(
        "./SampleData/models/BoxInstanced/BoxInstanced.gltf",
        15 + baseAltitude
      );
    },
  },
];

options[0].onselect();
