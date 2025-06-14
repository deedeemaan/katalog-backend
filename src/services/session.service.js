const Session = require('../domain/entities/session');
const repo = require('../repositories/session.repository');

class SessionService {
  async createSession(data) {
    const s = new Session(data);
    return await repo.create(s);
  }

  async getSessionsByStudent(student_id) {
    return await repo.findByStudent(Number(student_id));
  }

  async updateSession(id, data) {
    const s = new Session({ id: Number(id), ...data });
    if (isNaN(s.student_id)) {
      throw new Error('Invalid student_id: must be a number');
    }
    console.log('Service data:', data);
    return await repo.update(Number(id), s);
  }

  async deleteSession(id) {
    return await repo.delete(Number(id));
  }
}

module.exports = new SessionService();
