// ===== CROP SELECT SCREEN =====
// Choose crops for months 2 and 3

const CropSelect = {
    availableCrops: [],
    selectedCrops: [],
    maxSelections: 3,
    cards: [],
    confirmButton: null,
    month: 2,
    time: 0,
    onConfirm: null,

    init(canvas, month, onConfirm) {
        this.month = month;
        this.maxSelections = month === 2 ? 3 : 2;
        this.selectedCrops = [];
        this.time = 0;
        this.onConfirm = onConfirm;

        const cx = canvas.width / 2;

        // All crops available
        this.availableCrops = ['lettuce', 'corn', 'rice', 'wheat'];
        this.cards = [];

        const cardW = 120;
        const cardH = 160;
        const gap = 16;
        const totalW = this.availableCrops.length * (cardW + gap) - gap;
        const startX = (canvas.width - totalW) / 2;

        for (let i = 0; i < this.availableCrops.length; i++) {
            const cropId = this.availableCrops[i];
            const data = CropData[cropId];
            this.cards.push({
                id: cropId,
                data,
                x: startX + i * (cardW + gap),
                y: canvas.height * 0.3,
                width: cardW,
                height: cardH,
                hovered: false,
                selected: false,
            });
        }

        this.confirmButton = {
            text: 'CONFIRM',
            x: cx - 80,
            y: canvas.height * 0.82,
            width: 160,
            height: 44,
            hovered: false,
        };
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

        // Subtle radial glow
        const glow = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.6);
        glow.addColorStop(0, 'rgba(74, 222, 128, 0.05)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // Title
        UI.drawText(ctx, `MONTH ${this.month} - CHOOSE YOUR CROPS`, w / 2, h * 0.1, {
            font: '14px "Press Start 2P"',
            color: '#4ade80',
            align: 'center',
        });

        // Instruction
        UI.drawText(ctx, `Select ${this.maxSelections} crops to grow this month`, w / 2, h * 0.18, {
            font: '11px Inter',
            color: '#94a3b8',
            align: 'center',
            shadow: false,
        });

        // Selection counter
        UI.drawText(ctx, `${this.selectedCrops.length} / ${this.maxSelections}`, w / 2, h * 0.24, {
            font: '12px "Press Start 2P"',
            color: this.selectedCrops.length === this.maxSelections ? '#4ade80' : '#fbbf24',
            align: 'center',
        });

        // Crop cards
        for (const card of this.cards) {
            const isSelected = card.selected;
            const isHovered = card.hovered;

            // Card background
            const offsetY = isHovered ? -4 : 0;
            ctx.fillStyle = isSelected
                ? 'rgba(245, 158, 11, 0.15)'
                : isHovered
                    ? 'rgba(74, 222, 128, 0.1)'
                    : 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(card.x, card.y + offsetY, card.width, card.height);

            // Border
            ctx.strokeStyle = isSelected
                ? '#f59e0b'
                : isHovered
                    ? '#4ade80'
                    : 'rgba(255,255,255,0.1)';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(card.x, card.y + offsetY, card.width, card.height);

            // Glow for selected
            if (isSelected) {
                ctx.shadowColor = '#f59e0b';
                ctx.shadowBlur = 15;
                ctx.strokeRect(card.x, card.y + offsetY, card.width, card.height);
                ctx.shadowBlur = 0;
            }

            // Crop icon (drawn as pixel sprite)
            Sprites.drawCrop(ctx, card.x + 36, card.y + offsetY + 10, card.id, 3);

            // Name
            UI.drawText(ctx, card.data.name, card.x + card.width / 2, card.y + offsetY + 75, {
                font: '9px "Press Start 2P"',
                color: '#f1f5f9',
                align: 'center',
                shadow: false,
            });

            // Stats
            const statsY = card.y + offsetY + 92;
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`XP: ${card.data.xp}`, card.x + card.width / 2, statsY);
            ctx.fillStyle = '#4ade80';
            ctx.fillText(`$${card.data.money}`, card.x + card.width / 2, statsY + 16);
            ctx.fillStyle = '#ef4444';
            ctx.fillText(`Food: ${card.data.food}`, card.x + card.width / 2, statsY + 32);
            ctx.fillStyle = '#60a5fa';
            ctx.fillText(`${card.data.growthDays} days`, card.x + card.width / 2, statsY + 48);

            // Checkmark for selected
            if (isSelected) {
                ctx.fillStyle = '#f59e0b';
                ctx.font = '18px sans-serif';
                ctx.fillText('✓', card.x + card.width - 16, card.y + offsetY + 20);
            }
        }

        // Confirm button (only when enough selected)
        if (this.selectedCrops.length === this.maxSelections) {
            UI.drawButton(ctx, 'CONFIRM', this.confirmButton.x, this.confirmButton.y,
                this.confirmButton.width, this.confirmButton.height, this.confirmButton.hovered);
        } else {
            // Disabled button appearance
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(this.confirmButton.x, this.confirmButton.y,
                this.confirmButton.width, this.confirmButton.height);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.confirmButton.x, this.confirmButton.y,
                this.confirmButton.width, this.confirmButton.height);
            UI.drawText(ctx, 'CONFIRM', this.confirmButton.x + this.confirmButton.width / 2,
                this.confirmButton.y + this.confirmButton.height / 2 + 5, {
                font: '12px "Press Start 2P"',
                color: 'rgba(148,163,184,0.3)',
                align: 'center',
            });
        }
    },

    onMouseMove(x, y) {
        for (const card of this.cards) {
            card.hovered = UI.isInside(x, y, card);
        }
        if (this.confirmButton) {
            this.confirmButton.hovered = UI.isInside(x, y, this.confirmButton);
        }
    },

    onClick(x, y) {
        // Check crop cards
        for (const card of this.cards) {
            if (UI.isInside(x, y, card)) {
                Audio.playClick();
                if (card.selected) {
                    // Deselect
                    card.selected = false;
                    this.selectedCrops = this.selectedCrops.filter(c => c !== card.id);
                } else if (this.selectedCrops.length < this.maxSelections) {
                    // Select
                    card.selected = true;
                    this.selectedCrops.push(card.id);
                }
                return null;
            }
        }

        // Check confirm button
        if (this.selectedCrops.length === this.maxSelections &&
            UI.isInside(x, y, this.confirmButton)) {
            Audio.playSuccess();
            if (this.onConfirm) this.onConfirm(this.selectedCrops);
            return 'confirm';
        }

        return null;
    },
};
