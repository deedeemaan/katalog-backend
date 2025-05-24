class Measurement {
  constructor({
    id = null,
    studentId, 
    height,
    weight,
    headCircumference = null, 
    chestCircumference = null, 
    abdominalCircumference = null,
    physicalDisability = '' 
  }) {
    if (typeof studentId !== 'number') throw new Error('studentId must be a number');
    if (typeof height !== 'number' || height < 0) throw new Error('height must be a non-negative number');
    if (typeof weight !== 'number' || weight < 0) throw new Error('weight must be a non-negative number');

    this.id = id;
    this.studentId = studentId;
    this.height = height;
    this.weight = weight;
    this.headCircumference = headCircumference;
    this.chestCircumference = chestCircumference;
    this.abdominalCircumference = abdominalCircumference;
    this.physicalDisability = physicalDisability;
  }
}

module.exports = Measurement;
