export const confetti = {
  maxCount: 150, // Max confetti count
  speed: 2, // Particle animation speed
  frameInterval: 15, // Animation frame interval in milliseconds
  alpha: 1.0, // Alpha opacity
  gradient: false, // Use gradient for particles
};

let particles: any[] = [];
let streamingConfetti = false;
let animationTimer: any = null;
let waveAngle = 0;
let context: CanvasRenderingContext2D | null | any;

function resetParticle(particle: any, width: number, height: number) {
  const colors = [
    "rgba(30,144,255,",
    "rgba(107,142,35,",
    "rgba(255,215,0,",
    "rgba(255,192,203,",
    "rgba(106,90,205,",
    "rgba(173,216,230,",
    "rgba(238,130,238,",
    "rgba(152,251,152,",
    "rgba(70,130,180,",
    "rgba(244,164,96,",
    "rgba(210,105,30,",
    "rgba(220,20,60,",
  ];
  particle.color =
    colors[Math.floor(Math.random() * colors.length)] + (confetti.alpha + ")");
  particle.x = Math.random() * width;
  particle.y = Math.random() * height - height;
  particle.diameter = Math.random() * 10 + 5;
  particle.tilt = Math.random() * 10 - 10;
  particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
  particle.tiltAngle = Math.random() * Math.PI;
  return particle;
}

function drawParticles() {
  if (context) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
      context?.beginPath();
      context.lineWidth! = particle.diameter;
      const x2 = particle.x + particle.tilt;
      const y2 = particle.y + particle.tilt + particle.diameter / 2;
      context.strokeStyle = particle.color;
      context.moveTo(particle.x + particle.diameter / 2, particle.y);
      context.lineTo(x2, y2);
      context.stroke();
    });
  }
}

function updateParticles() {
  waveAngle += 0.01;
  particles = particles.filter((particle) => {
    particle.tiltAngle += particle.tiltAngleIncrement;
    particle.x += Math.sin(waveAngle);
    particle.y +=
      (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
    return particle.y < window.innerHeight;
  });
}

function runAnimation() {
  if (!context) return;
  drawParticles();
  updateParticles();
  animationTimer = requestAnimationFrame(runAnimation);
}

export function startConfetti() {
  const canvas = document.getElementById(
    "confetti-canvas"
  ) as HTMLCanvasElement;
  if (!canvas) {
    const newCanvas = document.createElement("canvas");
    newCanvas.id = "confetti-canvas";
    newCanvas.style.position = "fixed";
    newCanvas.style.top = "0";
    newCanvas.style.left = "0";
    newCanvas.width = window.innerWidth;
    newCanvas.height = window.innerHeight;
    newCanvas.style.pointerEvents = "none";
    document.body.appendChild(newCanvas);
    context = newCanvas.getContext("2d");
  }
  if (particles.length === 0) {
    for (let i = 0; i < confetti.maxCount; i++) {
      particles.push(resetParticle({}, window.innerWidth, window.innerHeight));
    }
  }
  if (!streamingConfetti) {
    streamingConfetti = true;
    runAnimation();
  }
}

export function stopConfetti() {
  streamingConfetti = false;
  if (context) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
  particles = [];
}
