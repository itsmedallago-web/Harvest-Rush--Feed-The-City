// ============================================================
// endScene.js — "Thank you for playing" demo end screen
// ============================================================
const EndScene = (() => {
    let textIndex = 0;
    let textTimer = 0;
    let particles = [];
    let sparkleTimer = 0;

    const LETTER_TEXT = [
        'Dear Holly,',
        '',
        'We, the citizens of Greenfield,',
        'want to express our deepest',
        'gratitude for everything you',
        'have done for our city.',
        '',
        'Thanks to your hard work and',
        'dedication, our food supplies',
        'are restored and the city is',
        'thriving once again!',
        '',
        'You are our hero!',
        '',
        'With love,',
        'The Citizens of Greenfield'
    ];

    function init() {
        textIndex = 0;
        textTimer = 0;
        particles = [];
        sparkleTimer = 0;
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * 960,
                y: Math.random() * 640,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 1.5 - 0.5,
                size: Math.random() * 4 + 2,
                color: ['#f5c542', '#7dda5c', '#e85d75', '#87CEEB'][Math.floor(Math.random() * 4)],
                alpha: Math.random() * 0.6 + 0.4
            });
        }
    }

    function update(dt) {
        // Typewriter
        const fullText = LETTER_TEXT.join('\n');
        if (textIndex < fullText.length) {
            textTimer += dt;
            if (textTimer > 0.04) {
                textTimer = 0;
                textIndex++;
            }
        }

        // Particles
        sparkleTimer += dt;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = 0.3 + Math.sin(sparkleTimer * 2 + p.x * 0.01) * 0.3;
            if (p.y < -10) {
                p.y = 650;
                p.x = Math.random() * 960;
            }
        });
    }

    function render(ctx) {
        const W = 960, H = 640;

        // Dark starry background
        for (let y = 0; y < H; y++) {
            const t = y / H;
            ctx.fillStyle = `rgb(${Math.floor(10 + t * 10)},${Math.floor(12 + t * 15)},${Math.floor(30 + t * 20)})`;
            ctx.fillRect(0, y, W, 1);
        }

        // Particles
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.textAlign = 'center';

        // Thank you header
        ctx.font = '28px "Press Start 2P", monospace';
        const titleGrad = ctx.createLinearGradient(0, 30, 0, 70);
        titleGrad.addColorStop(0, '#f5c542');
        titleGrad.addColorStop(1, '#e8a040');
        ctx.fillStyle = titleGrad;
        ctx.fillText('THANK YOU FOR PLAYING!', W / 2, 60);

        // Subtitle
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = '#7dda5c';
        ctx.fillText('HARVEST RUSH: FEED THE CITY - DEMO', W / 2, 90);

        // Decorative line
        ctx.fillStyle = '#f5c542';
        ctx.fillRect(W / 2 - 200, 105, 400, 3);

        // Letter parchment
        const lx = W / 2 - 240, ly = 125, lw = 480, lh = 420;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(lx + 5, ly + 5, lw, lh);
        ctx.fillStyle = '#f5ecd0';
        ctx.fillRect(lx, ly, lw, lh);
        ctx.strokeStyle = '#c8a868';
        ctx.lineWidth = 4;
        ctx.strokeRect(lx + 8, ly + 8, lw - 16, lh - 16);
        ctx.strokeStyle = '#e0d0a0';
        ctx.lineWidth = 1;
        ctx.strokeRect(lx + 14, ly + 14, lw - 28, lh - 28);

        // Wax seal
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(W / 2, ly + lh - 45, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(W / 2, ly + lh - 45, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c0392b';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText('G', W / 2, ly + lh - 40);

        // Letter text
        const fullText = LETTER_TEXT.join('\n');
        const visibleText = fullText.substring(0, textIndex);
        const lines = visibleText.split('\n');

        ctx.font = '11px "Press Start 2P", monospace';
        ctx.textAlign = 'left';

        lines.forEach((line, i) => {
            if (line.startsWith('Dear') || line.startsWith('With') || line.startsWith('The Citizens')) {
                ctx.fillStyle = '#5a3a1a';
            } else {
                ctx.fillStyle = '#3a2a1a';
            }
            ctx.fillText(line, lx + 40, ly + 50 + i * 24);
        });

        // Bottom text
        ctx.textAlign = 'center';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#666';
        ctx.fillText('Click to return to title screen', W / 2, H - 15);

        ctx.restore();
    }

    function onClick() {
        const fullText = LETTER_TEXT.join('\n');
        if (textIndex < fullText.length) {
            textIndex = fullText.length;
        } else {
            AudioManager.playClick();
            Game.changeScene('title');
        }
    }

    function onMouseMove() { }

    return { init, update, render, onMouseMove, onClick };
})();
