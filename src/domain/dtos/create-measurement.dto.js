module.exports = {
  type: 'object',
  properties: {
    student_id:             { type: 'integer' },
    height:                { type: 'integer', minimum: 0 },
    weight:                { type: 'integer', minimum: 0 },
    head_circumference:     { type: 'integer', minimum: 0 },
    chest_circumference:    { type: 'integer', minimum: 0 },
    abdominal_circumference:{ type: 'integer', minimum: 0 },
    physical_disability:    { type: 'string' }
  },
  required: ['student_id', 'height', 'weight'],
  additionalProperties: false
};
