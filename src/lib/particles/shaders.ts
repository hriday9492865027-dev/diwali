export const portraitVertexShader = `
  uniform float uTime;
  uniform float uExplosionProgress;
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

    // 1. Firecracker Explosion: starts at rocket apex (0.0, 0.5, 0.0)
    vec3 apex = vec3(0.0, 0.5, 0.0);

    // Cubic easing for initial explosive blast dispersion
    float expP = clamp(uExplosionProgress, 0.0, 1.0);
    float burstEase = 1.0 - pow(1.0 - expP, 3.0);
    vec3 burstPos = mix(apex, position, burstEase);

    // 2. Morph from explosion burst into target sacred Rangoli geometry
    float morphP = clamp(uMorphProgress, 0.0, 1.0);
    float morphEase = smoothstep(0.0, 1.0, morphP);
    vec3 mixedPos = mix(burstPos, targetPosition, morphEase);

    // 3. Subtle ambient starlight breathing once crystallized (Portrait/Rangoli Idle)
    if (morphEase > 0.8) {
      float idleTime = uTime * 0.8;
      float noiseX = sin(mixedPos.y * 3.0 + idleTime + hash(targetPosition) * 6.28) * 0.015 * uNoiseStrength;
      float noiseY = cos(mixedPos.x * 3.0 + idleTime + hash(targetPosition) * 6.28) * 0.015 * uNoiseStrength;
      float breathe = sin(idleTime * 0.6) * 0.01;
      mixedPos.x += noiseX;
      mixedPos.y += noiseY + breathe;

      // Interactive forcefield cursor displacement
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

    // 4. Outward dispersion upon dissolve
    if (uDissolveProgress > 0.0) {
      vec3 outwardDir = normalize(mixedPos + vec3(0.001));
      float d = uDissolveProgress * 4.5;
      mixedPos += outwardDir * d * (1.0 + hash(targetPosition) * 1.5);
      vAlpha *= (1.0 - uDissolveProgress);
    }

    // 5. Subtle shimmer in alpha and brightness
    float shimmer = sin(uTime * 3.5 + hash(targetPosition) * 25.0) * 0.12;
    vAlpha = clamp(vAlpha + shimmer, 0.1, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point size based on camera distance and pixel ratio
    // Calibrated for crisp, shimmering starlight embers (approx 3px-7px on screen)
    float baseSize = size * (22.0 / -mvPosition.z) * uPixelRatio;

    // During active explosion burst, temporarily flare up sparks
    if (uMorphProgress < 0.15) {
      baseSize *= (1.0 + (1.0 - expP) * 1.2);
    }

    gl_PointSize = clamp(baseSize, 2.0, 24.0);
  }
`;

export const portraitFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Distance from center of point sprite (0.0 at center, 0.5 at boundary)
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Glowing spark profile with bright diamond core and soft radiant aura
    float core = smoothstep(0.18, 0.0, dist);
    float glow = smoothstep(0.5, 0.08, dist) * 0.7;
    float intensity = core + glow;

    // Keep true vibrant Rangoli pigments, with only the pinpoint center core glinting bright
    vec3 sparkColor = mix(vColor, vec3(1.0, 0.98, 0.9), core * 0.5);

    gl_FragColor = vec4(sparkColor, vAlpha * intensity * 0.85);
  }
`;

