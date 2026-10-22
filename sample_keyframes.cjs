const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Faheem\\.gemini\\antigravity-ide\\brain\\78ac668b-f899-497d-a7df-e9452546214c';
const framesDir = path.join(__dirname, 'video_frames');

const totalFrames = 881;
const step = 20; // Every 20 frames (~0.33 seconds)

const keyframeList = [];

for (let i = 1; i <= totalFrames; i += step) {
  const frameName = `frame_${String(i).padStart(3, '0')}.png`;
  const src = path.join(framesDir, frameName);
  const dest = path.join(artifactDir, `chromatic_kf_${String(i).padStart(3, '0')}.png`);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    const timeSec = ((i - 1) / 59.94).toFixed(2);
    keyframeList.push({ frame: i, time: `${timeSec}s`, name: `chromatic_kf_${String(i).padStart(3, '0')}.png`, fullPath: dest });
  }
}

console.log(`Copied ${keyframeList.length} keyframes to artifact directory.`);
fs.writeFileSync(path.join(__dirname, 'keyframes_summary.json'), JSON.stringify(keyframeList, null, 2));
