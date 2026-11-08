export type ParticleState =
  | "READY"
  | "ROCKET_LAUNCH"
  | "EXPLOSION"
  | "BLAST_EXPANSION"
  | "BURST_HOLD"
  | "GRAVITY_FALL"
  | "IDLE_COMPLETE"
  | "PARTICLE_DISPERSION"
  | "IMAGE_RECONSTRUCTION"
  | "PORTRAIT_IDLE"
  | "PARTICLE_DISSOLVE";

export interface ParticleBufferData {
  positions: Float32Array;        // Current x, y, z
  targetPositions: Float32Array;  // Target image coordinates x, y, z
  colors: Float32Array;           // r, g, b (0.0 to 1.0)
  sizes: Float32Array;            // Point sizes
  alphas: Float32Array;           // Alpha opacities
  particleCount: number;
}

export interface PhotoAsset {
  id: string;
  url: string;
  caption?: string | null;
  createdAt?: number;
}

