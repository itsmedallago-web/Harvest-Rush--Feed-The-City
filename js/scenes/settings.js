// ===== SETTINGS SCREEN =====
// Sound volume adjustment

const SettingsScreen = {
    volumeSliderRect: null,
    volumeKnobX: 0,
    dragging: false,
    backButton: null,
    time: 0,

    init(canvas) {
        this.time = 0;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        this.volumeSliderRect = {
            x: cx - 100,
            y: cy - 10,
            width: 200,
            height: 12,
        };

        this.backButton = {
            id: 'back',
            text: 'BACK',
            x: cx - 60,
            y: cy + 80,
            width: 120,
            height: 40,
            hovered: false,
        };

        this.updateKnobPosition();
    },

    updateKnobPosition() {
        const vol = Audio.getVolume();
        this.volumeKnobX = this.volumeSliderRect.x + vol * this.volumeSliderRect.width;
    },

    update(deltaTime) {
        this.time += deltaTime;
    },

    draw(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);

        // Subtle grid pattern
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 30) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
        }
        for (let i = 0; i < h; i += 30) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }

        // Title
        UI.drawText(ctx, 'SETTINGS', w / 2, h * 0.2, {
            font: '20px "Press Start 2P"',
            color: '#4ade80',
            align: 'center',
        });

        // Volume label
        UI.drawText(ctx, 'SOUND', w / 2, this.volumeSliderRect.y - 20, {
            font: '10px "Press Start 2P"',
            color: '#94a3b8',
            align: 'center',
        });

        // Volume slider track
        const sr = this.volumeSliderRect;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(sr.x, sr.y, sr.width, sr.height);
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sr.x, sr.y, sr.width, sr.height);

        // Volume fill
        const fillW = Audio.getVolume() * sr.width;
        const volGrad = ctx.createLinearGradient(sr.x, sr.y, sr.x + sr.width, sr.y);
        volGrad.addColorStop(0, '#22c55e');
        volGrad.addColorStop(1, '#4ade80');
        ctx.fillStyle = volGrad;
        ctx.fillRect(sr.x, sr.y, fillW, sr.height);

        // Knob
        const knobX = this.volumeKnobX;
        ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = this.dragging ? 15 : 8;
        ctx.beginPath();
        ctx.arc(knobX, sr.y + sr.height / 2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Volume percentage
        const vol = Math.round(Audio.getVolume() * 100);
        UI.drawText(ctx, `${vol}%`, sr.x + sr.width + 20, sr.y + 10, {
            font: '10px "Press Start 2P"',
            color: '#fbbf24',
        });

        // Speaker icon
        const speakerIcon = vol === 0 ? '🔇' : vol < 50 ? '🔉' : '🔊';
        ctx.font = '20px sans-serif';
        ctx.fillText(speakerIcon, sr.x - 30, sr.y + 12);

        // Back button
        UI.drawButton(ctx, this.backButton.text, this.backButton.x, this.backButton.y,
            this.backButton.width, this.backButton.height, this.backButton.hovered);
    },

    onMouseMove(x, y) {
        this.backButton.hovered = UI.isInside(x, y, this.backButton);

        if (this.dragging) {
            const sr = this.volumeSliderRect;
            const vol = Math.max(0, Math.min(1, (x - sr.x) / sr.width));
            Audio.setVolume(vol);
            this.updateKnobPosition();
        }
    },

    onMouseDown(x, y) {
        const sr = this.volumeSliderRect;
        // Check if clicking on slider area
        if (x >= sr.x - 10 && x <= sr.x + sr.width + 10 &&
            y >= sr.y - 15 && y <= sr.y + sr.height + 15) {
            this.dragging = true;
            const vol = Math.max(0, Math.min(1, (x - sr.x) / sr.width));
            Audio.setVolume(vol);
            this.updateKnobPosition();
        }
    },

    onMouseUp() {
        this.dragging = false;
    },

    onClick(x, y) {
        if (UI.isInside(x, y, this.backButton)) {
            Audio.playClick();
            return 'back';
        }
        return null;
    },
};
