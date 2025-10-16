const sharp = require('sharp');
const fs = require('fs');

async function main() {
  console.log('Creating WebP versions...\n');

  const images = [
    { input: 'images/skins/WL.jpg', output: 'images/skins/WL.webp' },
    { input: 'images/skins/IBS.jpg', output: 'images/skins/IBS.webp' },
    { input: 'images/skins/blood-pressure.jpg', output: 'images/skins/blood-pressure.webp' },
    { input: 'images/skins/DM2.jpg', output: 'images/skins/DM2.webp' }
  ];

  let totalInputSize = 0;
  let totalOutputSize = 0;

  for (const {input, output} of images) {
    const inputSize = fs.statSync(input).size;
    const info = await sharp(input).webp({ quality: 80 }).toFile(output);
    totalInputSize += inputSize;
    totalOutputSize += info.size;
    const reduction = ((1 - info.size / inputSize) * 100).toFixed(1);
    console.log('OK: ' + input + ' -> ' + output + ' (' + reduction + '% smaller)');
  }

  console.log('\n---');
  console.log('Compressing large images...\n');

  const largeImages = [
    { input: 'images/skins/65587.jpg', output: 'images/skins/65587-opt.jpg', quality: 70 },
    { input: 'images/abundance-agriculture-bananas-batch-264537.jpg', output: 'images/abundance-agriculture-bananas-batch-264537-opt.jpg', quality: 75 }
  ];

  for (const {input, output, quality} of largeImages) {
    if (fs.existsSync(input)) {
      const inputSize = fs.statSync(input).size;
      const info = await sharp(input).jpeg({ quality, mozjpeg: true }).toFile(output);
      totalInputSize += inputSize;
      totalOutputSize += info.size;
      const reduction = ((1 - info.size / inputSize) * 100).toFixed(1);
      console.log('OK: ' + input + ' compressed (' + reduction + '% smaller)');
    }
  }

  const totalSavedMB = ((totalInputSize - totalOutputSize) / 1024 / 1024).toFixed(2);
  console.log('\nTotal saved: ' + totalSavedMB + ' MB');
}

main();
