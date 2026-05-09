'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01ハヒフヘホマミムメモ'.split('');

export function CyberChrome() {
  return (
    <>
      <div className="cyber-grid-bg" aria-hidden />
      <MatrixCanvas />
      <NeuralCanvas />
      <SystemBar />
    </>
  );
}

function MatrixCanvas() {
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

    let drops: number[] = [];
    let interval = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array(Math.floor(canvas.width / 14)).fill(1);
    }

    resize();
    window.addEventListener('resize', resize);

    interval = window.setInterval(() => {
      const cols = Math.floor(canvas.width / 14);
      if (drops.length !== cols) drops = Array(cols).fill(1);

      context.fillStyle = 'rgba(2,6,8,0.05)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#00ff41';
      context.font = '12px monospace';

      drops.forEach((y, index) => {
        context.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? '0', index * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[index] = 0;
        drops[index] = (drops[index] ?? 0) + 1;
      });
    }, 50);

    return () => {
      window.removeEventListener('resize', resize);
      window.clearInterval(interval);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return <canvas ref={canvasRef} className="cyber-canvas cyber-matrix" aria-hidden />;
}

function NeuralCanvas() {
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

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    let animation = 0;
    const distance = 160;

    function draw() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          if (!a || !b) continue;

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < distance) {
            context.beginPath();
            context.strokeStyle = `rgba(0,255,242,${(1 - d / distance) * 0.35})`;
            context.lineWidth = 0.5;
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        const glow = 0.5 + 0.5 * Math.sin(node.pulse);
        context.beginPath();
        context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(0,255,242,${0.4 + glow * 0.6})`;
        context.fill();
      });

      animation = window.requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animation);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return <canvas ref={canvasRef} className="cyber-canvas cyber-neural" aria-hidden />;
}

function SystemBar() {
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(
          now.getUTCSeconds(),
        ).padStart(2, '0')}`,
      );
    }

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] hidden items-center gap-8 border-t border-border bg-bg/90 px-6 py-2 font-mono text-[9px] uppercase tracking-[2px] text-fg-muted backdrop-blur md:flex">
      <SystemItem label="SYS" value="ONLINE" />
      <SystemItem label="LOC" value="NANGAL.PB.IN" />
      <SystemItem label="MODE" value="REMOTE.ASYNC" />
      <SystemItem label="FOCUS" value="LLM.INFRA" />
      <div className="ml-auto">
        <SystemItem label="UTC" value={time} />
      </div>
    </div>
  );
}

function SystemItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-success">{label}</span>
      <span className="text-accent/30">::</span>
      <span>{value}</span>
    </div>
  );
}
