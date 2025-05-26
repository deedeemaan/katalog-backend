class Measurement {
  constructor({
    id = null,
    student_id, 
    height,
    weight,
    head_circumference = null, 
    chest_circumference = null, 
    abdominal_circumference = null,
    physical_disability = '' 
  }) {
    if (typeof student_id !== 'number') throw new Error('student_id must be a number');
    if (typeof height !== 'number' || height < 0) throw new Error('height must be a non-negative number');
    if (typeof weight !== 'number' || weight < 0) throw new Error('weight must be a non-negative number');

    this.id = id;
    this.student_id = student_id;
    this.height = height;
    this.weight = weight;
    this.head_circumference = head_circumference;
    this.chest_circumference = chest_circumference;
    this.abdominal_circumference = abdominal_circumference;
    this.physical_disability = physical_disability;
  }
}

module.exports = Measurement;
