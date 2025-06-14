const Student = require('../domain/entities/student');
const studentRepo = require('../repositories/student.repository');

class StudentService {
  async listStudents() {
    const rows = await studentRepo.findAll();
    return rows.map(r => new Student(r));
  }

  async getStudent(id) {
    const row = await studentRepo.findById(id);
    if (!row) throw new Error('Student not found');
    return new Student(row);
  }

  async addStudent(data) {
    const s = new Student(data);
    const created = await studentRepo.create(s);
    return new Student(created);
  }

  async updateStudent(id, data) {
    const s = new Student({ id, ...data });
    const updated = await studentRepo.update(id, s);
    return new Student(updated);
  }

  async deleteStudent(id) {
    await studentRepo.delete(id);
  }
}

module.exports = new StudentService();
