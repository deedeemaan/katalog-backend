let detectorInstance = null;
const poseDetection = require('@tensorflow-models/pose-detection');

/**
 * @param {{x:number,y:number}} p1 
 * @param {{x:number,y:number}} p2 
 * @returns {number} unghiul acut ∈ [0°, 90°] dintre linia (p1→p2) și ORIZONTALĂ (+X)
 */
function angleWithHorizontal(p1, p2) {
  if (!p1 || !p2) {
    throw new Error('Invalid points for angle calculation');
  }
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  // 1) raw ∈ [0..180] este unghiul față de axa +X
  let raw = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
  // 2) reduci la unghi acut ∈ [0..90]
  return raw <= 90 ? raw : (180 - raw);
}

/**
 * @param {{x:number,y:number}} a 
 * @param {{x:number,y:number}} b 
 * @returns {number} unghiul acut ∈ [0°, 90°] dintre linia (a→b) și VERTICALĂ (+Y)
 */
function angleWithVertical(a, b) {
  if (!a || !b) {
    throw new Error('Invalid points for angle calculation');
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // 1) raw ∈ [0..180] este unghiul față de axa +Y (prin inverse în atan2)
  let raw = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
  // 2) reduci la unghi acut ∈ [0..90]
  return raw <= 90 ? raw : (180 - raw);
}

/**
 * Calculează unghiul A–B–C, cu vârf în B, în grade ∈ [0°, 180°].
 * Îl putem folosi direct pentru o flexie la șold sau genunchi.
 * @param {{x:number,y:number}} A 
 * @param {{x:number,y:number}} B 
 * @param {{x:number,y:number}} C 
 * @returns {number|null} unghiul ∈ [0..180] sau null dacă unuia dintre segmente îi iese magnitudinea zero
 */
function angleAtJoint(A, B, C) {
  if (!A || !B || !C) {
    throw new Error('Invalid points for angle calculation');
  }
  const v1x = A.x - B.x, v1y = A.y - B.y;
  const v2x = C.x - B.x, v2y = C.y - B.y;
  const dot  = v1x * v2x + v1y * v2y;
  const mag1 = Math.hypot(v1x, v1y);
  const mag2 = Math.hypot(v2x, v2y);
  if (mag1 === 0 || mag2 === 0) {
    return null;
  }
  let cosTheta = dot / (mag1 * mag2);
  // clamp pentru siguranță împotriva erorilor FP
  cosTheta = Math.max(-1, Math.min(1, cosTheta));
  const angleRad = Math.acos(cosTheta);
  return angleRad * (180 / Math.PI); // ∈ [0..180]
}

/**
 * Identifică poziția generală („front”, „back”, „side” sau „unknown”) 
 * pe baza alinierii umerilor / șoldurilor (toate cele patru keypoints trebuie să fie vizibile).
 */
function determinePosition(keypoints) {
  const leftShoulder  = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const leftHip       = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip      = keypoints.find(kp => kp.name === 'right_hip');

  // Verifică dacă punctele sunt vizibile (scor > 0.5)
  const leftVisible    = leftShoulder  && leftShoulder.score  > 0.5;
  const rightVisible   = rightShoulder && rightShoulder.score > 0.5;
  const leftHipVisible = leftHip       && leftHip.score       > 0.5;
  const rightHipVisible= rightHip      && rightHip.score      > 0.5;

  // Calculează unghiurile doar dacă punctele sunt vizibile
  const shoulderAngle = (leftVisible && rightVisible)
    ? angleWithHorizontal(leftShoulder, rightShoulder)
    : null;

  const hipAngle = (leftHipVisible && rightHipVisible)
    ? angleWithHorizontal(leftHip, rightHip)
    : null;

  // Determină poziția
  if (leftVisible && rightVisible && leftHipVisible && rightHipVisible) {
    // Dacă umerii și șoldurile sunt aproape perfect orizontale (unghi aproape 0)
    if (shoulderAngle !== null && hipAngle !== null
        && Math.abs(shoulderAngle) < 15 && Math.abs(hipAngle) < 15) {
      return 'front';
    }
    // Altfel, dacă sunt vizibile, dar nu orizontale, considerăm „back”
    if (shoulderAngle !== null && hipAngle !== null
        && (Math.abs(shoulderAngle) >= 10 || Math.abs(hipAngle) >= 10)) {
      return 'back';
    }
  } else if (leftVisible || rightVisible) {
    // Dacă doar o parte (umeri sau șold) e vizibilă, considerăm „side”
    return 'side';
  }

  // În rest, nu putem determina cu certitudine
  return 'unknown';
}

/**
 * Calculează unghiurile principale când poziția e „laterală”.
 * - shoulderTilt: înclinarea trunchiului (umăr–șold) față de verticală în [0..90]
 * - hipTilt: unghiul de flexie la șold (umeri–șold–genunchi) în [0..180]
 */
function calculateLateralAngles(keypoints) {
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const leftHip      = keypoints.find(kp => kp.name === 'left_hip');
  const leftKnee     = keypoints.find(kp => kp.name === 'left_knee');

  if (!leftShoulder || !leftHip || !leftKnee) {
    throw new Error('Missing keypoints for lateral angle calculation');
  }

  // 1) Înclinarea trunchiului (umăr → șold) față de verticală
  const shoulderTilt = angleWithVertical(leftShoulder, leftHip);

  // 2) Unghi de flexie la șold: A=umăr, B=șold, C=genunchi
  const hipAngleFull = angleAtJoint(leftShoulder, leftHip, leftKnee);
  // Dacă vrei unghiul acut de flexie ≤ 90°, poți face:
  const hipTilt = (hipAngleFull !== null)
    ? (hipAngleFull <= 90 ? hipAngleFull : (180 - hipAngleFull))
    : null;

  return {
    shoulderTilt,
    hipTilt,
    spineTilt: shoulderTilt  // în poziție laterală, „spineTilt” e același cu „shoulderTilt”
  };
}

/**
 * Calculează unghiurile principale când poziția e „front”.
 * (Păstrăm neschimbate, așa cum ți-ai dorit.)
 */
function calculateFrontAngles(keypoints) {
  const leftShoulder  = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const leftHip       = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip      = keypoints.find(kp => kp.name === 'right_hip');

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    throw new Error('Missing keypoints for front angle calculation');
  }

  // Midpoints
  const midShoulder = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };
  const midHip = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };

  // Unghiul umerilor față de orizontală
  const shoulderTilt = angleWithHorizontal(leftShoulder, rightShoulder);

  // Unghiul șoldurilor față de orizontală
  const hipTilt = angleWithHorizontal(leftHip, rightHip);

  // Unghiul coloanei vertebrale față de verticală
  const spineTilt = angleWithVertical(midShoulder, midHip);

  return {
    shoulderTilt,
    hipTilt,
    spineTilt
  };
}

/**
 * Calculează unghiurile principale când poziția e „back”.
 * (Păstrăm neschimbate, așa cum ți-ai dorit.)
 */
function calculateBackAngles(keypoints) {
  const leftShoulder  = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const leftHip       = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip      = keypoints.find(kp => kp.name === 'right_hip');

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    throw new Error('Missing keypoints for back angle calculation');
  }

  // Unghiul umerilor față de orizontală
  const shoulderTilt = angleWithHorizontal(leftShoulder, rightShoulder);

  // Unghiul șoldurilor față de orizontală
  const hipTilt = angleWithHorizontal(leftHip, rightHip);

  // Unghiul coloanei vertebrale față de verticală
  const spineTilt = angleWithVertical(
    { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
    { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
  );

  return {
    shoulderTilt,
    hipTilt,
    spineTilt
  };
}

module.exports = {
  angleWithHorizontal,
  angleWithVertical,
  angleAtJoint,
  determinePosition,
  calculateLateralAngles,
  calculateFrontAngles,
  calculateBackAngles
};
