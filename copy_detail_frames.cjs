const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Faheem\\.gemini\\antigravity-ide\\brain\\78ac668b-f899-497d-a7df-e9452546214c';
const outDir = path.join(__dirname, 'share_sheet_frames');

for (let i of [200, 210, 220, 225, 230, 235, 240, 250, 260, 270, 280, 290]) {
  const frameName = `frame_${String(i).padStart(3, '0')}.png`;
  const src = path.join(outDir, frameName);
  const destName = `sharesheet_detail_kf_${String(i).padStart(3, '0')}.png`;
  const dest = path.join(artifactDir, destName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}
console.log('Copied detail frames');
