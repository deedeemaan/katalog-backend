const poseDetection = require('@tensorflow-models/pose-detection');

class PoseHelpers {

  /**
   * Calculează unghiul dintre linia definită de două puncte și orizontală.
   * @param {Object} p1 - Primul punct (cu proprietăți x și y).
   * @param {Object} p2 - Al doilea punct (cu proprietăți x și y).
   * @returns {number} - Unghiul în grade (între 0 și 90).
   */
  static angleWithHorizontal(p1, p2) {
    if (!p1 || !p2) {
      throw new Error('Invalid points for angle calculation');
    }
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    let raw = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
    return raw <= 90 ? raw : (180 - raw);
  }

  /**
   * Calculează unghiul dintre linia definită de două puncte și verticala.
   * @param {Object} a - Primul punct (cu proprietăți x și y).
   * @param {Object} b - Al doilea punct (cu proprietăți x și y).
   * @returns {number} - Unghiul în grade (între 0 și 90).
   */
  static angleWithVertical(a, b) {
    if (!a || !b) {
      throw new Error('Invalid points for angle calculation');
    }
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    let raw = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
    return raw <= 90 ? raw : (180 - raw);
  }

  /**
   * Calculează unghiul format la o articulație definită de trei puncte.
   * @param {Object} A - Primul punct (cu proprietăți x și y).
   * @param {Object} B - Punctul central (articulația).
   * @param {Object} C - Al treilea punct (cu proprietăți x și y).
   * @returns {number|null} - Unghiul în grade (între 0 și 180) sau null dacă magnitudinea este zero.
   */
  static angleAtJoint(A, B, C) {
    if (!A || !B || !C) {
      throw new Error('Invalid points for angle calculation');
    }
    const v1x = A.x - B.x, v1y = A.y - B.y;
    const v2x = C.x - B.x, v2y = C.y - B.y;
    const dot = v1x * v2x + v1y * v2y;
    const mag1 = Math.hypot(v1x, v1y);
    const mag2 = Math.hypot(v2x, v2y);
    if (mag1 === 0 || mag2 === 0) {
      return null;
    }
    let cosTheta = dot / (mag1 * mag2);
    cosTheta = Math.max(-1, Math.min(1, cosTheta));
    const angleRad = Math.acos(cosTheta);
    return angleRad * (180 / Math.PI);
  }

  /**
   * Determină poziția generală a corpului (front, back, side, unknown) pe baza punctelor cheie.
   * @param {Array} keypoints - Lista punctelor cheie detectate.
   * @returns {string} - Poziția detectată: 'front', 'back', 'side', sau 'unknown'.
   */
  static determinePosition(keypoints) {
    // 1. Extrage punctele cu scor > 0.5
    const ls = keypoints.find(kp => kp.name === 'left_shoulder' && kp.score > 0.5);
    const rs = keypoints.find(kp => kp.name === 'right_shoulder' && kp.score > 0.5);
    const lh = keypoints.find(kp => kp.name === 'left_hip' && kp.score > 0.5);
    const rh = keypoints.find(kp => kp.name === 'right_hip' && kp.score > 0.5);
    const le = keypoints.find(kp => kp.name === 'left_eye' && kp.score > 0.5);
    const re = keypoints.find(kp => kp.name === 'right_eye' && kp.score > 0.5);
    const la = keypoints.find(kp => kp.name === 'left_ear' && kp.score > 0.5);
    const ra = keypoints.find(kp => kp.name === 'right_ear' && kp.score > 0.5);
    const no = keypoints.find(kp => kp.name === 'nose' && kp.score > 0.5);
    const ml = keypoints.find(kp => kp.name === 'mouth_left' && kp.score > 0.5);
    const mr = keypoints.find(kp => kp.name === 'mouth_right' && kp.score > 0.5);

    // 2. Fallback dacă nu avem umeri+șolduri
    if (!ls || !rs || !lh || !rh) {
      return 'unknown';
    }

    // 3. Heuristică SIDE (profil)
    const faceProfile = (le && !re) || (!le && re) || (la && !ra) || (!la && ra);
    const dxShoulders = Math.abs(ls.x - rs.x);
    const shoulderXThreshold = 50;
    const shouldersTooClose = dxShoulders < shoulderXThreshold;
    if (faceProfile || shouldersTooClose) {
      return 'side';
    }
    
    // 3. Heuristică FRONT/BACK (unghiurile pentru back sunt tratate ca cele pentru front)
    if (le && re && la && ra && no && ml && mr) {
        return 'front';
    }

    // 6. Fallback general
    return 'unknown';
  }

  /**
   * Calculează unghiurile pentru poziția laterală (side).
   * @param {Array} keypoints - Lista punctelor cheie detectate.
   * @returns {Object} - Unghiurile calculate: shoulderTilt, hipTilt, spineTilt.
   */
  static calculateLateralAngles(keypoints) {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const leftKnee = keypoints.find(kp => kp.name === 'left_knee');

    if (!leftShoulder || !leftHip || !leftKnee) {
      throw new Error('Missing keypoints for lateral angle calculation');
    }

    const shoulderTilt = PoseHelpers.angleWithVertical(leftShoulder, leftHip);
    const hipAngleFull = PoseHelpers.angleAtJoint(leftShoulder, leftHip, leftKnee);
    const hipTilt = (hipAngleFull !== null)
      ? (hipAngleFull <= 90 ? hipAngleFull : (180 - hipAngleFull))
      : null;

    return {
      shoulderTilt,
      hipTilt,
      spineTilt: shoulderTilt
    };
  }

  /**
   * Calculează unghiurile pentru pozițiile frontale și dorsale (front/back).
   * @param {Array} keypoints - Lista punctelor cheie detectate.
   * @returns {Object} - Unghiurile calculate: shoulderTilt, hipTilt, spineTilt.
   */
  static calculateFrontAndBackAngles(keypoints) {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const rightHip = keypoints.find(kp => kp.name === 'right_hip');

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      throw new Error('Missing keypoints for front angle calculation');
    }

    const midShoulder = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };

    const shoulderTilt = PoseHelpers.angleWithHorizontal(leftShoulder, rightShoulder);
    const hipTilt = PoseHelpers.angleWithHorizontal(leftHip, rightHip);
    const spineTilt = PoseHelpers.angleWithVertical(midShoulder, midHip);

    return {
      shoulderTilt,
      hipTilt,
      spineTilt
    };
  }
}

module.exports = PoseHelpers;
