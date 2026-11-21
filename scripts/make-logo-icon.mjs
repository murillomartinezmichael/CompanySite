// Display-size copy of the official logo: public/official-logo.png (1024x1024, 804 KB) is
// downscaled to public/official-logo-192.png for the header/footer marks and the favicon.
// Pure resize (Lanczos): no crop, recolour, filter or redraw (D-CS-014). The original stays
// byte-for-byte and is still what og:image, twitter:image and the JSON-LD logo point to.
// Run: node scripts/make-logo-icon.mjs
import sharp from 'sharp';

const SIZE = 192;
await sharp('public/official-logo.png')
  .resize(SIZE, SIZE, { kernel: 'lanczos3', fit: 'fill' })
  .png({ compressionLevel: 9, palette: false })
  .toFile(`public/official-logo-${SIZE}.png`);
console.log(`wrote public/official-logo-${SIZE}.png`);
