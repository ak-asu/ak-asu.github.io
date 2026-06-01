const PARTICLES = [
  { left: "7%", height: 110, duration: 3.1, delay: 0 },
  { left: "16%", height: 80, duration: 4.4, delay: -1.2 },
  { left: "28%", height: 150, duration: 2.8, delay: -2.5 },
  { left: "42%", height: 95, duration: 5.0, delay: -0.7 },
  { left: "58%", height: 130, duration: 3.6, delay: -3.1 },
  { left: "71%", height: 75, duration: 4.1, delay: -1.8 },
  { left: "83%", height: 120, duration: 2.9, delay: -2.0 },
  { left: "93%", height: 100, duration: 3.8, delay: -0.4 },
];

export function ParticlesBg() {
  return (
    <div className="particles-bg" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            height: `${p.height}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
