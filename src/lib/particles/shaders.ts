export const portraitVertexShader = `
  uniform float uTime;
  uniform float uMorphProgress;
  uniform float uDissolveProgress;
  uniform float uNoiseStrength;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uMouseRadius;
  uniform float uMouseStrength;

  attribute vec3 targetPosition;
  attribute vec3 color;
  attribute float size;
  attribute float alpha;

  varying vec3 vColor;
  varying float vAlpha;

  // Pseudo-random & simplex noise helper
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vColor = color;
    vAlpha = alpha;

    // 1. Morph between initial burst dispersion and target coordinates
    // Smooth cubic easing for fluid convergence
    float t = smoothstep(0.0, 1.0, uMorphProgress);
    vec3 mixedPos = mix(position, targetPosition, t);

    // 2. Add subtle organic Simplex noise flow when formed (Portrait Idle)
    if (t > 0.8) {
      float idleTime = uTime * 0.8;
      float noiseX = sin(mixedPos.y * 3.0 + idleTime + hash(targetPosition) * 6.28) * 0.02 * uNoiseStrength;
      float noiseY = cos(mixedPos.x * 3.0 + idleTime + hash(targetPosition) * 6.28) * 0.02 * uNoiseStrength;
      float breathe = sin(idleTime * 0.5) * 0.015;
      mixedPos.x += noiseX;
      mixedPos.y += noiseY + breathe;

      // Interactive forcefield cursor displacement (Forcefield technique)
      if (uMouseRadius > 0.0) {
        vec2 diff = mixedPos.xy - uMouse;
        float dist = length(diff);
        if (dist < uMouseRadius && dist > 0.0001) {
          float force = (1.0 - dist / uMouseRadius) * uMouseStrength;
          vec2 pushDir = normalize(diff);
          mixedPos.xy += pushDir * force;
        }
      }
    }

    // 3. Outward dispersion upon dissolve
    if (uDissolveProgress > 0.0) {
      vec3 outwardDir = normalize(mixedPos + vec3(0.001));
      float d = uDissolveProgress * 4.0;
      mixedPos += outwardDir * d * (1.0 + hash(targetPosition) * 1.5);
      vAlpha *= (1.0 - uDissolveProgress);
    }

    // 4. Subtle shimmer in alpha and brightness
    float shimmer = sin(uTime * 3.0 + hash(targetPosition) * 20.0) * 0.15;
    vAlpha = clamp(vAlpha + shimmer, 0.0, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point size based on camera distance and display pixel ratio
    gl_PointSize = size * (240.0 / -mvPosition.z) * uPixelRatio;
  }
`;

export const portraitFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Distance from point center (0.0 to 0.5)
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Soft glowing circle profile
    float intensity = smoothstep(0.5, 0.05, dist);

    // Subtle golden highlight aura
    vec3 finalColor = mix(vColor, vec3(1.0, 0.95, 0.8), 0.18 * intensity);

    gl_FragColor = vec4(finalColor, vAlpha * intensity);
  }
`;

