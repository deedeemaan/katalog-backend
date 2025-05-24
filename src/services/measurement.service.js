const Measurement = require('../domain/entities/measurement');
const repo = require('../repositories/measurement.repository');

module.exports = {
  async createMeasurement(data) {
    const m = new Measurement(data);
    return await repo.create(m);
  },

  async getMeasurementsByStudent(studentId) {
    return await repo.findByStudent(Number(studentId));
  },

  async updateMeasurement(id, data) {
    const m = new Measurement({ id: Number(id), ...data });
    return await repo.update(Number(id), m);
  },

  async deleteMeasurement(id) {
    return await repo.delete(Number(id));
  }
};
