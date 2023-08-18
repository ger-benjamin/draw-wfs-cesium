import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj';
import { DrawObjects } from './drawObjects';
import GeoJSON from 'ol/format/GeoJSON.js';

export { featureToPointFeatures } from './featureToPointFeatures';

const view = new View({
  center: [0, 0],
  zoom: 2
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'ol-map',
  view
});

const draw = new DrawObjects(map);

export const setCenter = (lng, lat) => {
  view.setCenter(fromLonLat([lng, lat]));
  view.setZoom(17);
};

export const setDraw = (type, kind) => {
  draw.changeDrawInteraction(type, kind);
};

export const getDraw = () => {
  return draw;
};

export const getAllDrawnObjects = () => {
  return draw.getAllDrawnObjects();
};

const geoJson = new GeoJSON();
export const toGeoJson = (features) => {
  return geoJson.writeFeatures(features);
};

export const featuresFromGeoJson = (geojsonData) => {
  return geoJson.readFeatures(geojsonData);
};

export const setFeaturesOnDrawing = (features) => {
  draw.getSource().clear();
  draw.getSource().addFeatures(features);
};
