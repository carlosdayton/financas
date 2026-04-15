const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG do ícone do app (wallet/money theme)
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#grad1)"/>
  <g transform="translate(96, 96)" fill="white">
    <!-- Wallet body -->
    <rect x="40" y="120" width="240" height="160" rx="20" fill="white" opacity="0.95"/>
    <!-- Wallet flap -->
    <path d="M40 120 L280 120 L280 80 Q280 60 260 60 L60 60 Q40 60 40 80 Z" fill="white" opacity="0.8"/>
    <!-- Dollar sign -->
    <text x="160" y="220" font-family="Arial, sans-serif" font-size="100" font-weight="bold" text-anchor="middle" fill="#6366f1">$</text>
    <!-- Card peeking out -->
    <rect x="60" y="40" width="80" height="50" rx="5" fill="white" opacity="0.6"/>
    <rect x="70" y="55" width="40" height="6" rx="2" fill="#6366f1" opacity="0.5"/>
  </g>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(Buffer.from(svgIcon))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate icon-${size}x${size}.png:`, error.message);
    }
  }
  
  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
