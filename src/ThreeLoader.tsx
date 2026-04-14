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

const ASSEMBLE_DURATION_MS = 4600;
const DISPERSE_DURATION_MS = 1900;
const TOTAL_DURATION_MS = ASSEMBLE_DURATION_MS + DISPERSE_DURATION_MS;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export default function ThreeLoader({ onComplete }: ThreeLoaderProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const timer = window.setTimeout(() => onCompleteRef.current(), 200);
      return () => window.clearTimeout(timer);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 2000);
    camera.position.set(0, 0, 520);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    const dotCount = 3200;
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
      const tAssemble = clamp01(elapsed / ASSEMBLE_DURATION_MS);
      const tDisperse = clamp01((elapsed - ASSEMBLE_DURATION_MS) / DISPERSE_DURATION_MS);

      for (let i = 0; i < dotCount; i += 1) {
        const dot = dots[i];
        if (tDisperse <= 0) {
          const assembleStrength = 0.055 + tAssemble * 0.12;
          dot.current.lerp(dot.target, assembleStrength);
          const drift = Math.sin(elapsed * 0.001 + i * 0.07) * 0.25;
          dot.current.z += drift;
        } else {
          const flyStrength = 2 + tDisperse * 3.8;
          dot.current.x += dot.velocity.x * 0.28;
          dot.current.y += dot.velocity.y * 0.28;
          dot.current.z += dot.velocity.z * flyStrength;
        }

        positions[i * 3] = dot.current.x;
        positions[i * 3 + 1] = dot.current.y;
        positions[i * 3 + 2] = dot.current.z;
      }
      geometry.attributes.position.needsUpdate = true;

      points.rotation.y = Math.sin(elapsed * 0.00032) * 0.13;
      points.rotation.x = Math.cos(elapsed * 0.00022) * 0.07;
      haloPoints.rotation.copy(points.rotation);
      material.opacity = tDisperse > 0 ? 0.95 * (1 - tDisperse) : 0.95;
      haloMaterial.opacity = tDisperse > 0 ? 0.18 * (1 - tDisperse) : 0.18;

      renderer.render(scene, camera);

      if (elapsed < TOTAL_DURATION_MS) {
        raf = requestAnimationFrame(animate);
      } else {
        setIsLeaving(true);
        window.setTimeout(() => onCompleteRef.current(), 320);
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
      <div ref={mountRef} className="loader-canvas" />
      <p className="loader-label">&gt; LOADING_ROBRO.md</p>
    </div>
  );
}
