// ===== CUTSCENE ENGINE =====
// Data-driven cutscene system with typewriter text

const Cutscene = {
    slides: [],
    currentSlide: 0,
    typewriterText: '',
    typewriterIndex: 0,
    typewriterTimer: 0,
    typewriterSpeed: 0.03,
    fadeAlpha: 0,
    fadingIn: true,
    fadingOut: false,
    fadeSpeed: 1.5,
    done: false,
    time: 0,
    onComplete: null,

    start(slides, onComplete) {
        this.slides = slides;
        this.currentSlide = 0;
        this.typewriterText = '';
        this.typewriterIndex = 0;
        this.typewriterTimer = 0;
        this.fadeAlpha = 1;
        this.fadingIn = true;
        this.fadingOut = false;
        this.done = false;
        this.time = 0;
        this.onComplete = onComplete;
    },

    update(deltaTime) {
        this.time += deltaTime;
        if (this.fadingIn) {
            this.fadeAlpha -= deltaTime * this.fadeSpeed;
            if (this.fadeAlpha <= 0) { this.fadeAlpha = 0; this.fadingIn = false; }
            return;
        }
        if (this.fadingOut) {
            this.fadeAlpha += deltaTime * this.fadeSpeed;
            if (this.fadeAlpha >= 1) {
                this.fadeAlpha = 1;
                this.fadingOut = false;
                this.currentSlide++;
                if (this.currentSlide >= this.slides.length) {
                    this.done = true;
                    if (this.onComplete) this.onComplete();
                } else {
                    this.typewriterText = '';
                    this.typewriterIndex = 0;
                    this.fadingIn = true;
                }
            }
            return;
        }
        const slide = this.slides[this.currentSlide];
        if (slide && slide.text && this.typewriterIndex < slide.text.length) {
            this.typewriterTimer += deltaTime;
            if (this.typewriterTimer >= this.typewriterSpeed) {
                this.typewriterTimer = 0;
                this.typewriterText += slide.text[this.typewriterIndex];
                this.typewriterIndex++;
                Audio.playTypewriter();
            }
        }
    },

    draw(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;
        const slide = this.slides[this.currentSlide];
        if (!slide) return;

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        if (slide.drawBg) slide.drawBg(ctx, w, h);
        if (slide.drawChar) slide.drawChar(ctx, w, h, this.time);

        if (slide.isLetter) {
            this._drawLetter(ctx, w, h, slide);
        } else if (slide.text) {
            this._drawDialogText(ctx, w, h);
        }

        if (this.typewriterIndex >= (slide.text || '').length && !this.fadingIn && !this.fadingOut) {
            const pulse = Math.sin(this.time * 3) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(148, 163, 184, ${pulse})`;
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('Click or press Space to continue...', w / 2, h - 12);
        }

        if (this.fadeAlpha > 0) UI.drawFade(ctx, w, h, this.fadeAlpha);
    },

    _drawLetter(ctx, w, h, slide) {
        const letterW = Math.min(460, w * 0.75);
        const letterH = 340;
        const lx = (w - letterW) / 2;
        const ly = (h - letterH) / 2 - 10;

        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(lx + 5, ly + 5, letterW, letterH);
        ctx.fillStyle = '#f0e8d0';
        ctx.fillRect(lx, ly, letterW, letterH);

        // Letter lines
        ctx.strokeStyle = 'rgba(160, 180, 210, 0.25)';
        for (let i = 0; i < 12; i++) {
            ctx.beginPath(); ctx.moveTo(lx + 10, ly + 40 + i * 22); ctx.lineTo(lx + letterW - 10, ly + 40 + i * 22); ctx.stroke();
        }

        ctx.font = '14px Inter';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#3a2e1f';
        const lines = this.typewriterText.split('\n');
        let ty = ly + 55;
        for (const line of lines) {
            ctx.fillText(line, lx + 42, ty);
            ty += 22;
        }
    },

    _drawDialogText(ctx, w, h) {
        const boxW = Math.min(w * 0.75, 560);
        const boxH = 90;
        const bx = (w - boxW) / 2;
        const by = h - boxH - 35;

        ctx.fillStyle = 'rgba(16, 24, 48, 0.94)';
        ctx.fillRect(bx, by, boxW, boxH);
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, boxW, boxH);

        ctx.font = '13px Inter';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f1f5f9';
        ctx.fillText(this.typewriterText, bx + boxW / 2, by + boxH / 2 + 5);
    },

    advance() {
        if (this.fadingIn || this.fadingOut) return;
        const slide = this.slides[this.currentSlide];
        if (slide && slide.text && this.typewriterIndex < slide.text.length) {
            this.typewriterText = slide.text;
            this.typewriterIndex = slide.text.length;
            return;
        }
        this.fadingOut = true;
    },

    onClick() { this.advance(); },
    onKeyDown(key) { if (key === ' ' || key === 'Enter') this.advance(); },
};

// ===== CUTSCENE DATA =====
const CutsceneData = {
    getOpeningCutscene() {
        return [
            {
                drawBg: (ctx, w, h) => Sprites.drawHouseInterior(ctx, w, h),
                drawChar: (ctx, w, h, time) => Sprites.drawHolly(ctx, w * 0.3, h * 0.35, Math.floor(time * 4), 'idle'),
                text: 'Holly arrives home after a long day at college. She notices a letter sitting on the table...',
            },
            {
                drawBg: (ctx, w, h) => Sprites.drawHouseInterior(ctx, w, h),
                drawChar: (ctx, w, h, time) => Sprites.drawHolly(ctx, w * 0.35, h * 0.33, 0, 'idle'),
                text: 'She picks up the envelope. It\'s from Uncle Jorge, who lives on a farm in Greenfield...',
            },
            {
                isLetter: true,
                text: 'Dear Holly,\n\nYour uncle needs help with the farm here in Greenfield.\nThe food supplies are running out and I know you study\nenvironmental science, so you already have some experience.\n\nPlease help us with this big problem for at least a year.\n\nThank you in advance,\nUncle Jorge.',
            },
            {
                drawBg: (ctx, w, h) => Sprites.drawFarmExterior(ctx, w, h),
                drawChar: (ctx, w, h, time) => Sprites.drawHolly(ctx, w * 0.46, h * 0.55, Math.floor(time * 4), 'down'),
                text: 'Holly arrives at the farm in Greenfield. Time to get to work!',
            },
        ];
    },
};
