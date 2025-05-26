module.exports = {
  type: 'object',
  properties: {
    photo_id:      { type: 'integer' },
    shoulder_tilt: { type: 'number' },
    hip_tilt:      { type: 'number' },
    spine_tilt:    { type: 'number' }
  },
  required: ['photo_id','shoulder_tilt','hip_tilt','spine_tilt'],
  additionalProperties: false
};
