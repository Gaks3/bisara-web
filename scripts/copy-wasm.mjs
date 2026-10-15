import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path source dari node_modules/onnxruntime-web/dist
const sourceDir = path.resolve(__dirname, "..", "node_modules", "onnxruntime-web", "dist");
// Path destination ke public/wasm
const destDir = path.resolve(__dirname, "..", "public", "wasm");

console.log("🚀 Menjalankan script copy WebAssembly ONNX Runtime...");
console.log(`📁 Source      : ${sourceDir}`);
console.log(`📁 Destination : ${destDir}`);

if (!fs.existsSync(sourceDir)) {
  console.error("❌ Folder node_modules/onnxruntime-web/dist tidak ditemukan!");
  console.error("   Pastikan dependensi sudah terinstal dengan menjalankan: npm install");
  process.exit(1);
}

// Buat folder public/wasm jika belum ada
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Ekstensi file yang akan disalin (.wasm, .mjs, dan .min.js)
const allowedExtensions = [".wasm", ".mjs", ".js"];
const excludedPatterns = [".map", ".d.ts", ".node."];

try {
  const files = fs.readdirSync(sourceDir);
  let copiedCount = 0;
  let totalBytes = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const isExcluded = excludedPatterns.some((pattern) => file.includes(pattern));

    if (allowedExtensions.includes(ext) && !isExcluded) {
      const srcFile = path.join(sourceDir, file);
      const destFile = path.join(destDir, file);

      // Hanya salin file reguler
      const stat = fs.statSync(srcFile);
      if (stat.isFile()) {
        fs.copyFileSync(srcFile, destFile);
        copiedCount++;
        totalBytes += stat.size;
        console.log(`  ✓ ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    }
  }

  const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
  console.log(`\n✨ Berhasil menyalin ${copiedCount} file (${totalMB} MB) ke public/wasm/!`);
} catch (error) {
  console.error("❌ Terjadi kesalahan saat menyalin file WASM:", error);
  process.exit(1);
}
