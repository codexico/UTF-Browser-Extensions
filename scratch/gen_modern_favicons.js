const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = '/var/home/fk/projs/codexico/repo/blog/blog/verdant-fusion/public';
const srcJpg = '/var/home/fk/.gemini/antigravity/brain/bc4484bd-1c97-4aac-a251-7b067dcd80d0/favicon_codexico_personal_1787540476100.jpg';

// 1. Criar favicon.svg vetorial moderno com suporte a tema claro/escuro nativo
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <style>
    .bg { fill: #0f172a; }
    .bracket { stroke: #38bdf8; stroke-width: 42; stroke-linecap: round; stroke-linejoin: round; }
    .letter-c { stroke: #818cf8; stroke-width: 44; stroke-linecap: round; fill: none; }
    @media (prefers-color-scheme: light) {
      .bg { fill: #f8fafc; }
      .bracket { stroke: #0284c7; }
      .letter-c { stroke: #4f46e5; }
    }
  </style>
  <rect width="512" height="512" rx="128" class="bg" />
  <!-- Left Bracket < -->
  <path d="M 165 170 L 85 256 L 165 342" class="bracket" />
  <!-- Right Bracket > -->
  <path d="M 347 170 L 427 256 L 347 342" class="bracket" />
  <!-- Central C -->
  <path d="M 305 200 A 68 68 0 1 0 305 312" class="letter-c" />
</svg>
`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');

// 2. Gerar imagens com Python Pillow (32x32 ICO, 180x180 Apple, 192x192 e 512x512 PWA)
const pythonScript = `
from PIL import Image

src_img = "${srcJpg}"
public_dir = "${publicDir}"

img = Image.open(src_img)

# 32x32 ICO
img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
img_32.save(f"{public_dir}/favicon.ico", format="ICO")

# 180x180 Apple Touch Icon
img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
img_180.save(f"{public_dir}/apple-touch-icon.png", format="PNG")

# 192x192 Android / PWA
img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save(f"{public_dir}/icon-192.png", format="PNG")

# 512x512 Android / PWA
img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save(f"{public_dir}/icon-512.png", format="PNG")

print("Favicons gerados com sucesso!")
`;

fs.writeFileSync('/tmp/gen_favicons.py', pythonScript, 'utf8');
execSync('python3 /tmp/gen_favicons.py');

// 3. Criar manifest.webmanifest moderno
const manifestContent = {
  name: "codexico | Francisco Kahil",
  short_name: "codexico",
  description: "Portfólio e Blog de Francisco Kahil - Desenvolvedor Full Stack Senior",
  start_url: "/",
  display: "standalone",
  background_color: "#0f172a",
  theme_color: "#6366f1",
  icons: [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png"
    }
  ]
};

fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifestContent, null, 2), 'utf8');
console.log('manifest.webmanifest gerado com sucesso!');
