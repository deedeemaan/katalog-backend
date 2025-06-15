const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const poseDetection = require('@tensorflow-models/pose-detection');
const { createCanvas, loadImage } = require('canvas');
const { calculateLateralAngles, calculateFrontAndBackAngles, determinePosition } = require('../ai/helpers');

class PostureAI {
  constructor() {
    // Detectorul de postură va fi inițializat doar o dată
    this.detector = null;
  }

  /**
   * Creează și returnează detectorul BlazePose pentru estimarea posturii.
   * Folosește modelul complet cu netezire activată.
   * @returns {Object} - Instanța detectorului BlazePose.
   */
  async getDetector() {
    if (!this.detector) {
      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        { runtime: 'tfjs', modelType: 'full', enableSmoothing: true }
      );
    }
    return this.detector;
  }

  /**
   * Analizează postura corpului dintr-o imagine.
   * Detectează punctele cheie și determină poziția corpului (front, back, side).
   * Calculează unghiurile relevante pe baza poziției detectate.
   * @param {Buffer} buffer - Buffer-ul imaginii.
   * @returns {Object} - Unghiurile calculate, poziția detectată și un mesaj de succes.
   */
  async analyzePosture(buffer) {
    const img = await loadImage(buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const detector = await this.getDetector();
    const poses = await detector.estimatePoses(canvas);

    // Verifică dacă există puncte cheie valide
    if (!poses.length || poses[0].keypoints.every(kp => kp.score < 0.5)) {
      throw new Error('No valid poses detected');
    }

    const keypoints = poses[0].keypoints;

    // Determină poziția corpului
    const position = determinePosition(keypoints);
    console.log('[AI] Detected position:', position);

    if (position === 'unknown') {
      throw new Error('Unable to determine body position');
    }

    // Calculează unghiurile pe baza poziției detectate
    let angles;
    if (position === 'side') {
      angles = calculateLateralAngles(keypoints);
    } else if (position === 'front') {
      angles = calculateFrontAndBackAngles(keypoints);
    }

    console.log('[AI] Angles calculated:', angles);
    return { angles, position, message: 'Success' };
  }

  /**
   * Adaugă puncte și linii pe imagine pentru a vizualiza postura corpului.
   * Desenează punctele cheie și liniile dintre umeri și șolduri.
   * @param {Buffer} buffer - Buffer-ul imaginii.
   * @returns {Buffer} - Imaginea modificată cu punctele și liniile desenate.
   */
  async annotateImage(buffer) {
    const img = await loadImage(buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgTensor = tf.browser.fromPixels(canvas);
    const detector = await this.getDetector();
    const poses = await detector.estimatePoses(imgTensor, { scoreThreshold: 0.5 });
    imgTensor.dispose();

    // Verifică dacă există puncte cheie valide
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

    // Calcularea punctelor intermediare
    const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
    const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };

    // Funcție pentru desenarea punctelor
    function drawPoint(p, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Desenează punctele cheie
    drawPoint(ls, 'red');
    drawPoint(rs, 'red');
    drawPoint(lh, 'blue');
    drawPoint(rh, 'blue');
    drawPoint(midShoulder, 'lime');
    drawPoint(midHip, 'lime');

    // Desenează liniile dintre puncte
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'red'; ctx.beginPath(); ctx.moveTo(ls.x, ls.y); ctx.lineTo(rs.x, rs.y); ctx.stroke();
    ctx.strokeStyle = 'blue'; ctx.beginPath(); ctx.moveTo(lh.x, lh.y); ctx.lineTo(rh.x, rh.y); ctx.stroke();
    ctx.strokeStyle = 'lime'; ctx.beginPath(); ctx.moveTo(midShoulder.x, midShoulder.y); ctx.lineTo(midHip.x, midHip.y); ctx.stroke();

    return canvas.toBuffer('image/jpeg');
  }
}

module.exports = new PostureAI();
