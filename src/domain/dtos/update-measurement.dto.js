module.exports = {
  type: 'object',
  properties: {
    height:                { type: 'integer', minimum: 0 },
    weight:                { type: 'integer', minimum: 0 },
    headCircumference:    { type: 'integer', minimum: 0 },
    chestCircumference:   { type: 'integer', minimum: 0 },
    abdominalCircumference:{ type: 'integer', minimum: 0 },
    physicalDisability:   { type: 'string' }
  },
  additionalProperties: false
};
