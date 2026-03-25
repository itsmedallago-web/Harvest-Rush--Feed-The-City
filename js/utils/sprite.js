// ===== SPRITE RENDERER =====
// Detailed pixel-art sprites with dark outlines for Harvest Rush
// Style: colorful, outlined, with dirt mounds and chibi character

const Sprites = {
    TILE_SIZE: 48,
    SCALE: 3,
    OUTLINE: '#2a1a0e',

    COLORS: {
        soil: ['#6b4226', '#7a5035', '#8b6240'],
        soilWet: ['#4a2e1a', '#5a3d28', '#4f3520'],
        grass: ['#5aad4e', '#4d9642', '#3d8032'],
        water: ['#4a9ff5', '#6bb5fa', '#3580db'],
        lettuce: ['#a8f0a0', '#6ed860', '#3fbf30', '#2a9020'],
        corn: ['#ffd644', '#f0b820', '#d89a10', '#b87a08'],
        rice: ['#fef8e0', '#f5e8a0', '#e8d060'],
        wheat: ['#e8b840', '#d0a030', '#b88820', '#a07018'],
        holly: {
            hair: '#6b3010', hairLight: '#8b4520', hairDark: '#4a2008',
            skin: '#f8d0a0', skinShade: '#e0b080',
            eyeWhite: '#fff', eyeIris: '#5060d0', eyeShine: '#fff', eyePupil: '#202060',
            shirt: '#5090e0', shirtLight: '#60a8f0', shirtDark: '#3870c0',
            skirt: '#2838a0', skirtDark: '#1a2878',
            boots: '#383028', bootsLight: '#504838',
        },
        truck: ['#a0b0c0', '#708090', '#e04040', '#c03030'],
    },

    // Helper: draw outlined pixel block
    _oRect(ctx, x, y, w, h, fill, outline) {
        ctx.fillStyle = outline || this.OUTLINE;
        ctx.fillRect(Math.floor(x - 1), Math.floor(y - 1), w + 2, h + 2);
        ctx.fillStyle = fill;
        ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
    },

    // ===== HOLLY (Chibi style like reference) =====
    drawHolly(ctx, x, y, frame = 0, direction = 'down') {
        const c = this.COLORS.holly;
        const O = this.OUTLINE;
        
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(x + 14, y + 50, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        const bounce = Math.sin(frame * 0.3) * (direction !== 'idle' ? 2 : 0);
        const by = bounce;

        // === BODY OUTLINE ===
        ctx.fillStyle = O;
        ctx.fillRect(x + 2, y - 2 + by, 24, 22); // head
        ctx.fillRect(x + 4, y + 18 + by, 20, 18); // body
        ctx.fillRect(x + 4, y + 34 + by, 8, 12); // legs
        ctx.fillRect(x + 16, y + 34 + by, 8, 12);

        // === HAIR ===
        ctx.fillStyle = c.hairDark;
        ctx.fillRect(x + 3, y - 1 + by, 22, 10);
        ctx.fillStyle = c.hair;
        ctx.fillRect(x + 4, y + by, 20, 9);
        ctx.fillStyle = c.hairLight;
        ctx.fillRect(x + 6, y + 1 + by, 8, 3);
        
        // Ponytail (Back)
        ctx.fillStyle = c.hairDark;
        ctx.fillRect(x + 23, y + 4 + by, 5, 16);
        ctx.fillStyle = c.hair;
        ctx.fillRect(x + 24, y + 5 + by, 3, 14);

        // Face
        ctx.fillStyle = c.skin;
        ctx.fillRect(x + 6, y + 5 + by, 16, 14);
        
        // Eyes
        ctx.fillStyle = c.eyeWhite;
        ctx.fillRect(x + 7, y + 9 + by, 6, 6);
        ctx.fillRect(x + 15, y + 9 + by, 6, 6);
        ctx.fillStyle = c.eyeIris;
        ctx.fillRect(x + 8, y + 10 + by, 4, 5);
        ctx.fillRect(x + 16, y + 10 + by, 4, 5);

        // Shirt
        ctx.fillStyle = c.shirt;
        ctx.fillRect(x + 5, y + 19 + by, 18, 10);
        ctx.fillStyle = '#fff'; // collar
        ctx.fillRect(x + 10, y + 19 + by, 8, 3);

        // Skirt
        ctx.fillStyle = c.skirt;
        ctx.fillRect(x + 5, y + 29 + by, 18, 7);

        // Boots
        ctx.fillStyle = c.boots;
        ctx.fillRect(x + 5, y + 40 + by, 7, 6);
        ctx.fillRect(x + 16, y + 40 + by, 7, 6);
    },

    // ===== FARM PLOT =====
    drawPlot(ctx, x, y, state, waterLevel = 0) {
        const size = this.TILE_SIZE;
        const colors = waterLevel > 0 ? this.COLORS.soilWet : this.COLORS.soil;

        ctx.fillStyle = this.OUTLINE;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = colors[0];
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

        // Soil lines
        ctx.fillStyle = colors[1];
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(x + 4, y + 4 + i * 9, size - 8, 3);
        }
    },

    // ===== CROPS =====
    drawCrop(ctx, x, y, type, stage) {
        const cx = x + 24;
        const cy = y + 24;

        if (stage > 0) {
            // Dirt mound
            ctx.fillStyle = this.OUTLINE;
            ctx.beginPath(); ctx.ellipse(cx, cy + 14, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#7a5035';
            ctx.beginPath(); ctx.ellipse(cx, cy + 13, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
        }

        switch (type) {
            case 'lettuce': this._drawLettuce(ctx, cx, cy, stage); break;
            case 'corn': this._drawCorn(ctx, cx, cy, stage); break;
            case 'rice': this._drawRice(ctx, cx, cy, stage); break;
            case 'wheat': this._drawWheat(ctx, cx, cy, stage); break;
        }
    },

    _drawLettuce(ctx, cx, cy, stage) {
        const O = this.OUTLINE;
        if (stage === 0) {
            ctx.fillStyle = O; ctx.fillRect(cx - 2, cy + 6, 5, 5);
        } else if (stage === 1) {
            ctx.fillStyle = O; ctx.fillRect(cx - 2, cy - 2, 5, 14);
            ctx.fillStyle = '#4db840'; ctx.fillRect(cx - 1, cy, 3, 12);
        } else if (stage === 2) {
            ctx.fillStyle = O; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#50c840'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = O; ctx.beginPath(); ctx.arc(cx, cy - 2, 14, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#40b830'; ctx.beginPath(); ctx.arc(cx, cy - 2, 12, 0, Math.PI * 2); ctx.fill();
        }
    },

    _drawCorn(ctx, cx, cy, stage) {
        const O = this.OUTLINE;
        if (stage === 0) {
            ctx.fillStyle = O; ctx.fillRect(cx - 2, cy + 6, 5, 5);
        } else if (stage === 1) {
            ctx.fillStyle = O; ctx.fillRect(cx - 2, cy - 6, 5, 18);
            ctx.fillStyle = '#40a030'; ctx.fillRect(cx - 1, cy - 5, 3, 16);
        } else if (stage === 2) {
            ctx.fillStyle = O; ctx.fillRect(cx - 2, cy - 14, 5, 26);
            ctx.fillStyle = '#40a030'; ctx.fillRect(cx - 1, cy - 13, 3, 24);
        } else {
            ctx.fillStyle = O; ctx.fillRect(cx - 2, cy - 18, 5, 30);
            ctx.fillStyle = '#40a030'; ctx.fillRect(cx - 1, cy - 17, 3, 28);
            ctx.fillStyle = '#f0c020'; ctx.fillRect(cx + 3, cy - 16, 9, 14);
        }
    },

    _drawRice(ctx, cx, cy, stage) {
        for (let i = -1; i <= 1; i++) {
            const O = this.OUTLINE;
            ctx.fillStyle = O;
            ctx.fillRect(cx + i * 4 - 1, cy - (stage * 3), 4, 10 + stage * 3);
            ctx.fillStyle = '#50a840';
            ctx.fillRect(cx + i * 4, cy - (stage * 3) + 1, 2, 8 + stage * 3);
        }
    },

    _drawWheat(ctx, cx, cy, stage) {
        const O = this.OUTLINE;
        ctx.fillStyle = O;
        ctx.fillRect(cx - 1, cy - (stage * 4), 3, 10 + stage * 4);
        if (stage > 2) {
            ctx.fillStyle = '#d0a830';
            ctx.fillRect(cx - 4, cy - 15, 9, 7);
        }
    },

    drawTruck(ctx, x, y, loaded = false) {
        const O = this.OUTLINE;
        ctx.fillStyle = O; ctx.fillRect(x - 1, y + 10, 94, 40);
        ctx.fillStyle = '#e04040'; ctx.fillRect(x + 1, y + 12, 30, 26);
        ctx.fillStyle = '#a0b0c0'; ctx.fillRect(x + 30, y + 7, 58, 32);
        if (loaded) {
            ctx.fillStyle = '#8b6914'; ctx.fillRect(x + 36, y + 14, 12, 12);
        }
    },

    drawMill(ctx, x, y) {
        ctx.fillStyle = '#b09070'; ctx.fillRect(x, y + 16, 32, 24);
    },

    drawPopcornMaker(ctx, x, y) {
        ctx.fillStyle = '#e04040'; ctx.fillRect(x + 4, y + 8, 24, 28);
    },

    drawOven(ctx, x, y) {
        ctx.fillStyle = '#707880'; ctx.fillRect(x + 2, y + 8, 28, 28);
    },

    drawGrassTile(ctx, x, y, variant = 0) {
        const c = this.COLORS.grass;
        ctx.fillStyle = c[variant % 3];
        ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
    },

    drawWaterGate(ctx, x, y, open) {
        ctx.fillStyle = open ? '#4a9ff5' : '#6b4f10';
        ctx.fillRect(x, y, 28, 20);
    },

    drawItem(ctx, x, y, type, size = 24) {
        ctx.fillStyle = '#50c840';
        ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2); ctx.fill();
    },

    drawFarmBackground(ctx, w, h, time) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        skyGrad.addColorStop(0, '#78c8f0');
        skyGrad.addColorStop(1, '#a0d8f0');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.6);
        ctx.fillStyle = '#48a040';
        ctx.fillRect(0, h * 0.6, w, h * 0.4);
    },

    _drawCloud(ctx, x, y, scale) {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x, y, 20 * scale, 0, Math.PI * 2); ctx.fill();
    },

    drawHouseInterior(ctx, w, h) {
        ctx.fillStyle = '#c4b090'; ctx.fillRect(0, 0, w, h * 0.6);
        ctx.fillStyle = '#a08060'; ctx.fillRect(0, h * 0.6, w, h * 0.4);
        ctx.fillStyle = '#8b6914'; ctx.fillRect(w * 0.25, h * 0.48, w * 0.3, h * 0.05); // Table
        // Door
        ctx.fillStyle = '#5a3a10'; ctx.fillRect(w * 0.05, h * 0.25, w * 0.1, h * 0.35);
    },

    drawFarmExterior(ctx, w, h) {
        ctx.fillStyle = '#ffbe76'; ctx.fillRect(0, 0, w, h * 0.5);
        ctx.fillStyle = '#48a040'; ctx.fillRect(0, h * 0.5, w, h * 0.5);
        // Barn
        ctx.fillStyle = '#c05040'; ctx.fillRect(w * 0.6, h * 0.3, w * 0.15, h * 0.2);
    },
};
