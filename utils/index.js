import bbox from '@turf/bbox-polygon';

export function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function getRandomValues(list) {
  const randName = [];
  do {
    randName[randName.length] = list.splice(Math.floor(Math.random() * list.length),1)[0];
  } while (randName.length < 3);
  return randName
}

export function getPolygonBetweenTwoPoints(currentBounds) {
  const applyToArray = (func, array) => func.apply(Math, array);
  const pointsLong = currentBounds.map((point) => point[0]);
  const pointsLat = currentBounds.map((point) => point[1]);
  return bbox([
    applyToArray(Math.min, pointsLong),
    applyToArray(Math.min, pointsLat),
    applyToArray(Math.max, pointsLong),
    applyToArray(Math.max, pointsLat),
  ]);
}
