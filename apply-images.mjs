// Sile Chemicals - logo, OG image and favicon from any size of logo file.
//   node apply-images.mjs "C:\path\to\sile_chemicals.webp"
import fs from "node:fs";
import sharp from "sharp";

const srcImg = process.argv[2];
if (!srcImg || !fs.existsSync(srcImg)) {
  console.error('Usage: node apply-images.mjs "C:\\path\\to\\sile_chemicals.webp"');
  process.exit(1);
}
if (!fs.existsSync("public") || !fs.existsSync("src/app")) {
  console.error("Run this from the project root (the folder with package.json).");
  process.exit(1);
}
const WHITE = "#ffffff";

// 1. cut away the white margins around the logo (works for any image size)
const flat = await sharp(srcImg).flatten({ background: WHITE }).png().toBuffer();
const { data: tight, info } = await sharp(flat)
  .trim({ background: WHITE, threshold: 20 })
  .png()
  .toBuffer({ resolveWithObject: true });
console.log("Logo found: " + info.width + "x" + info.height + " px");

// 2. logo.png: small even border, 800 px wide
const pad = Math.round(info.height * 0.06);
const padded = await sharp(tight)
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: WHITE })
  .png()
  .toBuffer();
await sharp(padded).resize({ width: 800 }).png().toFile("public/logo.png");

// 3. og.png: 1200x630, logo centred on white
const ogLogo = await sharp(padded).resize({ width: 960 }).png().toBuffer();
const ogH = (await sharp(ogLogo).metadata()).height;
await sharp({ create: { width: 1200, height: 630, channels: 3, background: WHITE } })
  .composite([{ input: ogLogo, left: 120, top: Math.round((630 - ogH) / 2) }])
  .png()
  .toFile("public/og.png");

// 4. favicon.ico: only the SC symbol (left part of the logo), made square
const mw = Math.round(info.width * 0.32);
const symbol = await sharp(tight)
  .extract({ left: 0, top: 0, width: mw, height: info.height })
  .png()
  .toBuffer();
const side = Math.max(mw, info.height);
const dx = side - mw;
const dy = side - info.height;
const m = Math.round(side * 0.04);
const square = await sharp(symbol)
  .extend({
    top: Math.floor(dy / 2) + m,
    bottom: Math.ceil(dy / 2) + m,
    left: Math.floor(dx / 2) + m,
    right: Math.ceil(dx / 2) + m,
    background: WHITE,
  })
  .png()
  .toBuffer();
const mark = await sharp(square).resize(64, 64).png().toBuffer();
const hdr = Buffer.alloc(22);
hdr.writeUInt16LE(1, 2);
hdr.writeUInt16LE(1, 4);
hdr.writeUInt8(64, 6);
hdr.writeUInt8(64, 7);
hdr.writeUInt16LE(1, 10);
hdr.writeUInt16LE(32, 12);
hdr.writeUInt32LE(mark.length, 14);
hdr.writeUInt32LE(22, 18);
fs.writeFileSync("src/app/favicon.ico", Buffer.concat([hdr, mark]));

console.log("Done: public/logo.png, public/og.png, src/app/favicon.ico");
