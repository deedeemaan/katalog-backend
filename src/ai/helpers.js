let detectorInstance = null;
const poseDetection = require('@tensorflow-models/pose-detection');

function angleWithHorizontal(p1, p2) {
  if (!p1 || !p2) {
    throw new Error('Invalid points for angle calculation');
  }
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
  return Math.abs(180 - angle); // diferența față de 180 de grade (orizontală perfectă)
}

function angleWithVertical(a, b) {
  if (!a || !b) {
    throw new Error('Invalid points for angle calculation');
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const angle = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
  return Math.abs(180 - angle); // diferența față de 180 de grade (verticală perfectă)
}

module.exports = { angleWithHorizontal, angleWithVertical };