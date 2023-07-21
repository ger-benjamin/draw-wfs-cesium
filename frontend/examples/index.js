import {
  fromGeoJson as olFromGeoJson,
  getAllDrawnObjects,
  setCenter,
  setDraw,
  setDrawEndCallback,
  toGeoJson
} from '../src/viewer/ol';
import {
  createModel,
  flyTo,
  fromGeoJson as cesiumFromGeoJson
} from '../src/viewer/cesium';

window.example = {
  altitude: 0
};

const getFormValue = (selector) => {
  return document.querySelector(selector).value;
};

const locations = [
  { name: 'leukerbad', coords: [7.623205, 46.381615] },
  { name: 'estavayer', coords: [6.84671, 46.8558] }
];
const locationSelect = () => {
  const name = getFormValue('#locations');
  const dest = locations.find((loc) => loc.name === name) || locations[0];
  flyTo(...dest.coords);
  setCenter(...dest.coords);
};
window.example.locationSelect = locationSelect;

const objects = [
  { type: 'Point', url: './SampleData/models/GroundVehicle/GroundVehicle.glb' },
  { type: 'LineString', url: './SampleData/models/CesiumAir/Cesium_Air.glb' }
];
const objectSelect = () => {
  const index = Number(getFormValue('#objects'));
  const object = objects[index];
  setDraw(object.type);
  createModel(object.url, window.example.altitude);
};
window.example.objectSelect = objectSelect;

const loadSelect = async () => {
  const url = getFormValue('#load');
  const geojsonData = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });
  const data = await geojsonData.json();
  olFromGeoJson(data);
  cesiumFromGeoJson(data);
};
window.example.loadSelect = loadSelect;

const setAltitude = () => {
  window.example.altitude = Number(getFormValue('#altitude'));
};
window.example.setAltitude = setAltitude;

const olDrawEndCallback = (evt) => {
  // FIXME most recent recent is missing.
  setTimeout(sentGeoJson(toGeoJson(getAllDrawnObjects())), 0);
};
setDrawEndCallback(olDrawEndCallback);

const sentGeoJson = (geojson) => {
  fetch('http://localhost:3000/setdraw', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: geojson
  }).then((response) => console.log(response.json()));
};
