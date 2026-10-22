const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'video_frames');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Using ffmpeg path:', ffmpeg);
try {
  execSync(`"${ffmpeg}" -y -i chromatic_thinking.mp4 "${outDir}/frame_%03d.png"`, { stdio: 'inherit' });
  const files = fs.readdirSync(outDir);
  console.log(`Successfully extracted ${files.length} frames to ${outDir}`);
} catch (err) {
  console.error('Error extracting frames:', err);
}
