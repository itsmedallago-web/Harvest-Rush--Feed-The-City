// ===== MONTH END SCREEN =====
// Summary + equipment shop between months

const MonthEnd = {
    summary: null,
    shopItems: [],
    continueButton: null,
    time: 0,
    month: 0,
    animatedValues: { money: 0, xp: 0, food: 0 },
    onContinue: null,

    init(canvas, month, summary, onContinue) {
        this.month = month;
        this.summary = summary;
        this.time = 0;
        this.onContinue = onContinue;
        this.animatedValues = { money: 0, xp: 0, food: 0 };

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Shop items
        this.shopItems = Equipment.getAvailable().map((item, i) => ({
            ...item,
            x: cx - 180 + i * 130,
            y: cy + 20,
            width: 110,
            height: 120,
            hovered: false,
        }));

        this.continueButton = {
            text: 'CONTINUE',
            x: cx - 80,
            y: canvas.height - 70,
            width: 160,
            height: 44,
            hovered: false,
        };
    },

    update(deltaTime) {
        this.time += deltaTime;

        // Animate values counting up
        const speed = 2;
        if (this.summary) {
            this.animatedValues.money = Math.min(this.summary.earnings, this.animatedValues.money + this.summary.earnings * deltaTime * speed);
            this.animatedValues.xp = Math.min(this.summary.xp, this.animatedValues.xp + this.summary.xp * deltaTime * speed);
            this.animatedValues.food = Math.min(this.summary.food, this.animatedValues.food + this.summary.food * deltaTime * speed);
        }
    },

    draw(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);

        // Background decoration
        const glow = ctx.createRadialGradient(w/2, h * 0.3, 0, w/2, h * 0.3, w * 0.5);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // Title
        UI.drawText(ctx, `MONTH ${this.month} COMPLETE!`, w / 2, 40, {
            font: '16px "Press Start 2P"',
            color: '#fbbf24',
            align: 'center',
        });

        // Summary panel
        const panelX = w * 0.2;
        const panelY = 70;
        const panelW = w * 0.6;
        const panelH = 100;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        // Stats
        const statsY = panelY + 30;
        UI.drawText(ctx, `Money Earned: $${Math.floor(this.animatedValues.money * 10) / 10}`, w / 2, statsY, {
            font: '11px "Press Start 2P"',
            color: '#4ade80',
            align: 'center',
        });
        UI.drawText(ctx, `XP Gained: ${Math.floor(this.animatedValues.xp)}`, w / 2, statsY + 24, {
            font: '11px "Press Start 2P"',
            color: '#60a5fa',
            align: 'center',
        });
        UI.drawText(ctx, `Food Delivered: ${Math.floor(this.animatedValues.food)}`, w / 2, statsY + 48, {
            font: '11px "Press Start 2P"',
            color: '#ef4444',
            align: 'center',
        });

        // Shop section
        if (this.shopItems.length > 0) {
            UI.drawText(ctx, 'EQUIPMENT SHOP', w / 2, panelY + panelH + 30, {
                font: '12px "Press Start 2P"',
                color: '#fbbf24',
                align: 'center',
            });

            UI.drawText(ctx, `Your money: $${Economy.state.money.toFixed(1)}`, w / 2, panelY + panelH + 50, {
                font: '9px "Press Start 2P"',
                color: '#4ade80',
                align: 'center',
            });

            for (const item of this.shopItems) {
                const canBuy = Economy.canAfford(item.price);

                // Card background
                ctx.fillStyle = item.hovered && canBuy
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(item.x, item.y, item.width, item.height);

                // Border
                ctx.strokeStyle = item.hovered && canBuy
                    ? '#f59e0b'
                    : canBuy ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
                ctx.lineWidth = 2;
                ctx.strokeRect(item.x, item.y, item.width, item.height);

                // Equipment sprite
                const drawFn = item.drawFn;
                if (Sprites[drawFn]) {
                    Sprites[drawFn](ctx, item.x + 38, item.y + 10);
                }

                // Name
                UI.drawText(ctx, item.name, item.x + item.width / 2, item.y + 65, {
                    font: '8px "Press Start 2P"',
                    color: canBuy ? '#f1f5f9' : '#64748b',
                    align: 'center',
                    shadow: false,
                });

                // Price
                UI.drawText(ctx, `$${item.price}`, item.x + item.width / 2, item.y + 85, {
                    font: '10px "Press Start 2P"',
                    color: canBuy ? '#fbbf24' : '#64748b',
                    align: 'center',
                    shadow: false,
                });

                // Description
                ctx.font = '9px Inter';
                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                ctx.fillText(item.description, item.x + item.width / 2, item.y + 105);

                // Can't afford overlay
                if (!canBuy) {
                    ctx.fillStyle = 'rgba(0,0,0,0.4)';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                }
            }
        }

        // Continue button
        UI.drawButton(ctx, 'CONTINUE', this.continueButton.x, this.continueButton.y,
            this.continueButton.width, this.continueButton.height, this.continueButton.hovered);
    },

    onMouseMove(x, y) {
        for (const item of this.shopItems) {
            item.hovered = UI.isInside(x, y, item);
        }
        this.continueButton.hovered = UI.isInside(x, y, this.continueButton);
    },

    onClick(x, y) {
        // Check shop items
        for (const item of this.shopItems) {
            if (UI.isInside(x, y, item)) {
                if (Equipment.buy(item.id)) {
                    Audio.playMoney();
                    // Refresh shop items
                    const cx = x; // approximate
                    this.shopItems = this.shopItems.filter(s => s.id !== item.id);
                    return null;
                } else {
                    Audio.playError();
                }
                return null;
            }
        }

        // Continue
        if (UI.isInside(x, y, this.continueButton)) {
            Audio.playClick();
            if (this.onContinue) this.onContinue();
            return 'continue';
        }

        return null;
    },
};
