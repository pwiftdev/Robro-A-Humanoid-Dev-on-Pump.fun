import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type ThreeLoaderProps = {
  onComplete: () => void;
};

type DotDatum = {
  current: THREE.Vector3;
  target: THREE.Vector3;
  velocity: THREE.Vector3;
};

const ASSEMBLE_DURATION_MS = 3000;
const HOLD_DURATION_MS = 500;
const DISPERSE_DURATION_MS = 1100;
const TOTAL_DURATION_MS = ASSEMBLE_DURATION_MS + HOLD_DURATION_MS + DISPERSE_DURATION_MS;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(t: number) {
  const v = clamp01(t);
  return v * v * (3 - 2 * v);
}

function FallbackParticleText() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Particle = {
      x: number;
      y: number;
      tx: number;
      ty: number;
      vx: number;
      vy: number;
      z: number;
    };

    let raf = 0;
    const particles: Particle[] = [];
    const count = 3600;
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      tempCanvas.width = Math.max(760, Math.floor(width * 0.72));
      tempCanvas.height = Math.max(220, Math.floor(height * 0.28));
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.fillStyle = "#fff";
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      tempCtx.font = `900 ${Math.floor(tempCanvas.height * 0.44)}px Inter, sans-serif`;
      tempCtx.fillText("ROBRO", tempCanvas.width / 2, tempCanvas.height / 2);

      const image = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const candidates: Array<{ x: number; y: number }> = [];
      for (let y = 0; y < tempCanvas.height; y += 2) {
        for (let x = 0; x < tempCanvas.width; x += 2) {
          const idx = (y * tempCanvas.width + x) * 4;
          if (image.data[idx + 3] > 20) {
            candidates.push({ x, y });
          }
        }
      }

      particles.length = 0;
      const scale = Math.min(width / 1600, height / 900, 1) * 0.95 + 0.62;
      for (let i = 0; i < count; i += 1) {
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        const tx = target
          ? (target.x - tempCanvas.width / 2) * scale + width / 2
          : width / 2 + (Math.random() - 0.5) * 260;
        const ty = target
          ? (target.y - tempCanvas.height / 2) * scale + height / 2
          : height / 2 + (Math.random() - 0.5) * 80;
        particles.push({
          x: width / 2 + (Math.random() - 0.5) * 900,
          y: height / 2 + (Math.random() - 0.5) * 520,
          tx,
          ty,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          z: Math.random()
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);
    const startedAt = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startedAt;
      const tAssemble = smoothstep(elapsed / ASSEMBLE_DURATION_MS);
      const disperseStart = ASSEMBLE_DURATION_MS + HOLD_DURATION_MS;
      const tDisperse = smoothstep((elapsed - disperseStart) / DISPERSE_DURATION_MS);
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        40,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.46
      );
      glow.addColorStop(0, "rgba(132, 239, 171, 0.1)");
      glow.addColorStop(1, "rgba(132, 239, 171, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(132, 239, 171, 0.9)";

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        if (tDisperse <= 0) {
          const k = 0.032 + tAssemble * 0.085;
          p.x += (p.tx - p.x) * k;
          p.y += (p.ty - p.y) * k;
          const drift = Math.sin(elapsed * 0.0014 + i * 0.07) * (0.14 + tAssemble * 0.22);
          p.y += drift;
        } else {
          p.x += p.vx * (1.4 + tDisperse * 4.3);
          p.y += p.vy * (1.4 + tDisperse * 4.3);
        }

        const size = 0.9 + p.z * 1.45;
        ctx.globalAlpha = tDisperse > 0 ? 0.9 * (1 - tDisperse) : 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed < TOTAL_DURATION_MS) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="loader-fallback-canvas" aria-hidden />;
}

export default function ThreeLoader({ onComplete }: ThreeLoaderProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  const [isLeaving, setIsLeaving] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 2000);
    camera.position.set(0, 0, 520);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      setWebglReady(true);
    } catch {
      // Keep a visible fallback overlay if WebGL context creation fails.
      const fallbackTimer = window.setTimeout(() => {
        setIsLeaving(true);
        window.setTimeout(() => onCompleteRef.current(), 320);
      }, TOTAL_DURATION_MS - 320);
      return () => {
        window.clearTimeout(fallbackTimer);
      };
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    const dotCount = 4600;
    const positions = new Float32Array(dotCount * 3);
    const color = new THREE.Color("#84efab");
    const colors = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i += 1) {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    const haloMaterial = new THREE.PointsMaterial({
      size: 4.2,
      color: new THREE.Color("#84efab"),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const haloPoints = new THREE.Points(geometry, haloMaterial);
    scene.add(haloPoints);

    const dots: DotDatum[] = Array.from({ length: dotCount }, () => ({
      current: new THREE.Vector3((Math.random() - 0.5) * 900, (Math.random() - 0.5) * 520, (Math.random() - 0.5) * 120),
      target: new THREE.Vector3(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        2.2 + Math.random() * 3.4
      )
    }));

    const setupTargetsFromText = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const offscreen = document.createElement("canvas");
      offscreen.width = Math.max(760, Math.floor(width * 0.72));
      offscreen.height = Math.max(220, Math.floor(height * 0.28));
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, offscreen.width, offscreen.height);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${Math.floor(offscreen.height * 0.44)}px Inter, sans-serif`;
      ctx.fillText("ROBRO", offscreen.width / 2, offscreen.height / 2);

      const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height).data;
      const sampleStep = 2;
      const candidates: Array<{ x: number; y: number }> = [];

      for (let y = 0; y < offscreen.height; y += sampleStep) {
        for (let x = 0; x < offscreen.width; x += sampleStep) {
          const pixelIndex = (y * offscreen.width + x) * 4;
          const luminance = imageData[pixelIndex] + imageData[pixelIndex + 1] + imageData[pixelIndex + 2];
          if (luminance > 60) {
            candidates.push({ x, y });
          }
        }
      }

      const viewScale = Math.min(width / 1600, height / 900, 1);
      const targetScale = 0.72 + viewScale * 0.22;

      for (let i = 0; i < dotCount; i += 1) {
        const randomSpot = candidates[Math.floor(Math.random() * candidates.length)];
        if (randomSpot) {
          dots[i].target.set(
            (randomSpot.x - offscreen.width / 2) * targetScale,
            (offscreen.height / 2 - randomSpot.y) * targetScale,
            (Math.random() - 0.5) * 44
          );
        } else {
          dots[i].target.set(
            (Math.random() - 0.5) * 260 * targetScale,
            (Math.random() - 0.5) * 90 * targetScale,
            (Math.random() - 0.5) * 48
          );
        }
      }

    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      setupTargetsFromText();
    };

    resize();
    window.addEventListener("resize", resize);

    const startedAt = performance.now();
    let raf = 0;

    const animate = () => {
      const elapsed = performance.now() - startedAt;
      const tAssemble = smoothstep(elapsed / ASSEMBLE_DURATION_MS);
      const disperseStart = ASSEMBLE_DURATION_MS + HOLD_DURATION_MS;
      const tDisperse = smoothstep((elapsed - disperseStart) / DISPERSE_DURATION_MS);

      for (let i = 0; i < dotCount; i += 1) {
        const dot = dots[i];
        if (tDisperse <= 0) {
          const assembleStrength = 0.032 + tAssemble * 0.09;
          dot.current.lerp(dot.target, assembleStrength);
          const drift = Math.sin(elapsed * 0.00092 + i * 0.07) * (0.12 + tAssemble * 0.26);
          dot.current.z += drift;
        } else {
          const flyStrength = 1.7 + tDisperse * 4.6;
          dot.current.x += dot.velocity.x * 0.34;
          dot.current.y += dot.velocity.y * 0.34;
          dot.current.z += dot.velocity.z * flyStrength;
        }

        positions[i * 3] = dot.current.x;
        positions[i * 3 + 1] = dot.current.y;
        positions[i * 3 + 2] = dot.current.z;
      }
      geometry.attributes.position.needsUpdate = true;

      points.rotation.y = Math.sin(elapsed * 0.00022) * 0.1;
      points.rotation.x = Math.cos(elapsed * 0.00016) * 0.055;
      haloPoints.rotation.copy(points.rotation);
      material.opacity = tDisperse > 0 ? 0.96 * (1 - tDisperse) : 0.96;
      haloMaterial.opacity = tDisperse > 0 ? 0.22 * (1 - tDisperse) : 0.22;
      camera.position.z = 530 + Math.sin(elapsed * 0.00025) * 16;

      renderer.render(scene, camera);

      if (elapsed < TOTAL_DURATION_MS) {
        raf = requestAnimationFrame(animate);
      } else {
        setIsLeaving(true);
        window.setTimeout(() => onCompleteRef.current(), 260);
      }
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      haloMaterial.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`loader-overlay ${isLeaving ? "loader-overlay--leaving" : ""}`}>
      {!webglReady ? (
        <FallbackParticleText />
      ) : null}
      <div ref={mountRef} className="loader-canvas" />
      <p className="loader-label">&gt; LOADING_ROBRO.md</p>
    </div>
  );
}
