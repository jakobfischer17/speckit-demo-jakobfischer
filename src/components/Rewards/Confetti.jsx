import { useEffect, useRef, useCallback, useState } from 'react';
import './Confetti.css';

/**
 * Confetti celebration component using Canvas API.
 * Renders colorful confetti particles with physics simulation.
 * 
 * @param {Object} props
 * @param {boolean} props.active - Whether confetti should be showing
 * @param {number} props.duration - Duration in ms (default: 4000)
 * @param {number} props.particleCount - Number of particles (default: 150)
 * @param {Function} props.onComplete - Callback when animation completes
 */
function Confetti({
  active = false,
  duration = 4000,
  particleCount = 150,
  onComplete,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const startTimeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Confetti colors
  const colors = [
    '#667eea', // Primary purple
    '#764ba2', // Secondary purple
    '#f56565', // Red
    '#48bb78', // Green
    '#ed8936', // Orange
    '#4299e1', // Blue
    '#ecc94b', // Yellow
  ];

  // Create a single particle
  const createParticle = useCallback((canvas) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      color,
      size,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      opacity: 1,
    };
  }, [colors]);

  // Initialize particles
  const initParticles = useCallback((canvas) => {
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle(canvas));
    }
  }, [particleCount, createParticle]);

  // Draw a single particle
  const drawParticle = useCallback((ctx, particle) => {
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.fillStyle = particle.color;

    if (particle.shape === 'rect') {
      ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  // Update particle physics
  const updateParticle = useCallback((particle, canvas, elapsed) => {
    // Apply gravity
    particle.vy += 0.1;
    
    // Apply wind resistance
    particle.vx *= 0.99;
    
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Update rotation
    particle.rotation += particle.rotationSpeed;
    
    // Fade out near the end
    if (elapsed > duration * 0.7) {
      particle.opacity = 1 - ((elapsed - duration * 0.7) / (duration * 0.3));
    }
    
    // Wrap around horizontally
    if (particle.x < -particle.size) particle.x = canvas.width + particle.size;
    if (particle.x > canvas.width + particle.size) particle.x = -particle.size;
    
    return particle;
  }, [duration]);

  // Animation loop
  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.map(p => 
      updateParticle(p, canvas, elapsed)
    );

    particlesRef.current.forEach(p => drawParticle(ctx, p));

    // Continue animation or complete
    if (elapsed < duration) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Animation complete
      setIsVisible(false);
      onComplete?.();
    }
  }, [duration, updateParticle, drawParticle, onComplete]);

  // Start animation when active
  useEffect(() => {
    if (active) {
      setIsVisible(true);
      startTimeRef.current = null;

      const canvas = canvasRef.current;
      if (canvas) {
        // Set canvas size to window size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Initialize particles
        initParticles(canvas);
        
        // Start animation
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, animate, initParticles]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && isVisible) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas"
      aria-hidden="true"
    />
  );
}

export default Confetti;
