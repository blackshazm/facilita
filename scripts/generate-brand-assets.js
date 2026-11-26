const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const clientPublic = path.join(__dirname, '..', 'apps', 'client', 'public');
const providerAssets = path.join(__dirname, '..', 'apps', 'provider', 'assets');

if (!fs.existsSync(providerAssets)) {
  fs.mkdirSync(providerAssets, { recursive: true });
}

function createIconSvg(size, bg = '#064e3b', fg = '#10b981') {
  const pad = size * 0.15;
  const innerSize = size - pad * 2;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${bg}"/>
      <g transform="translate(${pad}, ${pad})">
        <!-- Stylized 'F' with shield / hammer / bolt motif -->
        <path d="M ${innerSize * 0.2} ${innerSize * 0.1} 
                 L ${innerSize * 0.8} ${innerSize * 0.1} 
                 L ${innerSize * 0.8} ${innerSize * 0.28} 
                 L ${innerSize * 0.45} ${innerSize * 0.28} 
                 L ${innerSize * 0.45} ${innerSize * 0.45} 
                 L ${innerSize * 0.72} ${innerSize * 0.45} 
                 L ${innerSize * 0.72} ${innerSize * 0.62} 
                 L ${innerSize * 0.45} ${innerSize * 0.62} 
                 L ${innerSize * 0.45} ${innerSize * 0.9} 
                 L ${innerSize * 0.2} ${innerSize * 0.9} Z" 
              fill="${fg}" />
        <circle cx="${innerSize * 0.75}" cy="${innerSize * 0.78}" r="${innerSize * 0.12}" fill="#34d399" />
      </g>
    </svg>
  `;
}

function createSplashSvg(width, height) {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#064e3b"/>
      <g transform="translate(${(width - 400) / 2}, ${(height - 400) / 2})">
        <rect width="400" height="400" rx="80" fill="#042f2e" />
        <path d="M 80 40 L 320 40 L 320 112 L 180 112 L 180 180 L 288 180 L 288 248 L 180 248 L 180 360 L 80 360 Z" fill="#10b981" />
        <circle cx="300" cy="312" r="48" fill="#34d399" />
      </g>
      <text x="${width / 2}" y="${height / 2 + 300}" font-family="sans-serif" font-size="56" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">FACILITA</text>
      <text x="${width / 2}" y="${height / 2 + 370}" font-family="sans-serif" font-size="28" font-weight="500" fill="#a7f3d0" text-anchor="middle">Serviços em um Clique</text>
    </svg>
  `;
}

async function run() {
  console.log('Gerando assets para apps/client...');
  // 1. Client PWA Icons
  await sharp(Buffer.from(createIconSvg(192)))
    .png()
    .toFile(path.join(clientPublic, 'icon-192x192.png'));

  await sharp(Buffer.from(createIconSvg(512)))
    .png()
    .toFile(path.join(clientPublic, 'icon-512x512.png'));

  console.log('Gerando assets para apps/provider...');
  // 2. Provider Expo Icons
  await sharp(Buffer.from(createIconSvg(1024)))
    .png()
    .toFile(path.join(providerAssets, 'icon.png'));

  await sharp(Buffer.from(createIconSvg(1024, '#064e3b', '#10b981')))
    .png()
    .toFile(path.join(providerAssets, 'adaptive-icon.png'));

  await sharp(Buffer.from(createSplashSvg(1242, 2436)))
    .png()
    .toFile(path.join(providerAssets, 'splash.png'));

  await sharp(Buffer.from(createIconSvg(48)))
    .png()
    .toFile(path.join(providerAssets, 'favicon.png'));

  console.log('Assets gerados com sucesso!');
}

run().catch((err) => {
  console.error('Erro gerando assets:', err);
  process.exit(1);
});
