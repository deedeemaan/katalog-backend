// const fs = require('fs');
// const path = require('path');
// const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-backend-cpu');
// const poseDetection = require('@tensorflow-models/pose-detection');
// const { createCanvas, loadImage } = require('canvas');

// async function drawKeypointsOnImage(inputPath, outputPath) {
//     const img = await loadImage(inputPath);
//     const canvas = createCanvas(img.width, img.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0);

//     await tf.setBackend('cpu');
//     const imgTensor = tf.browser.fromPixels(canvas);
//     const detector = await poseDetection.createDetector(
//         poseDetection.SupportedModels.BlazePose,
//         { runtime: 'tfjs', modelType: 'full', enableSmoothing: true }
//     );
//     const poses = await detector.estimatePoses(imgTensor);
//     imgTensor.dispose();

//     if (poses.length) {
//         const kp = poses[0].keypoints;
//         // Desenează puncte
//         ctx.fillStyle = 'red';
//         kp.forEach(p => {
//             if (p.score > 0.3) {
//                 ctx.beginPath();
//                 ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
//                 ctx.fill();
//             }
//         });
//         // Desenează legături simple (ex.: umăr → cot)
//         const connections = [
//             ['left_shoulder', 'left_elbow'],
//             ['right_shoulder', 'right_elbow'],
//             ['left_hip', 'left_knee'],
//             ['right_hip', 'right_knee'],
//             ['left_shoulder', 'right_shoulder'],  // linie între umeri
//             ['left_hip', 'right_hip']
//             // … adaugă după nevoie
//         ];
//         ctx.strokeStyle = 'lime';
//         ctx.lineWidth = 2;
//         const K = {};
//         kp.forEach(p => K[p.name] = p);

//         const LS = K['left_shoulder'], RS = K['right_shoulder'];
//         const LH = K['left_hip'], RH = K['right_hip'];
//         if (LS.score > 0.3 && RS.score > 0.3 && LH.score > 0.3 && RH.score > 0.3) {
//             // calculează mijloacele
//             const midShoulder = {
//                 x: (LS.x + RS.x) / 2,
//                 y: (LS.y + RS.y) / 2
//             };
//             const midHip = {
//                 x: (LH.x + RH.x) / 2,
//                 y: (LH.y + RH.y) / 2
//             };

//             // desenează linia coloanei
//             ctx.strokeStyle = 'blue';    // poți alege ce culoare vrei
//             ctx.lineWidth = 3;
//             ctx.beginPath();
//             ctx.moveTo(midShoulder.x, midShoulder.y);
//             ctx.lineTo(midHip.x, midHip.y);
//             ctx.stroke();

//             // opțional: marchează și punctele medii
//             ctx.fillStyle = 'blue';
//             [midShoulder, midHip].forEach(p => {
//                 ctx.beginPath();
//                 ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
//                 ctx.fill();
//             });

//             // Calculează unghiul față de orizontală (axa X)
//             const dx = midHip.x - midShoulder.x;
//             const dy = midHip.y - midShoulder.y;
//             const angleRad = Math.atan2(dy, dx); // unghi față de orizontală
//             const angleDeg = (angleRad * 180) / Math.PI;

//             // Calculează unghiul față de verticală (axa Y)
//             const angleToVertical = 90 - Math.abs(angleDeg);

//             // Afișează unghiul pe imagine
//             ctx.fillStyle = 'black';
//             ctx.font = '20px Arial';
//             ctx.fillText(
//                 `Orizontală: ${angleDeg.toFixed(1)}°`,
//                 (midShoulder.x + midHip.x) / 2 + 10,
//                 (midShoulder.y + midHip.y) / 2 - 10
//             );
//             ctx.fillText(
//                 `Verticală: ${angleToVertical.toFixed(1)}°`,
//                 (midShoulder.x + midHip.x) / 2 + 10,
//                 (midShoulder.y + midHip.y) / 2 + 15
//             );
//         }

//         connections.forEach(([a, b]) => {
//             if (K[a].score > 0.3 && K[b].score > 0.3) {
//                 ctx.beginPath();
//                 ctx.moveTo(K[a].x, K[a].y);
//                 ctx.lineTo(K[b].x, K[b].y);
//                 ctx.stroke();
//             }
//         });
//     }

//     // Scrie fișierul rezultat
//     const out = fs.createWriteStream(outputPath);
//     const stream = canvas.createJPEGStream({ quality: 0.8, progressive: true });
//     stream.pipe(out);
//     await new Promise(r => out.on('finish', r));
//     console.log(`Saved overlay to ${outputPath}`);
// }

// // Rulează pentru toate imaginile din ./test_images/
// (async () => {
//     const inDir = path.join(__dirname, 'test_images');
//     const outDir = path.join(__dirname, 'test_results');
//     if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
//     for (const imgName of fs.readdirSync(inDir)) {
//         const inPath = path.join(inDir, imgName);
//         const outPath = path.join(outDir, imgName);
//         await drawKeypointsOnImage(inPath, outPath);
//     }
// })();

const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const poseDetection = require('@tensorflow-models/pose-detection');
const { createCanvas, loadImage } = require('canvas');

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

function angleWithHorizontal(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const radians = Math.atan2(dy, dx);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 90) angle = 180 - angle;
  return angle;
}

function angleWithVertical(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const radians = Math.atan2(dx, dy);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 90) angle = 180 - angle;
  return angle;
}

async function processImage(inputPath, outputPath) {
  const buffer = fs.readFileSync(inputPath);
  const img = await loadImage(buffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);

  await tf.setBackend('cpu');
  const imgTensor = tf.browser.fromPixels(canvas);
  const det = await getDetector();
  const poses = await det.estimatePoses(imgTensor);
  imgTensor.dispose();

  if (!poses.length) {
    console.warn(`${path.basename(inputPath)}: No pose detected`);
  } else {
    const kp = poses[0].keypoints.reduce((acc, p) => (acc[p.name] = p, acc), {});
    const req = ['left_shoulder','right_shoulder','left_hip','right_hip'];
    if (req.some(name => !kp[name])) {
      console.warn(`${path.basename(inputPath)}: Missing keypoints`);
    } else {
      const ls = kp.left_shoulder, rs = kp.right_shoulder;
      const lh = kp.left_hip,     rh = kp.right_hip;
      const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
      const midHip      = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
      const shoulderTilt = angleWithHorizontal(ls, rs).toFixed(1);
      const hipTilt      = angleWithHorizontal(lh, rh).toFixed(1);
      const spineTilt    = angleWithVertical(midShoulder, midHip).toFixed(1);

      // Draw keypoints and segments
      ctx.fillStyle = 'lime';
      [ls, rs, lh, rh].forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI); ctx.fill();
      });
      ctx.strokeStyle = 'lime'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ls.x, ls.y); ctx.lineTo(rs.x, rs.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lh.x, lh.y); ctx.lineTo(rh.x, rh.y); ctx.stroke();

      // Draw spine segment
      ctx.strokeStyle = 'yellow'; ctx.beginPath();
      ctx.moveTo(midShoulder.x, midShoulder.y);
      ctx.lineTo(midHip.x, midHip.y);
      ctx.stroke();

      // Draw horizontal lines through midpoints of shoulder and hip
      ctx.strokeStyle = 'blue'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, midShoulder.y); ctx.lineTo(canvas.width, midShoulder.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, midHip.y); ctx.lineTo(canvas.width, midHip.y); ctx.stroke();

      // Draw a single vertical line through midShoulder
      ctx.strokeStyle = 'blue'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(midShoulder.x, 0); ctx.lineTo(midShoulder.x, canvas.height); ctx.stroke();

      // Draw text overlay
      ctx.font = '20px Sans'; ctx.fillStyle = 'red';
      const text = `Shoulder: ${shoulderTilt}°, Hip: ${hipTilt}°, Spine: ${spineTilt}°`;
      ctx.fillText(text, 10, 30);

      console.log(`${path.basename(inputPath)}: shoulder=${shoulderTilt}°, hip=${hipTilt}°, spine=${spineTilt}°`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, canvas.toBuffer('image/jpeg'));
}

async function main() {
  const inputDir = path.join(__dirname, 'test_images');
  const outputDir = path.join(__dirname, 'test_result');
  const files = fs.readdirSync(inputDir).filter(f => /\.(jpe?g|png)$/i.test(f));
  for (const file of files) {
    try { await processImage(path.join(inputDir, file), path.join(outputDir, file)); }
    catch (e) { console.error(`Failed ${file}:`, e); }
  }
  console.log('Done. Results in', outputDir);
}

main().catch(console.error);
