export const portraitVertexShader = `
  uniform float uTime;
  uniform float uBlastProgress;
  uniform float uFallProgress;
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

    // Rocket apex detonation point
    vec3 apex = vec3(0.0, 0.5, 0.0);

    // 1. Direct Rangoli Blast: Sparks explode directly outward from the rocket apex into the Rangoli mandala!
    float blastP = clamp(max(uBlastProgress, uMorphProgress), 0.0, 1.0);
    float blastEase = 1.0 - pow(1.0 - blastP, 3.2);

    // Natural velocity variance so sparks don't travel in a mechanical ring
    float pVar = 0.88 + 0.24 * hash(targetPosition * 5.0);
    float particleProgress = clamp(blastEase * pVar, 0.0, 1.0);

    // Detonation expansion directly into sacred geometry
    vec3 currentPos = mix(apex, targetPosition, particleProgress);

    // Subtle radial spark spray jitter during flight that locks crisply into place
    if (blastEase < 0.96) {
      vec3 jitter = (vec3(
        hash(targetPosition + 1.2),
        hash(targetPosition + 3.4),
        hash(targetPosition + 5.6)
      ) - 0.5) * 0.14 * (1.0 - blastEase);
      currentPos += jitter;
    }

    // Graceful initial explosion alpha: prevents tens of thousands of overlapping points
    // at the apex coordinate from oversaturating into a solid blinding white blob
    if (blastP < 0.12) {
      vAlpha *= smoothstep(0.01, 0.12, blastP);
    }

    // 2. Starlight Twinkle & Shimmer during Hold Phase (Rangoli fully crystallized)
    if (blastEase >= 0.85 && uFallProgress == 0.0) {
      float idleTime = uTime * 0.8;
      // Gentle breathing without displacing delicate fine stroke lines
      float noiseX = sin(currentPos.y * 3.0 + idleTime + hash(targetPosition) * 6.28) * 0.003 * uNoiseStrength;
      float noiseY = cos(currentPos.x * 3.0 + idleTime + hash(targetPosition) * 6.28) * 0.003 * uNoiseStrength;
      currentPos.x += noiseX;
      currentPos.y += noiseY;

      // Interactive forcefield cursor displacement
      if (uMouseRadius > 0.0) {
        vec2 diff = currentPos.xy - uMouse;
        float dist = length(diff);
        if (dist < uMouseRadius && dist > 0.0001) {
          float force = (1.0 - dist / uMouseRadius) * uMouseStrength;
          vec2 pushDir = normalize(diff);
          currentPos.xy += pushDir * force;
        }
      }
    }

    // 3. Gravity Fall & Disappearance Phase (Willow Firework Ember Cascade)
    if (uFallProgress > 0.0) {
      float fallP = clamp(uFallProgress, 0.0, 1.0);
      float sparkDrag = 0.65 + 0.7 * hash(targetPosition + 8.1);
      
      // Gravitational acceleration pulling embers downward
      float drop = (fallP * fallP * 3.2 + fallP * 0.4) * sparkDrag;
      currentPos.y -= drop;

      // Atmospheric horizontal wind flutter
      float wind = sin(uTime * 2.2 + currentPos.y * 2.5 + hash(targetPosition) * 6.28) * 0.09 * fallP;
      currentPos.x += wind;

      // Burn-out extinction: alpha fades smoothly to complete disappearance
      float fade = 1.0 - pow(fallP, 1.35);
      vAlpha *= clamp(fade, 0.0, 1.0);
    }

    // 4. Outward dispersion upon manual dissolve (e.g. photo switch)
    if (uDissolveProgress > 0.0) {
      vec3 outwardDir = normalize(currentPos - apex + vec3(0.001));
      float d = uDissolveProgress * 4.5;
      currentPos += outwardDir * d * (1.0 + hash(targetPosition) * 1.5);
      vAlpha *= (1.0 - uDissolveProgress);
    }

    // 5. Ambient starlight twinkle
    float twinkle = sin(uTime * 4.5 + hash(targetPosition) * 30.0) * 0.15;
    vAlpha = clamp(vAlpha + twinkle, 0.0, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point size based on camera distance and pixel ratio (calibrated for delicate hairline starlight embers)
    float baseSize = size * (16.0 / -mvPosition.z) * uPixelRatio;

    // Embers shrink as they die down during gravity fall
    if (uFallProgress > 0.0) {
      baseSize *= clamp(1.0 - uFallProgress * 0.65, 0.2, 1.0);
    }

    gl_PointSize = clamp(baseSize, 1.0, 14.0);
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

    // Boost pigment chroma to counteract additive blending desaturation
    // Keeps Vermillion red fiery red, Gulabi pink neon magenta, Surya gold warm gold
    float maxC = max(vColor.r, max(vColor.g, vColor.b));
    float minC = min(vColor.r, min(vColor.g, vColor.b));
    float chroma = maxC - minC;
    vec3 vibrantColor = vColor;
    if (chroma > 0.08) {
      vibrantColor = mix(vColor, vColor / (maxC + 0.001), 0.35);
    }

    // Only pinpoint center glints white
    float pin = smoothstep(0.06, 0.0, dist);
    vec3 sparkColor = mix(vibrantColor, vec3(1.0, 1.0, 1.0), pin * 0.28);

    gl_FragColor = vec4(sparkColor, vAlpha * intensity * 0.9);
  }
`;

