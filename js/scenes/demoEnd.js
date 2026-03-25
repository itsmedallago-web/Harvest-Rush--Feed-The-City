// ===== DEMO END SCREEN =====
// Thanks for playing message

const DemoEnd = {
    time: 0,
    backButton: null,
    particles: [],

    init(canvas) {
        this.time = 0;

        this.backButton = {
            text: 'TITLE SCREEN',
            x: canvas.width / 2 - 90,
            y: canvas.height * 0.72,
            width: 180,
            height: 44,
            hovered: false,
        };

        // Confetti particles
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: -Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 1,
                size: Math.random() * 6 + 3,
                color: ['#4ade80', '#fbbf24', '#60a5fa', '#ef4444', '#a78bfa'][Math.floor(Math.random() * 5)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1,
            });
        }
    },

    update(deltaTime) {
        this.time += deltaTime;

        // Update confetti
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;
            if (p.y > 600) {
                p.y = -10;
                p.x = Math.random() * 800;
            }
        }
    },

    draw(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#1a1a2e');
        grad.addColorStop(0.5, '#16213e');
        grad.addColorStop(1, '#0f3460');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Confetti
        for (const p of this.particles) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            ctx.restore();
        }

        // Title glow
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 30;
        UI.drawText(ctx, 'THANKS FOR PLAYING!', w / 2, h * 0.25, {
            font: '18px "Press Start 2P"',
            color: '#4ade80',
            align: 'center',
        });
        ctx.shadowBlur = 0;

        // Subtitle
        UI.drawText(ctx, 'Harvest Rush: Feed the City', w / 2, h * 0.35, {
            font: '12px "Press Start 2P"',
            color: '#fbbf24',
            align: 'center',
        });

        // Message
        UI.drawWrappedText(ctx, 
            'You\'ve completed the demo! Holly has made great progress on Uncle Jorge\'s farm in Greenfield. The city is grateful for your hard work!',
            w * 0.15, h * 0.46, w * 0.7, 22, {
            font: '14px Inter',
            color: '#94a3b8',
        });

        // Stats summary
        UI.drawText(ctx, `Total XP: ${Economy.state.xp}`, w / 2, h * 0.58, {
            font: '10px "Press Start 2P"',
            color: '#60a5fa',
            align: 'center',
        });
        UI.drawText(ctx, `Total Money: $${Economy.state.money.toFixed(1)}`, w / 2, h * 0.63, {
            font: '10px "Press Start 2P"',
            color: '#4ade80',
            align: 'center',
        });
        UI.drawText(ctx, `Food Delivered: ${Economy.state.totalFoodDelivered}`, w / 2, h * 0.68, {
            font: '10px "Press Start 2P"',
            color: '#ef4444',
            align: 'center',
        });

        // Back button
        UI.drawButton(ctx, this.backButton.text, this.backButton.x, this.backButton.y,
            this.backButton.width, this.backButton.height, this.backButton.hovered);

        // Version
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('Demo v1.0', w / 2, h - 16);
    },

    onMouseMove(x, y) {
        this.backButton.hovered = UI.isInside(x, y, this.backButton);
    },

    onClick(x, y) {
        if (UI.isInside(x, y, this.backButton)) {
            Audio.playClick();
            return 'title';
        }
        return null;
    },
};
