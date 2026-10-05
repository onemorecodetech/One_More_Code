"use client";

import { useEffect, useRef } from "react";

/*
  Fundo interativo do site:
  - a imagem da marca fica fixa atrás de tudo e se move levemente com o mouse e a rolagem;
  - por cima, um campo de estrelas que brilham e se conectam ao cursor.
  Respeita quem prefere menos movimento (prefers-reduced-motion).
*/
export default function Background() {
  const imageRef = useRef(null);
  const glowRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let stars = [];
    let frame;

    const mouse = { x: -9999, y: -9999, active: false };
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    // Cores tiradas da própria logo: ciano → violeta → magenta
    const colors = ["#22d3ee", "#60a5fa", "#a78bfa", "#e879f9"];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(160, Math.floor((width * height) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        depth: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Suaviza o movimento do mouse (parallax)
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;

      const scroll = window.scrollY;

      if (imageRef.current) {
        imageRef.current.style.transform = `translate3d(${current.x * -18}px, ${
          current.y * -18 - scroll * 0.04
        }px, 0) scale(1.12)`;
      }

      for (const s of stars) {
        s.phase += s.speed;
        const ox = current.x * -30 * s.depth;
        const oy = current.y * -30 * s.depth - ((scroll * 0.15 * s.depth) % height);
        let x = s.x + ox;
        let y = s.y + oy;
        if (y < 0) y += height;

        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = mouse.active ? Math.max(0, 1 - dist / 160) : 0;

        // Linha até o cursor nas estrelas próximas (efeito constelação)
        if (near > 0) {
          ctx.strokeStyle = s.color;
          ctx.globalAlpha = near * 0.35;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        const twinkle = 0.45 + Math.sin(s.phase) * 0.35;
        ctx.globalAlpha = Math.min(1, twinkle + near * 0.8);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(x, y, s.r + near * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      frame = requestAnimationFrame(draw);
    }

    function onMove(event) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
      target.x = event.clientX / width - 0.5;
      target.y = event.clientY / height - 0.5;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${event.clientX - 300}px, ${
          event.clientY - 300
        }px, 0)`;
        glowRef.current.style.opacity = "1";
      }
    }

    function onLeave() {
      mouse.active = false;
      target.x = 0;
      target.y = 0;
      if (glowRef.current) glowRef.current.style.opacity = "0";
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      // Desenha uma vez, sem animação
      draw();
      cancelAnimationFrame(frame);
    } else {
      window.addEventListener("pointermove", onMove);
      document.documentElement.addEventListener("pointerleave", onLeave);
      draw();
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-[#0B0F1A]">
      <div
        ref={imageRef}
        className="absolute inset-0 bg-cover bg-center opacity-60 will-change-transform"
        style={{ backgroundImage: "url(/images/background.webp)", transform: "scale(1.12)" }}
      />

      {/* Escurece as bordas e o centro para o texto continuar legível */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,15,26,0.55)_0%,rgba(11,15,26,0.85)_70%,#0B0F1A_100%)]" />

      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Brilho suave que acompanha o cursor */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute top-0 left-0 h-[600px] w-[600px] rounded-full opacity-0 transition-opacity duration-500 bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,rgba(59,130,246,0.06)_40%,transparent_70%)]"
      />
    </div>
  );
}
