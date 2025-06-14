const Measurement = require('../domain/entities/measurement');
const repo = require('../repositories/measurement.repository');

class MeasurementService {
  async createMeasurement(data) {
    const m = new Measurement(data);
    return await repo.create(m);
  }

  async getMeasurementsByStudent(student_id) {
    return await repo.findByStudent(Number(student_id));
  }

  async updateMeasurement(id, data) {
    const m = new Measurement({ id: Number(id), ...data });
    return await repo.update(Number(id), m);
  }

  async deleteMeasurement(id) {
    return await repo.delete(Number(id));
  }
}

module.exports = new MeasurementService();
