module.exports = {
  type: 'object',
  properties: {
    photoId:      { type: 'integer' },
    shoulderTilt: { type: 'number' },
    hipTilt:      { type: 'number' },
    spineTilt:    { type: 'number' }
  },
  required: ['photoId','shoulderTilt','hipTilt','spineTilt'],
  additionalProperties: false
};
