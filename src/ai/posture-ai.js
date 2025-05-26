const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const poseDetection = require('@tensorflow-models/pose-detection');
const { createCanvas, loadImage } = require('canvas');
const { angleWithHorizontal, angleWithVertical } = require('../ai/helpers');

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

  if (!poses.length || poses[0].keypoints.every(kp => kp.score < 0.3)) {
    throw new Error('No valid poses detected');
  }

  const keypoints = poses[0].keypoints;
  console.log('[AI] Keypoints detected:', keypoints);

  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const leftHip = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip = keypoints.find(kp => kp.name === 'right_hip');

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    throw new Error('Missing keypoints for posture analysis');
  }

  const shoulderTilt = angleWithHorizontal(leftShoulder, rightShoulder);
  const hipTilt = angleWithHorizontal(leftHip, rightHip);
  const spineTilt = angleWithVertical(leftShoulder, leftHip);

  const angles = { shoulderTilt, hipTilt, spineTilt };
  console.log('[AI] Angles calculated:', angles);

  return { angles, message: 'Success' };
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
  const poses = await det.estimatePoses(imgTensor, { scoreThreshold: 0.3 });
  imgTensor.dispose();

  if (!poses.length || poses[0].keypoints.every(kp => kp.score < 0.3)) {
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

  // calcul unghi coloana (cel mai mic ≤ 90°)
  let raw_spine = angleWithVertical(midShoulder, midHip);
  const spine_tilt = raw_spine > 90 ? 180 - raw_spine : raw_spine;

  // afișează unghi pe imagine
  ctx.font = '24px Sans';
  ctx.fillStyle = 'yellow';
  ctx.fillText(`Spine tilt: ${spine_tilt.toFixed(1)}°`, midShoulder.x + 10, midShoulder.y - 10);

  return canvas.toBuffer('image/jpeg');
}

module.exports = {
  analyzePosture,
  annotateImage
};
