const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Faheem\\.gemini\\antigravity-ide\\brain\\78ac668b-f899-497d-a7df-e9452546214c';
const outDir = path.join(__dirname, 'share_sheet_frames');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Extracting share_sheet.mp4 frames...');
try {
  execSync(`"${ffmpeg}" -y -i share_sheet.mp4 "${outDir}/frame_%03d.png"`, { stdio: 'inherit' });
  const files = fs.readdirSync(outDir);
  console.log(`Extracted ${files.length} frames.`);

  // Sample every 15 frames (~0.25s)
  const keyframeList = [];
  for (let i = 1; i <= files.length; i += 15) {
    const frameName = `frame_${String(i).padStart(3, '0')}.png`;
    const src = path.join(outDir, frameName);
    const destName = `sharesheet_kf_${String(i).padStart(3, '0')}.png`;
    const dest = path.join(artifactDir, destName);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      keyframeList.push({ frame: i, time: `${((i-1)/60).toFixed(2)}s`, name: destName });
    }
  }
  console.log(`Copied ${keyframeList.length} share_sheet keyframes to artifact directory.`);
} catch (err) {
  console.error('Error:', err);
}
