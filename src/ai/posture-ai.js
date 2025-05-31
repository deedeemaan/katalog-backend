const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const poseDetection = require('@tensorflow-models/pose-detection');
const { createCanvas, loadImage } = require('canvas');
const { angleWithHorizontal, angleWithVertical, calculateBackAngles, calculateLateralAngles, calculateFrontAngles, determinePosition } = require('../ai/helpers');

let detector;
async function getDetector() {
  if (!detector) {
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.BlazePose,
      { runtime: 'tfjs', modelType: 'full', enableSmoothing: true }
    );
  }
  return detector;
}

/**
 * Rulează BlazePose și calculează unghiurile.
 */
async function analyzePosture(buffer) {
  const img = await loadImage(buffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const detector = await getDetector();
  const poses = await detector.estimatePoses(canvas);

  if (!poses.length || poses[0].keypoints.every(kp => kp.score < 0.5)) {
    throw new Error('No valid poses detected');
  }

  const keypoints = poses[0].keypoints;
  console.log('[AI] Keypoints detected:', keypoints);

  const position = determinePosition(keypoints);
  console.log('[AI] Detected position:', position);

  if (position === 'unknown') {
    throw new Error('Unable to determine body position');
  }

  let angles;
  if (position === 'side') {
    angles = calculateLateralAngles(keypoints);
  } else if (position === 'back') {
    angles = calculateBackAngles(keypoints);
  } else if (position === 'front') {
    angles = calculateFrontAngles(keypoints);
  }

  console.log('[AI] Angles calculated:', angles);
  return { angles, position, message: 'Success' };
}

/**
 * Creează o imagine JPEG cu overlay: keypoints, linii și unghi.
 * Returnează Buffer.
 */
async function annotateImage(buffer) {
  const img = await loadImage(buffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imgTensor = tf.browser.fromPixels(canvas);
  const det = await getDetector();
  const poses = await det.estimatePoses(imgTensor, { scoreThreshold: 0.5 });
  imgTensor.dispose();

  if (!poses.length || poses[0].keypoints.every(kp => kp.score < 0.5)) {
    throw new Error('Incomplete keypoints for annotation');
  }

  const kpMap = poses[0].keypoints.reduce((m, p) => { m[p.name] = p; return m; }, {});
  const ls = kpMap.left_shoulder;
  const rs = kpMap.right_shoulder;
  const lh = kpMap.left_hip;
  const rh = kpMap.right_hip;
  if (!ls || !rs || !lh || !rh) {
    throw new Error('Missing keypoints for annotation');
  }

  // midpoints
  const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const midHip      = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };

  // desenare puncte
  function drawPoint(p, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
    ctx.fill();
  }
  drawPoint(ls, 'red');
  drawPoint(rs, 'red');
  drawPoint(lh, 'blue');
  drawPoint(rh, 'blue');
  drawPoint(midShoulder, 'lime');
  drawPoint(midHip, 'lime');

  // desenare linii
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'red'; ctx.beginPath(); ctx.moveTo(ls.x, ls.y); ctx.lineTo(rs.x, rs.y); ctx.stroke();
  ctx.strokeStyle = 'blue'; ctx.beginPath(); ctx.moveTo(lh.x, lh.y); ctx.lineTo(rh.x, rh.y); ctx.stroke();
  ctx.strokeStyle = 'lime'; ctx.beginPath(); ctx.moveTo(midShoulder.x, midShoulder.y); ctx.lineTo(midHip.x, midHip.y); ctx.stroke();

  return canvas.toBuffer('image/jpeg');
}

module.exports = {
  analyzePosture,
  annotateImage
};
