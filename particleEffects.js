// Particles Effect as a reusable module
(function () {
    // Utility function to generate random numbers
    function random(min, max) {
        if (Array.isArray(min)) {
            return min[Math.floor(Math.random() * min.length)];
        }
        if (typeof max !== 'undefined') {
            return min + Math.random() * (max - min);
        }
        return Math.random() * min;
    }

    // Particle class
    function Particle(x, y, radius) {
        this.init(x, y, radius);
    }

    Particle.prototype = {
        init: function (x, y, radius) {
            this.alive = true;

            this.radius = radius || 10;
            this.wander = 0.15;
            this.theta = random(Math.PI * 2);
            this.drag = 0.92;
            this.color = '#fff';

            this.x = x || 0.0;
            this.y = y || 0.0;

            this.vx = 0.0;
            this.vy = 0.0;
        },

        move: function () {
            this.x += this.vx;
            this.y += this.vy;

            this.vx *= this.drag;
            this.vy *= this.drag;

            this.theta += random(-0.5, 0.5) * this.wander;
            this.vx += Math.sin(this.theta) * 0.1;
            this.vy += Math.cos(this.theta) * 0.1;

            this.radius *= 0.96;
            this.alive = this.radius > 0.5;
        },

        draw: function (ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    };

    // Particles Effect class
    class ParticlesEffect {
        constructor({ container = document.body, maxParticles = 280, colors = ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423'] } = {}) {
            this.container = container;
            this.maxParticles = maxParticles;
            this.colors = colors;
            this.particles = [];
            this.pool = [];

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.container.appendChild(this.canvas);

            this.resize();
            window.addEventListener('resize', this.resize.bind(this));

            this.mouse = { x: 0, y: 0 };
            this.container.addEventListener('mousemove', this.onMouseMove.bind(this));

            this.container.style.position = 'relative';
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = 0;
            this.canvas.style.left = 0;
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';

            this.animate();
        }

        resize() {
            this.canvas.width = this.container.clientWidth;
            this.canvas.height = this.container.clientHeight;
        }

        spawn(x, y) {
            let particle, theta, force;

            if (this.particles.length >= this.maxParticles) this.pool.push(this.particles.shift());

            particle = this.pool.length ? this.pool.pop() : new Particle();
            particle.init(x, y, random(3, 15));

            particle.wander = random(0.5, 2.0);
            particle.color = random(this.colors);
            particle.drag = random(0.9, 0.99);

            theta = random(Math.PI * 2);
            force = random(2, 8);

            particle.vx = Math.sin(theta) * force;
            particle.vy = Math.cos(theta) * force;

            this.particles.push(particle);
        }

        onMouseMove(event) {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left; // Align x-coordinate to mouse
            const y = event.clientY - rect.top;  // Align y-coordinate to mouse

            // Adjust for retina displays and alignment issues
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            const adjustedX = x * scaleX;
            const adjustedY = y * scaleY;

            for (let i = 0, n = random(2, 5); i < n; i++) {
                this.spawn(adjustedX, adjustedY);
            }
        }
        

        animate() {
            requestAnimationFrame(this.animate.bind(this));
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.globalCompositeOperation = 'lighter';

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const particle = this.particles[i];

                if (particle.alive) {
                    particle.move();
                    particle.draw(this.ctx);
                } else {
                    this.pool.push(this.particles.splice(i, 1)[0]);
                }
            }
        }
    }

    // Expose the ParticlesEffect globally
    window.ParticlesEffect = ParticlesEffect;
})();

// Example usage:
new ParticlesEffect({
    maxParticles: 200
});
