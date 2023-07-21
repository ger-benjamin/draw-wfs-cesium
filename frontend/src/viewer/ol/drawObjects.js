import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Draw, Modify } from 'ol/interaction';

export class DrawObjects {
  map;
  layer;
  draw;

  constructor (map) {
    this.map = map;
    this.layer = this.createDrawLayer();
    this.map.addLayer(this.layer);
  }

  createDrawLayer () {
    const source = new VectorSource();
    const modify = new Modify({ source });
    this.map.addInteraction(modify);
    return new VectorLayer({ source });
  }

  changeDrawInteraction (type) {
    this.removeDrawInteraction();
    this.createDrawInteraction(type);
  }

  createDrawInteraction (type) {
    const source = this.layer.getSource();

    this.draw = new Draw({
      source,
      type
    });
    this.map.addInteraction(this.draw);
  }

  removeDrawInteraction () {
    this.map.removeInteraction(this.draw);
  }
}
