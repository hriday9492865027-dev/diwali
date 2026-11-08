import { ParticleBufferData } from "./types";

/**
 * Clean-room Image Preprocessor:
 * Samples pixels from an image and generates weighted 3D particle target coordinates.
 * Preserves exact RGB colors and uses edge/center saliency to ensure facial recognizability.
 */
export async function processImageToParticleBuffers(
  imageUrl: string,
  targetParticleBudget: number = 8000
): Promise<ParticleBufferData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const targetWidth = 240;
        const targetHeight = Math.round((img.naturalHeight / img.naturalWidth) * targetWidth);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          reject(new Error("Canvas 2D context unavailable."));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;

        // 1. Calculate luminance and Sobel edge intensity for each pixel
        const totalPixels = targetWidth * targetHeight;
        const luminance = new Float32Array(totalPixels);
        const edges = new Float32Array(totalPixels);

        for (let i = 0; i < totalPixels; i++) {
          const r = data[i * 4];
          const g = data[i * 4 + 1];
          const b = data[i * 4 + 2];
          luminance[i] = 0.299 * r + 0.587 * g + 0.114 * b;
        }

        // Sobel filter for edge preservation (contours, facial boundaries)
        for (let y = 1; y < targetHeight - 1; y++) {
          for (let x = 1; x < targetWidth - 1; x++) {
            const idx = y * targetWidth + x;
            const gx =
              -1 * luminance[(y - 1) * targetWidth + (x - 1)] +
              1 * luminance[(y - 1) * targetWidth + (x + 1)] +
              -2 * luminance[y * targetWidth + (x - 1)] +
              2 * luminance[y * targetWidth + (x + 1)] +
              -1 * luminance[(y + 1) * targetWidth + (x - 1)] +
              1 * luminance[(y + 1) * targetWidth + (x + 1)];

            const gy =
              -1 * luminance[(y - 1) * targetWidth + (x - 1)] +
              -2 * luminance[(y - 1) * targetWidth + x] +
              -1 * luminance[(y - 1) * targetWidth + (x + 1)] +
              1 * luminance[(y + 1) * targetWidth + (x - 1)] +
              2 * luminance[(y + 1) * targetWidth + x] +
              1 * luminance[(y + 1) * targetWidth + (x + 1)];

            edges[idx] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
          }
        }

        // 2. Candidate pixel collection with weighted saliency
        interface Candidate {
          x: number;
          y: number;
          r: number;
          g: number;
          b: number;
          weight: number;
        }

        const candidates: Candidate[] = [];
        const centerX = targetWidth / 2;
        const centerY = targetHeight * 0.42; // Human face is typically centered around top 40-50%

        for (let y = 0; y < targetHeight; y += 2) {
          for (let x = 0; x < targetWidth; x += 2) {
            const idx = y * targetWidth + x;
            const a = data[idx * 4 + 3];
            if (a < 50) continue; // Skip transparent pixels

            const r = data[idx * 4] / 255;
            const g = data[idx * 4 + 1] / 255;
            const b = data[idx * 4 + 2] / 255;

            // Distance to estimated facial center
            const dx = (x - centerX) / targetWidth;
            const dy = (y - centerY) / targetHeight;
            const distToCenter = Math.sqrt(dx * dx + dy * dy);
            const centerBoost = Math.max(0, 1 - distToCenter * 2.2);

            const edgeScore = edges[idx] / 255;

            // Saliency Weight: Edges (eyes/mouth contours) + Face Center Focus
            const weight = 0.5 + edgeScore * 3.5 + centerBoost * 2.0;

            candidates.push({ x, y, r, g, b, weight });
          }
        }

        // 3. Probabilistic weighted reservoir sampling to match targetParticleBudget
        candidates.sort((a, b) => b.weight - a.weight);
        const selected = candidates.slice(0, targetParticleBudget);
        const count = selected.length;

        // 4. Construct typed arrays for GPU BufferGeometry
        const positions = new Float32Array(count * 3);
        const targetPositions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const alphas = new Float32Array(count);

        // Normalize coordinates to 3D world space (centered around origin)
        const scale = 5.0 / targetHeight;

        for (let i = 0; i < count; i++) {
          const c = selected[i];

          // Target 3D coordinates (centered)
          const tx = (c.x - targetWidth / 2) * scale;
          const ty = -(c.y - targetHeight / 2) * scale; // Invert Y for WebGL
          const tz = (Math.random() - 0.5) * 0.25;

          targetPositions[i * 3] = tx;
          targetPositions[i * 3 + 1] = ty;
          targetPositions[i * 3 + 2] = tz;

          // Initial position at explosion point (or scattered radial sphere)
          positions[i * 3] = (Math.random() - 0.5) * 1.5;
          positions[i * 3 + 1] = 1.0 + (Math.random() - 0.5) * 1.5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

          // Preserved exact original sampled RGB colors
          colors[i * 3] = c.r;
          colors[i * 3 + 1] = c.g;
          colors[i * 3 + 2] = c.b;

          sizes[i] = Math.random() * 2.5 + 2.0;
          alphas[i] = 1.0;
        }

        resolve({
          positions,
          targetPositions,
          colors,
          sizes,
          alphas,
          particleCount: count,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image asset for particle processing: ${imageUrl}`));
    };

    img.src = imageUrl;
  });
}
