// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { createCanvas, loadImage } = require('canvas');
// const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-backend-cpu');
// const poseDetection = require('@tensorflow-models/pose-detection');

// // Import our analysis & drawing functions
// const { getDetector, angleWithHorizontal, angleWithVertical } = require('./helpers');

// async function analyzeAndOverlay(buffer) {
//   const img = await loadImage(buffer);
//   const canvas = createCanvas(img.width, img.height);
//   const ctx = canvas.getContext('2d');
//   ctx.drawImage(img, 0, 0);

//   await tf.setBackend('cpu');
//   const imgTensor = tf.browser.fromPixels(canvas);
//   const detector = await getDetector();
//   const poses = await detector.estimatePoses(imgTensor);
//   imgTensor.dispose();

//   if (!poses.length) {
//     throw new Error('No pose detected');
//   }
//   const kpMap = poses[0].keypoints.reduce((m, p) => (m[p.name]=p, m), {});
//   const ls = kpMap.left_shoulder, rs = kpMap.right_shoulder;
//   const lh = kpMap.left_hip,     rh = kpMap.right_hip;

//   // midpoints
//   const midShoulder = { x:(ls.x+rs.x)/2, y:(ls.y+rs.y)/2 };
//   const midHip      = { x:(lh.x+rh.x)/2, y:(lh.y+rh.y)/2 };

//   // angles
//   const shoulderTilt = angleWithHorizontal(ls, rs).toFixed(1);
//   const hipTilt      = angleWithHorizontal(lh, rh).toFixed(1);
//   const spineTilt    = angleWithVertical(midShoulder, midHip).toFixed(1);

//   // draw overlays
//   ctx.strokeStyle = 'lime'; ctx.lineWidth = 3;
//   ctx.beginPath(); ctx.moveTo(ls.x,ls.y); ctx.lineTo(rs.x,rs.y); ctx.stroke();
//   ctx.beginPath(); ctx.moveTo(lh.x,lh.y); ctx.lineTo(rh.x,rh.y); ctx.stroke();
//   ctx.strokeStyle = 'yellow'; ctx.beginPath(); ctx.moveTo(midShoulder.x,midShoulder.y);
//   ctx.lineTo(midHip.x,midHip.y); ctx.stroke();

//   // horizontal lines on midpoints
//   ctx.strokeStyle = 'blue'; ctx.lineWidth = 1;
//   ctx.beginPath(); ctx.moveTo(0, midShoulder.y); ctx.lineTo(canvas.width, midShoulder.y); ctx.stroke();
//   ctx.beginPath(); ctx.moveTo(0, midHip.y); ctx.lineTo(canvas.width, midHip.y); ctx.stroke();
//   // vertical line on midShoulder
//   ctx.beginPath(); ctx.moveTo(midShoulder.x, 0); ctx.lineTo(midShoulder.x, canvas.height); ctx.stroke();

//   // text
//   ctx.font = '20px Sans'; ctx.fillStyle = 'red';
//   const text = `Shoulder: ${shoulderTilt}°, Hip: ${hipTilt}°, Spine: ${spineTilt}°`;
//   ctx.fillText(text, 10, 30);

//   return {
//     angles: { shoulderTilt, hipTilt, spineTilt },
//     image: canvas.toBuffer('image/jpeg')
//   };
// }

// // Setup Express
// const app = express();
// const upload = multer();

// /**
//  * POST /angles
//  * body: multipart/form-data with 'image' file
//  * returns: JSON { angles }
//  */
// app.post('/angles', upload.single('image'), async (req, res) => {
//   try {
//     const result = await analyzeAndOverlay(req.file.buffer);
//     res.json({ angles: result.angles });
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

// /**
//  * POST /overlay
//  * body: multipart/form-data with 'image' file
//  * returns: JPEG image with overlays
//  */
// app.post('/overlay', upload.single('image'), async (req, res) => {
//   try {
//     const result = await analyzeAndOverlay(req.file.buffer);
//     res.set('Content-Type', 'image/jpeg');
//     res.send(result.image);
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

// module.exports = {
//   analyzePosture: analyzeAndOverlay
// };
// ai/posture-ai.js
// const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-backend-cpu');
// const poseDetection = require('@tensorflow-models/pose-detection');
// const { createCanvas, loadImage } = require('canvas');
// const { angleWithHorizontal, angleWithVertical } = require('../ai/helpers');

// let detector;
// async function getDetector() {
//   if (!detector) {
//     detector = await poseDetection.createDetector(
//       poseDetection.SupportedModels.BlazePose,
//       { runtime: 'tfjs', modelType: 'full', enableSmoothing: true }
//     );
//   }
//   return detector;
// }

// /**
//  * Rulează BlazePose și calculează unghiurile.
//  */
// async function analyzePosture(buffer) {
//   const img = await loadImage(buffer);
//   const canvas = createCanvas(img.width, img.height);
//   const ctx = canvas.getContext('2d');
//   ctx.drawImage(img, 0, 0);

//   const imgTensor = tf.browser.fromPixels(canvas);
//   const detector = await getDetector();
//   const poses = await detector.estimatePoses(imgTensor, { scoreThreshold: 0.3 });
//   imgTensor.dispose();

//   if (!poses.length || poses[0].keypoints.every(kp => kp.score < 0.3)) {
//     throw new Error('Incomplete keypoints for posture analysis');
//   }

//   const keypoints = poses[0].keypoints;
//   const mappedKeypoints = mapKeypointsToCamelCase(keypoints); // Aplicăm mapping-ul

//   const leftShoulder = mappedKeypoints.leftShoulder;
//   const rightShoulder = mappedKeypoints.rightShoulder;
//   const leftHip = mappedKeypoints.leftHip;
//   const rightHip = mappedKeypoints.rightHip;

//   if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
//     throw new Error('Missing keypoints for posture analysis');
//   }

//   const shoulderTilt = angleWithHorizontal(leftShoulder, rightShoulder);
//   const hipTilt = angleWithHorizontal(leftHip, rightHip);
//   const spineTilt = angleWithVertical(leftShoulder, leftHip);

//   return { angles: { shoulderTilt, hipTilt, spineTilt }, message: 'Success' };
// }

// /**
//  * Creează o imagine JPEG cu overlay: keypoints, segmente, axe, text.
//  * Returnează Buffer.
//  */
// async function annotateImage(buffer) {
//   const img = await loadImage(buffer);
//   const canvas = createCanvas(img.width, img.height);
//   const ctx = canvas.getContext('2d');
//   ctx.drawImage(img, 0, 0);

//   const imgTensor = tf.browser.fromPixels(canvas);
//   const detector = await getDetector();
//   const poses = await detector.estimatePoses(imgTensor, { scoreThreshold: 0.3 });
//   imgTensor.dispose();

//   if (!poses.length || poses[0].keypoints.every(kp => kp.score < 0.3)) {
//     throw new Error('Incomplete keypoints for annotation');
//   }

//   const keypoints = poses[0].keypoints;
//   console.log('[AI] Keypoints for annotation:', keypoints);

//   const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
//   const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');

//   if (!leftShoulder || !rightShoulder) {
//     throw new Error('Missing keypoints for annotation');
//   }

//   // Exemplu de desenare pe canvas
//   ctx.beginPath();
//   ctx.moveTo(leftShoulder.x, leftShoulder.y);
//   ctx.lineTo(rightShoulder.x, rightShoulder.y);
//   ctx.stroke();

//   return canvas.toBuffer();
// }

// /**
//  * Mapează keypoints de la BlazePose la nume în stil camelCase.
//  */
// function mapKeypointsToCamelCase(keypoints) {
//   const mapping = {
//     left_shoulder: 'leftShoulder',
//     right_shoulder: 'rightShoulder',
//     left_hip: 'leftHip',
//     right_hip: 'rightHip',
//     // Adaugă alte keypoints dacă este necesar
//   };

//   return keypoints.reduce((acc, kp) => {
//     const camelCaseName = mapping[kp.name] || kp.name; // Folosește mapping sau păstrează numele original
//     acc[camelCaseName] = kp;
//     return acc;
//   }, {});
// }

// module.exports = {
//   analyzePosture,
//   annotateImage,
//   mapKeypointsToCamelCase
// };
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

  const imgTensor = tf.browser.fromPixels(canvas);
  const det = await getDetector();
  const poses = await det.estimatePoses(imgTensor, { scoreThreshold: 0.3 });
  imgTensor.dispose();

  if (!poses.length || poses[0].keypoints.every(kp => kp.score < 0.3)) {
    throw new Error('Incomplete keypoints for posture analysis');
  }

  const keypoints = poses[0].keypoints;
  const mapped = mapKeypointsToCamelCase(keypoints);

  const ls = mapped.leftShoulder;
  const rs = mapped.rightShoulder;
  const lh = mapped.leftHip;
  const rh = mapped.rightHip;
  if (!ls || !rs || !lh || !rh) {
    throw new Error('Missing keypoints for posture analysis');
  }

  const shoulderTilt = angleWithHorizontal(ls, rs);
  const hipTilt = angleWithHorizontal(lh, rh);
  let rawSpineAngle = angleWithVertical(
    { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 },
    { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 }
  );
  const spineTilt = rawSpineAngle > 90 ? 180 - rawSpineAngle : rawSpineAngle;

  return { angles: { shoulderTilt, hipTilt, spineTilt }, message: 'Success' };
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
  const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };

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
  ctx.strokeStyle = 'red';
  ctx.beginPath(); ctx.moveTo(ls.x, ls.y); ctx.lineTo(rs.x, rs.y); ctx.stroke();
  ctx.strokeStyle = 'blue';
  ctx.beginPath(); ctx.moveTo(lh.x, lh.y); ctx.lineTo(rh.x, rh.y); ctx.stroke();
  ctx.strokeStyle = 'lime';
  ctx.beginPath(); ctx.moveTo(midShoulder.x, midShoulder.y); ctx.lineTo(midHip.x, midHip.y); ctx.stroke();

  // calcul unghi coloana (cel mai mic ≤ 90°)
  let rawSpineAngle = angleWithVertical(midShoulder, midHip);
  const spineTilt = rawSpineAngle > 90 ? 180 - rawSpineAngle : rawSpineAngle;

  return canvas.toBuffer('image/jpeg');
}

/**
 * Mapează keypoints de la BlazePose la camelCase.
 */
function mapKeypointsToCamelCase(keypoints) {
  const mapping = {
    left_shoulder: 'leftShoulder',
    right_shoulder: 'rightShoulder',
    left_hip: 'leftHip',
    right_hip: 'rightHip',
    // alte keypoints dacă e nevoie
  };
  return keypoints.reduce((acc, kp) => {
    const name = mapping[kp.name] || kp.name;
    acc[name] = kp;
    return acc;
  }, {});
}

module.exports = {
  analyzePosture,
  annotateImage,
  mapKeypointsToCamelCase
};
