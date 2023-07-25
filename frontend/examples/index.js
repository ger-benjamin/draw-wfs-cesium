import { debounce } from 'lodash';
import {
  setFeaturesOnDrawing,
  featuresFromGeoJson,
  getAllDrawnObjects,
  getDraw,
  setCenter,
  setDraw,
  toGeoJson
} from '../src/viewer/ol';
import { flyTo, setFeaturesOnCesium } from '../src/viewer/cesium';

window.example = {
  altitude: 0
};

const getFormValue = (selector, isCheckbox = false) => {
  const element = document.querySelector(selector);
  if (isCheckbox) {
    return element.checked;
  }
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
  { type: 'Point', url: './models/tent3.glb' },
  { type: 'Point', url: './models/firecamp.glb' },
  { type: 'Point', url: './models/tree2.glb' },
  { type: 'LineString', url: './models/tree1.glb' },
  { type: 'Polygon', url: './models/tree1.glb' },
  { type: 'Polygon', url: './models/tent1.glb' }
];
const objectSelect = () => {
  const index = Number(getFormValue('#objects'));
  const object = objects[index];
  setDraw(object.type, object.url);
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
  const geoJson = await geojsonData.json();
  const features = featuresFromGeoJson(geoJson);
  if (!autoSync) {
    setFeaturesOnDrawing(features);
  }
  setFeaturesOnCesium(features);
};
window.example.loadSelect = loadSelect;

let autoSync = true;
const setAutoSync = () => {
  autoSync = getFormValue('#autosync', true);
  console.log(autoSync);
};
window.example.setAutoSync = setAutoSync;

const sentGeoJson = async () => {
  getDraw().removeInteractions();
  const geoJson = toGeoJson(getAllDrawnObjects());
  const response = await fetch('http://localhost:3000/setdraw', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: geoJson
  });
  if (autoSync) {
    await loadSelect();
  }
  objectSelect();
  console.log(response);
};
const debouceSentGeoJson = debounce(sentGeoJson, 250);

const drawSource = getDraw().getSource();
drawSource.on('changefeature', debouceSentGeoJson);
drawSource.on('addfeature', debouceSentGeoJson);
drawSource.on('removefeature', debouceSentGeoJson);
