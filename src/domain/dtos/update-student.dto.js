module.exports = {
  type: 'object',
  properties: {
    name:      { type: 'string', minLength: 1 },
    age:       { type: 'integer', minimum: 0 },
    condition: { type: 'string' },
    notes:     { type: 'string' }
  },
  additionalProperties: false
};
