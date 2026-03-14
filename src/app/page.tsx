"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

function SectionReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!mountRef.current || !canvasRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 1600;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 16;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x9333ea,
      size: 0.025,
      transparent: true,
      opacity: 0.55,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      particles.rotation.y += 0.00035;
      particles.rotation.x += 0.0001;
      renderer.render(scene, camera);
    };

    animate();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export default function Home() {
  const proofRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: proofRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5ff]">
      <style jsx>{`
        .hero-headline {
          font-family: 'Jura', sans-serif !important;
        }
      `}</style>
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-24 md:px-12">
        <HeroCanvas />
        <div className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 20%, rgba(99, 102, 241, 0.18), transparent 60%), radial-gradient(60% 60% at 80% 30%, rgba(236, 72, 153, 0.16), transparent 60%), radial-gradient(70% 70% at 50% 80%, rgba(147, 51, 234, 0.18), transparent 60%)",
          }} />

        <motion.div
          className="relative z-10 mx-auto max-w-5xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="mb-5 text-sm uppercase tracking-[0.28em] text-[#b8a8ff]"
            style={{ fontFamily: "Jura, sans-serif" }}
          >
            MotusDAO • AI-Human Mental Health Infrastructure
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            className="hero-headline mx-auto max-w-4xl text-4xl font-extrabold leading-tight md:text-7xl"
            style={{ fontFamily: "Jura, sans-serif" }}
          >
            Reduce Operational Drag. Protect Client Trust. Scale Your Practice.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto mt-6 max-w-2xl text-lg text-[#ddd6ff] md:text-xl"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            MotusDAO gives independent psychologists in LATAM one system for AI-assisted workflows, privacy-first data handling, and cross-chain payment coordination.
          </motion.p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="#cta"
              className="rounded-full bg-gradient-to-r from-[#9333ea] to-[#ec4899] px-8 py-3 text-base font-semibold shadow-[0_0_35px_rgba(236,72,153,0.45)]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Request Demo
            </motion.a>
            <a
              href="#how"
              className="rounded-full border border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_100%)] px-8 py-3 text-base font-medium backdrop-blur-[20px]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              View Workflow
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4"
          >
            {[
              ["100+", "Psychologists onboarded"],
              ["$700/mo", "Volumen mensual"],
              ["2", "Active chains"],
              ["Live", "Shipping cadence"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl px-4 py-3"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <p className="text-2xl font-bold text-[#f0a4ff]" style={{ fontFamily: "Jura, sans-serif" }}>{value}</p>
                <p className="text-xs text-white/70" style={{ fontFamily: "Inter, sans-serif" }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 py-16 md:grid-cols-3 md:px-12">
        {[
          "Manual workflows consume clinical focus.",
          "Scattered tools increase privacy and compliance risk.",
          "No unified system for measurable outcomes and growth.",
        ].map((pain) => (
          <SectionReveal
            key={pain}
            className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl"
          >
            <p className="text-lg font-semibold text-[#f3edff]">{pain}</p>
          </SectionReveal>
        ))}
      </section>

      <SectionReveal className="mx-auto max-w-6xl px-6 py-12 md:px-12" >
        <h2 className="text-3xl font-bold md:text-5xl">Design DNA Merge: Legacy + Product</h2>
        <p className="mt-3 max-w-3xl text-[#cbc5eb]">
          We merge editorial storytelling from the Wix era with the futuristic product-grade glassmorphism of the current app.
        </p>
      </SectionReveal>

      <section ref={proofRef} className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-2 md:px-12">
        {[
          ["/references/wix-home.jpg", "Legacy editorial layout (Wix reference)"],
          ["/references/wix-course.jpg", "Course + content structure and trust framing"],
          ["/references/app-dark.jpg", "Current dark app aesthetic and glassmorphism"],
          ["/references/app-light.jpg", "Light mode contrast and hierarchy testing"],
        ].map(([src, label], i) => (
          <motion.div
            key={src}
            style={{ y }}
            className="rounded-2xl border border-white/15 bg-white/5 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
          >
            <div className="overflow-hidden rounded-xl">
              <Image src={src} alt={label} width={1600} height={900} className="h-auto w-full object-cover" />
            </div>
            <p className="mt-3 text-sm text-[#d5cfff]">0{i + 1}. {label}</p>
          </motion.div>
        ))}
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <SectionReveal>
          <h2 className="text-3xl font-bold md:text-5xl">How It Works</h2>
        </SectionReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["01", "Connect", "Onboard your practice and workflow context in minutes."],
            ["02", "Augment", "Deploy AI assistance for notes, operations, and coordination."],
            ["03", "Scale", "Use data + trust rails to grow practice outcomes responsibly."],
          ].map(([n, t, d]) => (
            <SectionReveal key={n} className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <p className="text-xs tracking-[0.2em] text-[#9ca3ff]">{n}</p>
              <h3 className="mt-2 text-2xl font-bold">{t}</h3>
              <p className="mt-3 text-[#cbc5eb]">{d}</p>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <SectionReveal className="rounded-3xl border border-white/15 bg-gradient-to-r from-white/5 to-white/0 p-8">
          <h2 className="text-3xl font-bold md:text-5xl">Proof of Execution</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              ["100+", "Psychologists onboarded"],
              ["$700/mo", "Transaction volume tracked"],
              ["2", "Active chains (Celo + Solana)"],
              ["3", "Live product surfaces"],
            ].map(([n, d]) => (
              <div key={n} className="rounded-2xl border border-white/10 bg-black/30 p-5 text-center">
                <p className="text-3xl font-extrabold text-[#f0a4ff]">{n}</p>
                <p className="mt-1 text-sm text-[#cbc5eb]">{d}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </section>

      <section id="cta" className="mx-auto max-w-5xl px-6 py-20 md:px-12">
        <SectionReveal className="rounded-3xl border border-white/15 bg-white/5 p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold md:text-5xl">Ready to Upgrade Your Practice?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#cbc5eb]">
            Request a tailored demo and see how MotusDAO can reduce operational drag while preserving trust and privacy.
          </p>
          <form className="mx-auto mt-8 grid max-w-2xl gap-3 md:grid-cols-3">
            <input
              className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 outline-none placeholder:text-white/50"
              placeholder="Full Name"
            />
            <input
              className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 outline-none placeholder:text-white/50"
              placeholder="Email"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#9333ea] to-[#ec4899] px-5 py-3 font-semibold"
            >
              Request Demo
            </button>
          </form>
        </SectionReveal>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/60">
        © 2026 MotusDAO Technology • AI + Mental Health + Web3 Infrastructure
      </footer>
    </div>
  );
}
