import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Draw, Modify } from 'ol/interaction';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Circle } from 'ol/style';
import { features } from 'process';

export class DrawObjects {
  map;
  layer;
  draw;
  kind;

  constructor (map) {
    this.map = map;
    this.layer = this.createDrawLayer();
    this.addListeners();
    this.map.addLayer(this.layer);
  }

  createDrawLayer () {
    const source = new VectorSource();
    const modify = new Modify({ source });
    this.map.addInteraction(modify);
    return new VectorLayer({
      source,
      style: this.styleFn
    });
  }

  styleFn (feature) {
    const kind = feature.get('kind') || '';
    let color = [0, 0, 0];
    if (kind.includes('tree')) {
      color = [50, 200, 100];
    } else if (kind.includes('tent')) {
      color = [50, 100, 200];
    } else if (kind.includes('fire')) {
      color = [255, 150, 0];
    }
    const stroke = new Stroke({
      color: `rgb(${color})`,
      width: 3
    });
    const fill = new Fill({
      color: `rgba(${color.join(',')}, 0.5)`
    });
    return new Style({
      stroke,
      fill,
      image: new Circle({
        stroke,
        fill,
        radius: 6
      })
    });
  }

  addListeners () {
    this.getSource().on('addfeature', (evt) => {
      if (!evt.feature.get('kind')) {
        evt.feature.set('kind', this.kind);
      }
    });
  }

  changeDrawInteraction (type, kind) {
    this.kind = kind;
    this.removeDrawInteraction();
    this.createDrawInteraction(type);
  }

  createDrawInteraction (type) {
    const source = this.getSource();

    this.draw = new Draw({
      source,
      type
    });
    this.map.addInteraction(this.draw);
  }

  removeDrawInteraction () {
    this.map.removeInteraction(this.draw);
  }

  getAllDrawnObjects = () => {
    return this.getSource().getFeatures();
  };

  getSource = () => {
    return this.layer.getSource();
  };
}
