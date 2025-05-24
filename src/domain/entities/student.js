class Student {
  constructor({ id = null, name, age = null, condition = '', notes = '' }) {
    if (!name || !name.trim()) throw new Error("Student must have a name");
    this.id = id;
    this.name = name;
    this.age = age;
    this.condition = condition;
    this.notes = notes;
  }
}

module.exports = Student;
