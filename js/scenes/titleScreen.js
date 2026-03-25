// ===== TITLE SCREEN =====
// Main menu with Play and Settings

const TitleScreen = {
    buttons: [],
    time: 0,
    letterOffsets: [],
    starParticles: [],

    init(canvas) {
        this.time = 0;
        this.buttons = [];

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        this.buttons = [
            { id: 'play', text: 'PLAY', x: cx - 80, y: cy + 40, width: 160, height: 44, hovered: false },
            { id: 'settings', text: 'SETTINGS', x: cx - 80, y: cy + 100, width: 160, height: 44, hovered: false },
        ];

        // Title letter animation offsets
        const title = 'Harvest Rush';
        this.letterOffsets = [];
        for (let i = 0; i < title.length; i++) {
            this.letterOffsets.push({ char: title[i], phase: i * 0.4 });
        }

        // Decorative star particles
        this.starParticles = [];
        for (let i = 0; i < 30; i++) {
            this.starParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.5,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.5 + 0.3,
            });
        }
    },

    update(deltaTime) {
        this.time += deltaTime;

        // Update particles
        for (const p of this.starParticles) {
            p.opacity = 0.3 + Math.sin(this.time * p.speed * 2) * 0.3;
        }
    },

    draw(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;

        // Draw farm background
        Sprites.drawFarmBackground(ctx, w, h, this.time);

        // Darken overlay for contrast
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, w, h);

        // Sparkle particles
        for (const p of this.starParticles) {
            ctx.fillStyle = `rgba(255, 255, 200, ${p.opacity})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }

        // Title: "Harvest Rush"
        const titleY = h * 0.2;
        ctx.font = '28px "Press Start 2P"';
        ctx.textAlign = 'center';

        // Glow behind title
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#4ade80';

        // Animated letters
        let titleX = w / 2 - ctx.measureText('Harvest Rush').width / 2;
        for (const letter of this.letterOffsets) {
            const yOff = Math.sin(this.time * 2 + letter.phase) * 5;
            ctx.fillText(letter.char, titleX + ctx.measureText(letter.char).width / 2, titleY + yOff);
            titleX += ctx.measureText(letter.char).width;
        }
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.font = '11px "Press Start 2P"';
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fillText('Feed the City', w / 2, titleY + 40);
        ctx.shadowBlur = 0;

        // Decorative line
        const lineY = titleY + 60;
        const lineGrad = ctx.createLinearGradient(w * 0.2, lineY, w * 0.8, lineY);
        lineGrad.addColorStop(0, 'transparent');
        lineGrad.addColorStop(0.5, '#4ade80');
        lineGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.2, lineY);
        ctx.lineTo(w * 0.8, lineY);
        ctx.stroke();

        // Buttons
        for (const btn of this.buttons) {
            UI.drawButton(ctx, btn.text, btn.x, btn.y, btn.width, btn.height, btn.hovered);
        }

        // Version text
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('Demo v1.0', w / 2, h - 20);
    },

    onMouseMove(x, y) {
        for (const btn of this.buttons) {
            btn.hovered = UI.isInside(x, y, btn);
        }
    },

    onClick(x, y) {
        for (const btn of this.buttons) {
            if (UI.isInside(x, y, btn)) {
                Audio.playClick();
                return btn.id;
            }
        }
        return null;
    },
};
