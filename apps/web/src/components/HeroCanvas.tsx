'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const contextValue = canvasElement.getContext('2d');
    if (!contextValue) return;

    const canvas: HTMLCanvasElement = canvasElement;
    const context: CanvasRenderingContext2D = contextValue;

    let frame = 0;
    let animation = 0;
    const points = Array.from({ length: 18 }, (_, index) => {
      const ring = index % 2 === 0 ? 1 : 0.55;
      const angle = (index / 18) * Math.PI * 2;
      return {
        x: Math.cos(angle) * ring,
        y: Math.sin(angle) * ring,
        z: index % 3 === 0 ? 0.55 : -0.55,
      };
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function project(point: (typeof points)[number], width: number, height: number) {
      const t = frame * 0.004;
      const cos = Math.cos(t);
      const sin = Math.sin(t);
      const x = point.x * cos - point.z * sin;
      const z = point.x * sin + point.z * cos;
      const y = point.y * Math.cos(t * 0.7) - z * Math.sin(t * 0.7) * 0.28;
      const depth = 1.8 + z;
      const scale = Math.min(width, height) * 0.28;

      return {
        x: width / 2 + (x / depth) * scale,
        y: height / 2 + (y / depth) * scale,
        alpha: Math.max(0.2, Math.min(0.92, 1 / depth)),
      };
    }

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);

      const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#f5f5f5';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4fd1c5';
      const mapped = points.map((point) => project(point, width, height));

      context.lineWidth = 1;
      for (let index = 0; index < mapped.length; index += 1) {
        const current = mapped[index];
        const next = mapped[(index + 1) % mapped.length];
        const skip = mapped[(index + 6) % mapped.length];
        if (!current || !next || !skip) continue;

        context.strokeStyle = `rgba(245,245,245,${0.16 * current.alpha})`;
        context.beginPath();
        context.moveTo(current.x, current.y);
        context.lineTo(next.x, next.y);
        context.stroke();

        if (index % 3 === 0) {
          context.strokeStyle = `rgba(79,209,197,${0.18 * current.alpha})`;
          context.beginPath();
          context.moveTo(current.x, current.y);
          context.lineTo(skip.x, skip.y);
          context.stroke();
        }
      }

      mapped.forEach((point, index) => {
        context.fillStyle = index % 3 === 0 ? accent : fg;
        context.globalAlpha = index % 3 === 0 ? 0.72 : 0.38;
        context.beginPath();
        context.arc(point.x, point.y, index % 3 === 0 ? 2.4 : 1.6, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;

      frame += 1;
      animation = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animation);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="h-72 w-full rounded-xl border border-border bg-bg-elev sm:h-96"
    />
  );
}
