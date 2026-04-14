// --- CUSTOM CURSOR ---
const cursorDot = document.querySelector(".cursor-dot");
const cursorGlow = document.querySelector(".cursor-glow");
const interactiveElements = document.querySelectorAll("a, button, .skill-card, .project-card, .social-icon");

window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot exactly on cursor
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Glow follows with slight delay
    cursorGlow.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Hover effect for interactive elements
interactiveElements.forEach(el => {
    el.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hover");
    });
    el.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hover");
    });
});

// --- TYPEWRITER EFFECT ---
const phrases = ["C++ Developer", "Problem Solver", "Future Software Engineer"];
const typingEl = document.getElementById("typing-text");
let phraseIndex = 0;
let letterIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
        typingEl.textContent = currentPhrase.substring(0, letterIndex - 1);
        letterIndex--;
        typeSpeed = 50;
    } else {
        typingEl.textContent = currentPhrase.substring(0, letterIndex + 1);
        letterIndex++;
        typeSpeed = 150;
    }

    if (!isDeleting && letterIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 1500; // Pause at end
    } else if (isDeleting && letterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; // Pause before next word
    }

    setTimeout(typeEffect, typeSpeed);
}
typeEffect();

// --- COSMIC BACKGROUND (CANVAS PARTICLES) ---
const canvas = document.getElementById("cosmic-canvas");
const ctx = canvas.getContext("2d");

let cw, ch;
function resizeCanvas() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const particles = [];
const PARTICLE_COUNT = Math.floor(cw * ch / 8000); // Responsive amount of particles

class Particle {
    constructor() {
        this.reset();
        // Disperse them initially
        this.z = Math.random() * cw;
    }

    reset() {
        this.x = (Math.random() - 0.5) * cw * 2;
        this.y = (Math.random() - 0.5) * ch * 2;
        this.z = cw; 
        this.radius = Math.random() * 1.5 + 0.5;
        // Colors: white, cyan, light purple
        const colors = ['#ffffff', '#00f3ff', '#e0e0ff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(speed) {
        this.z -= speed;
        if (this.z <= 0) {
            this.reset();
        }
    }

    draw() {
        // Perspective projection
        let px = (this.x / this.z) * (cw / 2) + cw / 2;
        let py = (this.y / this.z) * (ch / 2) + ch / 2;
        
        let size = (this.radius * cw) / this.z;

        if (px >= 0 && px <= cw && py >= 0 && py <= ch) {
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

// Mouse Parallax Offset
let mouseOffsetX = 0;
let mouseOffsetY = 0;
let baseSpeed = 2;

window.addEventListener('mousemove', (e) => {
    mouseOffsetX = (e.clientX / cw - 0.5) * 5;
    mouseOffsetY = (e.clientY / ch - 0.5) * 5;
    // Speed up slightly on mouse move to simulate warp
    baseSpeed = 4;
    setTimeout(() => { baseSpeed = 2; }, 500);
});

function animateParticles() {
    ctx.fillStyle = "rgba(5, 5, 15, 0.2)"; // Trail effect
    ctx.fillRect(0, 0, cw, ch);
    
    // Shift canvas origin for parallax
    ctx.save();
    ctx.translate(mouseOffsetX * 20, mouseOffsetY * 20);

    particles.forEach(p => {
        p.update(baseSpeed);
        p.draw();
    });

    ctx.restore();
    requestAnimationFrame(animateParticles);
}
animateParticles();


// --- SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER) ---
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const fadeUpElements = document.querySelectorAll(".skill-card, .timeline-content, .hologram-card, .stat-box");

const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0) translateX(0)";
            
            // If it's a progress bar container, animate it
            if(entry.target.classList.contains("skill-card")) {
                const bar = entry.target.querySelector(".fill");
                const width = bar.getAttribute("data-width");
                setTimeout(() => {
                    bar.style.width = width;
                }, 300);
            }

            // Stat Counter Animation
            if(entry.target.classList.contains("stat-box")) {
                const counter = entry.target.querySelector(".counter");
                if(counter) {
                    const target = +counter.getAttribute("data-target");
                    let count = 0;
                    const updateCount = () => {
                        const step = target / 50;
                        if(count < target) {
                            count += step;
                            counter.innerText = Math.ceil(count) + "+";
                            setTimeout(updateCount, 40);
                        } else {
                            counter.innerText = target + "+";
                        }
                    };
                    updateCount();
                }
            }

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize states before observing
fadeUpElements.forEach(el => {
    el.style.opacity = 0;
    if(el.classList.contains("timeline-content")) {
        el.style.transform = "translateX(-30px)";
    } else {
        el.style.transform = "translateY(50px)";
    }
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    scrollObserver.observe(el);
});

// --- ADVANCED 3D TILT EFFECT FOR PROJECT CARDS ---
const tiltCards = document.querySelectorAll(".project-card");

tiltCards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const tiltX = (y - centerY) / 10;
        const tiltY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.transition = "transform 0.5s ease";
    });
    
    card.addEventListener("mouseenter", () => {
        card.style.transition = "none";
    });
});

// --- ACTIVE NAV LINK HIGHLIGHTING ---
const sections = document.querySelectorAll(".zone");
const navLinks = document.querySelectorAll(".glass-nav a");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if(pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if(link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
});
