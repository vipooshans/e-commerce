import { useEffect, useRef } from 'react';

const COLORS = ['#7C3AED', '#EC4899', '#3B82F6', '#F97316', '#FBBF24', '#F472B6', '#60A5FA'];

const Confetti = ({ active, onDone }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5,
      r: Math.random() * 6 + 3,
      d: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.random() * 10 - 5,
      tiltSpeed: Math.random() * 0.1 + 0.05,
      angle: 0,
    }));

    let elapsed = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.angle += p.tiltSpeed;
        p.y += p.d;
        p.x += Math.sin(p.angle) * 2;
        p.tilt = Math.sin(p.angle - 0.5) * 12;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, p.tilt * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      elapsed++;
      if (elapsed < 150) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone && onDone();
      }
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, onDone]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}
    />
  );
};

export default Confetti;
