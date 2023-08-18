import { LineString, Point } from 'ol/geom';
import { Feature } from 'ol';

export const featureToPointFeatures = (features) => {
  const allPointFeatures = [];
  features.forEach((feature) => {
    const type = feature.getGeometry().getType();
    if (type === 'Point') {
      allPointFeatures.push(feature);
    } else if (type === 'Polygon') {
      const pointFeatures = createRandomPointsInPolygon(feature);
      pointFeatures.forEach((pointFeature) =>
        pointFeature.set('kind', getRandomKind(feature))
      );
      allPointFeatures.push(...pointFeatures);
    } else if (type === 'LineString') {
      const pointFeatures = createPointsInLine(feature);
      pointFeatures.forEach((pointFeature) =>
        pointFeature.set('kind', getRandomKind(feature))
      );
      allPointFeatures.push(...pointFeatures);
    } else {
      console.log(`Type: "${type}" is not implemented`);
    }
  });
  return allPointFeatures;
};

const getRandomKind = (feature) => {
  const kind = `${feature.get('kind')}`;
  if (kind.includes('tree') || kind.includes('tent')) {
    return kind.replace('1', `${Math.ceil(Math.random() * 3)}`);
  }
  return kind;
};

const createPointsInLine = (feature) => {
  const distance = 20;
  const line = feature.getGeometry();
  const length = line.getLength();
  const nbElements = Math.floor(length / distance) + 1;
  return [...Array(nbElements)].map((el, index) => {
    const coordinates = line.getCoordinateAt((index * distance) / length);
    return new Feature(new Point(coordinates));
  });
};

const createRandomPointsInPolygon = (feature) => {
  // Get the extent of the polygon, fill it line per line with points, then remove points out of the original polygon.
  const extent = feature.getGeometry().getExtent();
  // min max distance in meter (very approx).
  const minDistance = 20;
  const maxDistance = 30;
  let newPoint;
  let currentLine = [];
  const allPoints = [];
  let xIsInExtent = true;
  let yIsInExtent = true;
  let count = 0;
  const getAngle = (random) => random * 90 * (Math.PI / 180);
  const dx = (distance, angle) => distance * Math.cos(angle);
  const getPlusMinus = (random) => ((random * 1000) & 1 ? 1 : -1);
  const dy = (distance, angle) => distance * Math.sin(angle);
  let start = [extent[0], extent[1]];
  while (yIsInExtent) {
    while (xIsInExtent) {
      const random = Math.random();
      const d = random * (maxDistance - minDistance) + minDistance;
      if (count === 0) {
        // First point is [extent x, last-line-1st-point-y]
        newPoint = new Point([extent[0] + d, start[1] + d]);
        start = [newPoint.getCoordinates()[0], newPoint.getCoordinates()[1]];
        currentLine.push(newPoint);
      } else {
        // New point is [last point + random, last point + random]
        const prevPointCoord = currentLine[count - 1].getCoordinates();
        const angle = getAngle(random);
        newPoint = new Point([
          prevPointCoord[0] + Math.max(dx(d, angle), minDistance / 2),
          start[1] + dy(d, angle) * getPlusMinus(random)
        ]);
        // Mark point as "to remove" if it's too near with another.
        const tooNear = currentLine
          .filter((point) => !point.get('tooNear'))
          .some((point) => {
            const dist = new LineString([
              newPoint.getCoordinates(),
              point.getCoordinates()
            ]).getLength();
            return dist < minDistance;
          });
        if (tooNear) {
          newPoint.set('tooNear', true);
        }
        currentLine.push(newPoint);
      }
      count++;
      // fuse
      if (count > 100 || allPoints.length > 1000) {
        allPoints.push(...currentLine);
        xIsInExtent = false;
        yIsInExtent = false;
      }
      // If the new point is too far at the right, starts a new line.
      if (newPoint.getCoordinates()[0] > extent[2]) {
        xIsInExtent = false;
        currentLine = currentLine.filter((point) => !point.get('tooNear'));
        currentLine.pop();
        allPoints.push(...currentLine);
        currentLine = [];
        count = 0;
      }
    }
    if (start[1] + minDistance > extent[3]) {
      // If the future new point is too far at the bottom, then stop.
      yIsInExtent = false;
    } else {
      // otherwise, makes a new line.
      xIsInExtent = true;
    }
  }
  // Remove points out of the original polygon.
  return allPoints
    .filter((point) => feature.getGeometry().intersectsCoordinate(point.getCoordinates()))
    .map((point) => new Feature(point));
};
