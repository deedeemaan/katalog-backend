// test/ModelAI.js
const fs = require('fs').promises;
const path = require('path');
const PostureAI = require('./src/ai/posture-ai');

class ModelAI {
  constructor(inputDir = 'test_images', outputDir = 'test_result') {
    this.inputDir = inputDir;
    this.outputDir = outputDir;
    this.metrics = {
      front: [],
      side: [],
      back: []
    };
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir);
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
  }


  async run() {
    await this.ensureOutputDir();
    const files = await fs.readdir(this.inputDir);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

      const buffer = await fs.readFile(path.join(this.inputDir, file));
      let result;
      try {
        result = await PostureAI.analyzePosture(buffer);
      } catch (err) {
        console.warn(`⚠️  Skipping ${file}: ${err.message}`);
        continue;
      }

      const { angles, position } = result;
      if (!this.metrics[position]) {
        this.metrics[position] = [];
      }
      this.metrics[position].push(angles);

      // Annotate and save
      let annotated;
      try {
        annotated = await PostureAI.annotateImage(buffer);
      } catch (err) {
        console.warn(`⚠️  Nu am putut annota ${file}: ${err.message}`);
        continue;
      }
      const outPath = path.join(this.outputDir, `${position}_${file}`);
      await fs.writeFile(outPath, annotated);
      console.log(`✅  Procesat ${file} → ${position}, salvat la ${outPath}`);
    }

    // calculează mediile
    const summary = {};
    for (const [pos, arr] of Object.entries(this.metrics)) {
      if (arr.length === 0) continue;
      const sums = arr.reduce((acc, cur) => {
        acc.shoulderTilt += cur.shoulderTilt;
        acc.hipTilt     += cur.hipTilt;
        acc.spineTilt   += cur.spineTilt;
        return acc;
      }, { shoulderTilt: 0, hipTilt: 0, spineTilt: 0 });
      summary[pos] = {
        shoulderTilt: +(sums.shoulderTilt / arr.length).toFixed(2),
        hipTilt:      +(sums.hipTilt     / arr.length).toFixed(2),
        spineTilt:    +(sums.spineTilt   / arr.length).toFixed(2),
        count:        arr.length
      };
    }

    const summaryPath = path.join(this.outputDir, 'summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`\n📊 Media unghiurilor per poziție scrisă în ${summaryPath}`);
  }
}

(async () => {
  try {
    const runner = new ModelAI();
    await runner.run();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
