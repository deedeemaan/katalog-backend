module.exports = {
  type: 'object',
  properties: {
    student_id: { type: 'integer' },
    uri:        { type: 'string', format: 'uri' }
  },
  required: ['student_id','uri'],
  additionalProperties: false
};
