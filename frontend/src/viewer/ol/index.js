import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj';
import { DrawObjects } from './drawObjects';

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

export const setDraw = (type) => {
  draw.changeDrawInteraction(type);
};
