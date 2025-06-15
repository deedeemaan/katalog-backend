const Student = require('../domain/entities/student');
const studentRepo = require('../repositories/student.repository');

class StudentService {
  /**
   * Obține lista tuturor studenților.
   * Trimite cererea către repository pentru a obține datele.
   * Transformă fiecare rând din baza de date într-o instanță a clasei `Student`.
   * @returns {Array} - Lista instanțelor de studenți.
   */
  async listStudents() {
    const rows = await studentRepo.findAll();
    return rows.map(r => new Student(r)); // Transformă fiecare rând într-un obiect `Student`
  }

  /**
   * Obține detaliile unui student specific.
   * Trimite ID-ul studentului către repository pentru a obține datele.
   * Transformă rândul obținut într-o instanță a clasei `Student`.
   * @param {number|string} id - ID-ul studentului.
   * @returns {Student} - Instanța studentului.
   * @throws {Error} - Dacă studentul nu este găsit.
   */
  async getStudent(id) {
    const row = await studentRepo.findById(id);
    if (!row) throw new Error('Student not found'); // Aruncă eroare dacă studentul nu există
    return new Student(row); // Transformă rândul într-un obiect `Student`
  }

  /**
   * Adaugă un nou student.
   * Validează datele și creează o instanță a clasei `Student`.
   * Trimite studentul către repository pentru a fi salvat în baza de date.
   * Transformă rezultatul într-o instanță a clasei `Student`.
   * @param {Object} data - Obiectul studentului (conține name, age, condition, notes).
   * @returns {Student} - Instanța studentului creat.
   */
  async addStudent(data) {
    const s = new Student(data); // Creează o instanță validată a studentului
    const created = await studentRepo.create(s); // Salvează studentul în baza de date
    return new Student(created); // Transformă rezultatul într-un obiect `Student`
  }

  /**
   * Actualizează un student existent.
   * Validează datele și creează o instanță a clasei `Student` cu datele actualizate.
   * Trimite studentul către repository pentru a fi actualizat în baza de date.
   * Transformă rezultatul într-o instanță a clasei `Student`.
   * @param {number|string} id - ID-ul studentului.
   * @param {Object} data - Obiectul studentului actualizat (conține name, age, condition, notes).
   * @returns {Student} - Instanța studentului actualizat.
   */
  async updateStudent(id, data) {
    const s = new Student({ id, ...data }); // Creează o instanță validată cu datele actualizate
    const updated = await studentRepo.update(id, s); // Actualizează studentul în baza de date
    return new Student(updated); // Transformă rezultatul într-un obiect `Student`
  }

  /**
   * Șterge un student existent.
   * Trimite ID-ul studentului către repository pentru a fi șters din baza de date.
   * @param {number|string} id - ID-ul studentului.
   * @returns {void}
   */
  async deleteStudent(id) {
    await studentRepo.delete(id); // Șterge studentul din baza de date
  }
}

module.exports = new StudentService();
