// ===== UI UTILITIES =====
// Reusable UI components for HUD, buttons, dialogs

const UI = {
    // Draw text with shadow
    drawText(ctx, text, x, y, options = {}) {
        const {
            font = '12px "Press Start 2P"',
            color = '#f1f5f9',
            align = 'left',
            shadow = true,
            shadowColor = 'rgba(0,0,0,0.5)',
            shadowOffset = 2
        } = options;

        ctx.font = font;
        ctx.textAlign = align;

        if (shadow) {
            ctx.fillStyle = shadowColor;
            ctx.fillText(text, x + shadowOffset, y + shadowOffset);
        }

        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    },

    // Draw a progress bar
    drawProgressBar(ctx, x, y, width, height, value, maxValue, color = '#4ade80', bgColor = 'rgba(0,0,0,0.4)') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, width, height);
        const fillWidth = (value / maxValue) * width;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, fillWidth, height);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    },

    // Draw HUD
    drawHUD(ctx, gameState, canvasWidth) {
        const y = 8;
        const h = 28;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvasWidth, h + 16);
        this.drawText(ctx, `Month ${gameState.month} - Day ${gameState.day}/${gameState.daysInMonth}`, 12, y + 18, { font: '10px "Press Start 2P"', color: '#fbbf24' });
        this.drawProgressBar(ctx, 12, y + 26, 150, 6, gameState.dayTimer, gameState.dayDuration, '#fbbf24');
        this.drawText(ctx, `$${gameState.money.toFixed(1)}`, canvasWidth - 300, y + 18, { font: '10px "Press Start 2P"', color: '#4ade80' });
        this.drawText(ctx, `XP:${gameState.xp}`, canvasWidth - 200, y + 18, { font: '10px "Press Start 2P"', color: '#60a5fa' });
        this.drawText(ctx, `Food:${gameState.food}`, canvasWidth - 100, y + 18, { font: '10px "Press Start 2P"', color: '#ef4444' });
    },

    // Draw button
    drawButton(ctx, text, x, y, width, height, isHovered = false) {
        ctx.fillStyle = isHovered ? 'rgba(74, 222, 128, 0.2)' : 'rgba(22, 33, 62, 0.8)';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = isHovered ? '#4ade80' : 'rgba(74, 222, 128, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        this.drawText(ctx, text, x + width / 2, y + height / 2 + 5, { font: '12px "Press Start 2P"', align: 'center', color: isHovered ? '#4ade80' : '#94a3b8' });
        return { x, y, width, height };
    },

    isInside(px, py, rect) {
        return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height;
    },

    // Tooltip
    drawTooltip(ctx, text, x, y) {
        ctx.font = '10px "Press Start 2P"';
        const metrics = ctx.measureText(text);
        const padding = 8;
        const w = metrics.width + padding * 2;
        const h = 24;
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(x, y - h - 4, w, h);
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y - h - 4, w, h);
        ctx.fillStyle = '#f1f5f9';
        ctx.fillText(text, x + padding, y - h + 12);
    },

    // Fade transition
    drawFade(ctx, canvasWidth, canvasHeight, alpha) {
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    },

    drawInventorySlot(ctx, x, y, size, item, count, isSelected = false) {
        ctx.fillStyle = isSelected ? 'rgba(74, 222, 128, 0.2)' : 'rgba(0,0,0,0.3)';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = isSelected ? '#4ade80' : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(x, y, size, size);
        if (item) {
            Sprites.drawItem(ctx, x + 4, y + 4, item, size - 8);
        }
    }
};
