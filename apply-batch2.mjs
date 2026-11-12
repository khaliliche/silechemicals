// Sile Chemicals rebrand - batch 2. Run from the project root:
//   node apply-batch2.mjs "C:\path\to\sile_chemicals.webp"
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const srcImg = process.argv[2];
if (!srcImg || !fs.existsSync(srcImg)) {
  console.error('Usage: node apply-batch2.mjs "C:\\path\\to\\sile_chemicals.webp"');
  process.exit(1);
}
if (!fs.existsSync("src/lib/seo.ts")) {
  console.error("Run this from the project root (the folder with package.json).");
  process.exit(1);
}

const edits = new Map();
const get = (f) => (edits.has(f) ? edits.get(f) : fs.readFileSync(f, "utf8"));
const put = (f, s) => edits.set(f, s);
function sub(f, re, to) {
  const s = get(f);
  if (!re.test(s)) throw new Error("No match in " + f + " for " + re);
  put(f, s.replace(re, to));
}
function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
  );
}

// 1. names, storage key, colours (lime -> pink accent, CTA text -> white)
for (const f of walk("src").filter((x) => /\.tsx?$/.test(x))) {
  const o = fs.readFileSync(f, "utf8");
  let s = o;
  s = s.replaceAll(
    'Guennoun<span className="text-lime-500">Group</span>',
    'Sile <span className="text-lime-500">Chemicals</span>'
  );
  s = s.replaceAll("GuennounGroup", "Sile Chemicals");
  s = s.replaceAll('"guennoun-quote"', '"sile-quote"');
  if (/(AvailabilityBadge|ProductsTable)\.tsx$/.test(f)) {
    s = s.replaceAll("bg-lime-100 text-lime-800", "bg-emerald-100 text-emerald-800");
  } else {
    s = s
      .split("\n")
      .map((l) =>
        l.includes("bg-lime-400")
          ? l
              .replaceAll("bg-lime-400", "bg-accent-600")
              .replaceAll("text-slate-900", "text-white")
              .replaceAll("hover:bg-lime-300", "hover:bg-accent-700")
              .replaceAll("shadow-lime-400/40", "shadow-accent-500/40")
          : l
      )
      .join("\n");
    s = s.replaceAll("lime-", "accent-");
  }
  if (s !== o) put(f, s);
}

// 2. logo sizes + OG image
sub(
  "src/components/Header.tsx",
  /width=\{557\}(\s+)height=\{321\}(\s+)priority(\s+)className="h-12 w-auto"/,
  'width={800}$1height={192}$2priority$3className="h-9 w-auto sm:h-11"'
);
sub(
  "src/app/[locale]/page.tsx",
  /width=\{557\}(\s+)height=\{321\}(\s+)priority(\s+)className="mx-auto mb-8 w-40 sm:w-48"/,
  'width={800}$1height={192}$2priority$3className="mx-auto mb-8 w-56 sm:w-72"'
);
sub("src/lib/seo.ts", /DEFAULT_OG_IMAGE = "\/logo\.png"/, 'DEFAULT_OG_IMAGE = "/og.png"');

// 3. palette
sub(
  "src/app/globals.css",
  /@theme \{[\s\S]*?\}/,
  `@theme {
  --color-brand-50: #eef7fd;
  --color-brand-100: #d6ecfa;
  --color-brand-200: #a9d8f4;
  --color-brand-400: #4aa8e0;
  --color-brand-500: #1e8bd0;
  --color-brand-600: #017aba;
  --color-brand-700: #115c91;
  --color-brand-900: #0d3b5e;

  --color-accent-100: #fde4ee;
  --color-accent-200: #fbc4d8;
  --color-accent-400: #f26a98;
  --color-accent-500: #e8457f;
  --color-accent-600: #d02f69;
  --color-accent-700: #a8244f;
  --color-accent-800: #7f1b3b;
}`
);

// 4. messages (FR / EN / AR)
const T = {
  fr: {
    "meta.title": "Sile Chemicals \u2014 Produits chimiques et mat\u00e9riel de lavage auto",
    "meta.description": "Concentr\u00e9s, produits individuels, machines et pi\u00e8ces de rechange pour le lavage automobile. Demandez votre devis en quelques clics.",
    "home.title": "Bienvenue chez Sile Chemicals !",
    "home.company": "Sile Chemicals propose une gamme de produits chimiques concentr\u00e9s et de mat\u00e9riel de nettoyage automobile, 100 % Made in Italy, de tr\u00e8s bonne qualit\u00e9 et \u00e0 des prix tr\u00e8s adapt\u00e9s. Appelez-nous pour profiter vite de nos diff\u00e9rentes gammes.",
    "footer.tagline": "Produits chimiques et mat\u00e9riel de lavage auto.",
    "about.intro": "Sile Chemicals fournit des produits chimiques, des machines et des pi\u00e8ces de rechange pour le lavage automobile, en gros comme \u00e0 la pi\u00e8ce.",
  },
  en: {
    "meta.title": "Sile Chemicals \u2014 Car washing chemicals and equipment",
    "meta.description": "Concentrates, individual products, machines and spare parts for car washing. Request your quote in a few clicks.",
    "home.title": "Welcome to Sile Chemicals!",
    "home.company": "Sile Chemicals offers a range of concentrated chemical products and car cleaning equipment, 100% Made in Italy, of very good quality at very suitable prices. Call us to quickly take advantage of our different ranges.",
    "footer.tagline": "Car washing chemicals and equipment.",
    "about.intro": "Sile Chemicals supplies chemical products, machines and spare parts for car washing, wholesale and piece by piece.",
  },
  ar: {
    "meta.title": "Sile Chemicals \u2014 \u0645\u0648\u0627\u062f \u0643\u064a\u0645\u064a\u0627\u0626\u064a\u0629 \u0648\u0645\u0639\u062f\u0627\u062a \u063a\u0633\u064a\u0644 \u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a",
    "meta.description": "\u0645\u0631\u0643\u0651\u0632\u0627\u062a \u0648\u0645\u0646\u062a\u062c\u0627\u062a \u0628\u0627\u0644\u0642\u0637\u0639\u0629 \u0648\u0622\u0644\u0627\u062a \u0648\u0642\u0637\u0639 \u063a\u064a\u0627\u0631 \u0644\u063a\u0633\u064a\u0644 \u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a. \u0627\u0637\u0644\u0628 \u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631 \u0641\u064a \u0628\u0636\u0639 \u0646\u0642\u0631\u0627\u062a.",
    "home.title": "\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643\u0645 \u0641\u064a Sile Chemicals!",
    "home.company": "\u062a\u0642\u062f\u0645 Sile Chemicals \u062a\u0634\u0643\u064a\u0644\u0629 \u0645\u0646 \u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0643\u064a\u0645\u064a\u0627\u0626\u064a\u0629 \u0627\u0644\u0645\u0631\u0643\u0651\u0632\u0629 \u0648\u0645\u0639\u062f\u0627\u062a \u062a\u0646\u0638\u064a\u0641 \u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a\u060c 100% \u0635\u0646\u0639 \u0641\u064a \u0625\u064a\u0637\u0627\u0644\u064a\u0627\u060c \u0628\u062c\u0648\u062f\u0629 \u062c\u064a\u062f\u0629 \u062c\u062f\u0627\u064b \u0648\u0628\u0623\u0633\u0639\u0627\u0631 \u0645\u0646\u0627\u0633\u0628\u0629 \u062c\u062f\u0627\u064b. \u0627\u062a\u0635\u0644\u0648\u0627 \u0628\u0646\u0627 \u0644\u0644\u0627\u0633\u062a\u0641\u0627\u062f\u0629 \u0628\u0633\u0631\u0639\u0629 \u0645\u0646 \u0645\u062e\u062a\u0644\u0641 \u062a\u0634\u0643\u064a\u0644\u0627\u062a\u0646\u0627.",
    "footer.tagline": "\u0645\u0648\u0627\u062f \u0643\u064a\u0645\u064a\u0627\u0626\u064a\u0629 \u0648\u0645\u0639\u062f\u0627\u062a \u063a\u0633\u064a\u0644 \u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a.",
    "about.intro": "\u062a\u0648\u0641\u0631 Sile Chemicals \u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u0643\u064a\u0645\u064a\u0627\u0626\u064a\u0629 \u0648\u0627\u0644\u0622\u0644\u0627\u062a \u0648\u0642\u0637\u0639 \u0627\u0644\u063a\u064a\u0627\u0631 \u0644\u063a\u0633\u064a\u0644 \u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a \u0628\u0627\u0644\u062c\u0645\u0644\u0629 \u0648\u0628\u0627\u0644\u0642\u0637\u0639\u0629.",
  },
};
for (const [l, vals] of Object.entries(T)) {
  const f = "messages/" + l + ".json";
  const d = JSON.parse(fs.readFileSync(f, "utf8").replace(/^\uFEFF/, ""));
  for (const [k, v] of Object.entries(vals)) {
    const [a, b] = k.split(".");
    if (!(b in d[a])) throw new Error("Missing key " + k + " in " + f);
    d[a][b] = v;
  }
  put(f, JSON.stringify(d, null, 2) + "\n");
}

// write all text edits (nothing is written if a check above failed)
for (const [f, s] of edits) fs.writeFileSync(f, s, "utf8");

// 5. images: logo, OG image, favicon
const logoCrop = { left: 0, top: 400, width: 1024, height: 246 };
fs.writeFileSync(
  "public/logo.png",
  await sharp(srcImg).extract(logoCrop).resize({ width: 800 }).png().toBuffer()
);
const ogLogo = await sharp(srcImg).extract(logoCrop).resize({ width: 960 }).png().toBuffer();
const ogH = (await sharp(ogLogo).metadata()).height;
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#ffffff" } })
  .composite([{ input: ogLogo, left: 120, top: Math.round((630 - ogH) / 2) }])
  .png()
  .toFile("public/og.png");
const markSquare = await sharp(srcImg)
  .extract({ left: 0, top: 396, width: 330, height: 254 })
  .extend({ top: 38, bottom: 38, background: "#ffffff" })
  .png()
  .toBuffer();
const mark = await sharp(markSquare).resize(64, 64).png().toBuffer();
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

console.log("Done. Text files changed: " + edits.size + ". Images: public/logo.png, public/og.png, src/app/favicon.ico");
