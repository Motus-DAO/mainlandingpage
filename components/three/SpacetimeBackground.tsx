"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Theme = "dark" | "white" | "matrix";

function createDotTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function themePalette(colorTheme: Theme): number[][] {
  if (colorTheme === "white") {
    return [
      [1.0, 1.0, 1.0],
      [0.95, 0.95, 1.0],
      [0.85, 0.85, 0.95],
    ];
  }

  if (colorTheme === "matrix") {
    return [
      [0.2, 1.0, 0.3],
      [0.1, 0.9, 0.2],
      [0.5, 1.0, 0.6],
    ];
  }

  return [
    [0.2, 0.4, 1.0],
    [0.6, 0.2, 1.0],
    [1.0, 0.2, 0.8],
    [0.5, 0.6, 1.0],
    [0.8, 0.5, 1.0],
    [1.0, 0.5, 0.9],
  ];
}

function DotSphere({ colorTheme = "dark" }: { colorTheme?: Theme }) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const pointsData = useRef<THREE.Vector3[]>([]);

  const { positions, colors, radius } = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(50, 28);
    const source = base.attributes.position.array as ArrayLike<number>;

    const vectors: THREE.Vector3[] = [];
    for (let i = 0; i < source.length; i += 3) {
      vectors.push(new THREE.Vector3(source[i], source[i + 1], source[i + 2]));
    }

    const targetCount = 2500;
    const step = Math.max(1, Math.floor(vectors.length / targetCount));
    const sampled = vectors.filter((_, idx) => idx % step === 0).slice(0, targetCount);

    const palette = themePalette(colorTheme);
    const pos = new Float32Array(sampled.length * 3);
    const col = new Float32Array(sampled.length * 3);

    sampled.forEach((v, i) => {
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
      const c = palette[i % palette.length];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    });

    base.dispose();
    return { positions: pos, colors: col, radius: 50, sampled };
  }, [colorTheme]);

  const texture = useMemo(() => createDotTexture(), []);

  useEffect(() => {
    if (!pointsRef.current) return;

    const original = [] as THREE.Vector3[];
    const active = [] as THREE.Vector3[];
    for (let i = 0; i < positions.length; i += 3) {
      const v = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      original.push(v.clone());
      active.push(v);
    }
    pointsData.current = active;

    const tweens = active.map((vector, i) => {
      const source = original[i];
      const proxy = { x: source.x, z: source.z };
      return gsap.to(proxy, {
        duration: 4,
        x: 0,
        z: 0,
        repeat: -1,
        yoyo: true,
        ease: "back.out",
        delay: Math.abs(source.y / radius) * 2,
        onUpdate: () => {
          vector.x = proxy.x;
          vector.z = proxy.z;
          vector.y = source.y;
        },
      });
    });

    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, [positions, radius]);

  useFrame(() => {
    const points = pointsRef.current;
    if (!points) return;

    const attr = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const vectors = pointsData.current;

    for (let i = 0; i < vectors.length; i++) {
      const v = vectors[i];
      attr.array[i * 3] = v.x;
      attr.array[i * 3 + 1] = v.y;
      attr.array[i * 3 + 2] = v.z;
    }
    attr.needsUpdate = true;
  });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!pointsRef.current) return;
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      gsap.to(pointsRef.current.rotation, {
        x: mouseY * Math.PI * 1.2,
        z: mouseX * Math.PI * 0.8,
        duration: 2,
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTexture: { value: texture },
        }}
        vertexShader={`
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 1.0;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform sampler2D uTexture;
          varying vec3 vColor;
          void main() {
            vec4 tex = texture2D(uTexture, gl_PointCoord);
            gl_FragColor = vec4(vColor, tex.a);
          }
        `}
      />
    </points>
  );
}

export default function SpacetimeBackground({
  children,
  colorTheme = "dark",
}: {
  children: React.ReactNode;
  colorTheme?: Theme;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="relative min-h-screen">
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 z-0">
          <Canvas camera={{ fov: 50, position: [0, 0, 80] }}>
            <DotSphere colorTheme={colorTheme} />
          </Canvas>
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle 600px at 30% 40%, rgba(147,51,234,0.18), transparent 70%), radial-gradient(circle 400px at 70% 60%, rgba(236,72,153,0.12), transparent 70%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
