'use client';
import React, { useRef, useEffect, useState } from 'react';
// @ts-ignore - Three.js types issue
import * as THREE from 'three';
import { gsap, Back } from 'gsap';

interface SpacetimeBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  colorTheme?: 'white' | 'dark' | 'matrix';
}

const SpacetimeBackground: React.FC<SpacetimeBackgroundProps> = ({ className = '', children, colorTheme: initialColorTheme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dotsRef = useRef<THREE.Points | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [colorTheme] = useState<'white' | 'dark' | 'matrix'>(initialColorTheme);

  useEffect(() => {
    if (!canvasRef.current) return;

    gsap.registerPlugin(Back);

    const canvas = canvasRef.current;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 0, 80);

    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 32;
    textureCanvas.height = 32;
    const ctx = textureCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const dotTexture = new THREE.CanvasTexture(textureCanvas);

    const radius = 50;
    const sphereGeom = new THREE.IcosahedronGeometry(radius, 28);

    const bufferDotsGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(sphereGeom.attributes.position.count * 3);
    const colors = new Float32Array(sphereGeom.attributes.position.count * 3);

    const colorChoices: number[][] = colorTheme === 'white'
      ? [[1, 1, 1], [0.9, 0.9, 1], [1, 0.9, 1], [0.95, 0.95, 0.95], [0.9, 1, 0.9], [1, 0.95, 0.9]]
      : colorTheme === 'matrix'
        ? [[0, 1, 0], [0.2, 0.8, 0.2], [0, 0.6, 0], [0.1, 1, 0.1], [0, 0.8, 0], [0.3, 1, 0.3]]
        : [[0.2, 0.4, 1], [0.6, 0.2, 1], [1, 0.2, 0.8], [0.4, 0.6, 1], [0.8, 0.3, 1], [1, 0.4, 0.9]];

    for (let i = 0; i < sphereGeom.attributes.position.count; i++) {
      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];
    }

    function updateDot(index: number, vector: THREE.Vector3) {
      positions[index * 3] = vector.x;
      positions[index * 3 + 1] = vector.y;
      positions[index * 3 + 2] = vector.z;
    }

    function animateDot(index: number, vector: THREE.Vector3) {
      gsap.to(vector, {
        duration: 4,
        x: 0,
        z: 0,
        ease: 'back.out',
        delay: Math.abs(vector.y / radius) * 2,
        repeat: -1,
        yoyo: true,
        yoyoEase: 'back.out',
        onUpdate: () => updateDot(index, vector),
      });
    }

    for (let i = 0; i < sphereGeom.attributes.position.count; i++) {
      const v = new THREE.Vector3(
        sphereGeom.attributes.position.getX(i),
        sphereGeom.attributes.position.getY(i),
        sphereGeom.attributes.position.getZ(i)
      );
      animateDot(i, v);
      v.toArray(positions, i * 3);
    }

    bufferDotsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    bufferDotsGeom.setAttribute('dotColor', new THREE.BufferAttribute(colors, 3));

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: { dotTexture: { value: dotTexture } },
      vertexShader: `
        attribute vec3 dotColor;
        varying vec3 vColor;
        void main() {
          vColor = dotColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 1.0;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D dotTexture;
        varying vec3 vColor;
        void main() {
          vec4 textureColor = texture2D(dotTexture, gl_PointCoord);
          if (textureColor.a < 0.3) discard;
          gl_FragColor = vec4(vColor, 0.8) * textureColor;
        }
      `,
      transparent: true,
      vertexColors: true,
    });

    const dots = new THREE.Points(bufferDotsGeom, shaderMaterial);
    scene.add(dots);
    dotsRef.current = dots;

    const handleMouseMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth) - 0.5;
      const my = (e.clientY / window.innerHeight) - 0.5;
      if (dotsRef.current) {
        gsap.to(dotsRef.current.rotation, {
          duration: 2,
          x: my * Math.PI * 1.2,
          z: mx * Math.PI * 0.8,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      if (dotsRef.current) dotsRef.current.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    gsap.ticker.add(render);

    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(render);
      renderer.dispose();
      dotsRef.current?.geometry.dispose();
    };
  }, [colorTheme]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
};

export default SpacetimeBackground;
