'use client';

import { Copy } from 'lucide-react';
import { Button } from './ui/button';
import { useRef } from 'react';

export default function CopyButton(props: {
  textToCopy?: string;
  colors?: string[];
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleCopyToClipboard(textToCopy: string) {
    navigator.clipboard.writeText(textToCopy);
    triggerCanvasConfetti();
  }

  function triggerCanvasConfetti() {
    const DECAY = 1.2;
    const SPREAD = 80;
    const GRAVITY = 1000;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;

    const dpr = window.devicePixelRatio || 1;
    function resize() {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      rotation: number;
      rotationSpeed: number;
    };

    const particles: Particle[] = [];
    const count = 14 + Math.floor(Math.random() * 8);

    const DEFAULT_COLORS = ['#ffed00', '#fffbcc', '#d2e1e6', '#2e6c7a'];
    const palette =
      props.colors && props.colors.length ? props.colors : DEFAULT_COLORS;

    for (let i = 0; i < count; i++) {
      const angle = (-90 + (Math.random() - 0.5) * SPREAD) * (Math.PI / 180);
      const speed = 200 + Math.random() * 260; // px/s
      const vx = Math.cos(angle) * speed * (0.8 + Math.random() * 0.8);
      const vy = Math.sin(angle) * speed * (0.8 + Math.random() * 0.8);
      const size = 6 + Math.random() * 8;
      const color = palette[i % palette.length];
      particles.push({
        x: startX,
        y: startY,
        vx,
        vy,
        size,
        color,
        life: DECAY + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let last = performance.now();
    function frame(now: number) {
      const dt = (now - last) / 1000;
      last = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;
        p.life -= dt;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        const alpha = Math.max(0, Math.min(1, p.life / DECAY));
        ctx.globalAlpha = alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        if (p.y > window.innerHeight + 100 || p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        requestAnimationFrame(frame);
      } else {
        window.removeEventListener('resize', resize);
        if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
      }
    }

    requestAnimationFrame(frame);
  }

  return (
    <Button
      type="button"
      ref={buttonRef}
      variant="ghost"
      size="icon-sm"
      onClick={() => handleCopyToClipboard(props.textToCopy || ':)')}
    >
      <Copy />
    </Button>
  );
}
