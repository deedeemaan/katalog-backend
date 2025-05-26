const Session = require('../domain/entities/session');
const repo = require('../repositories/session.repository');

module.exports = {
  async createSession(data) {
    const s = new Session(data);
    return await repo.create(s);
  },

  async getSessionsByStudent(student_id) {
    return await repo.findByStudent(Number(student_id));
  },

  async updateSession(id, data) {
    const s = new Session({ id: Number(id), ...data });
    return await repo.update(Number(id), s);
  },

  async deleteSession(id) {
    return await repo.delete(Number(id));
  }
};
