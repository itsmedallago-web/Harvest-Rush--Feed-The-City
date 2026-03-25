// ============================================================
// assets.js — Procedural pixel-art sprite generator
// All sprites drawn to offscreen canvases with pixel-level control
// Style inspired by cozy pixel-art farm games
// ============================================================
const Assets = (() => {
    const cache = {};

    function createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    }

    function drawPixel(ctx, x, y, color, size = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
    }

    function drawRect(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    // Draw a pixel-art circle (filled)
    function drawCircle(ctx, cx, cy, r, color) {
        ctx.fillStyle = color;
        for (let y = -r; y <= r; y++) {
            for (let x = -r; x <= r; x++) {
                if (x * x + y * y <= r * r) {
                    ctx.fillRect(cx + x, cy + y, 1, 1);
                }
            }
        }
    }

    // ---- HOLLY CHARACTER SPRITE (reference: brown wavy hair, cyan eyes, green hoodie, brown boots) ----
    function generateHolly(scale = 4) {
        const w = 16, h = 24;
        const c = createCanvas(w * scale, h * scale);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const s = scale;

        // pixel art based on reference image
        const pixels = [
            '....BBBBBB......',  // 0  hair top
            '...BBBBBBBBB....',  // 1
            '..BBBBBBBBBBBB..',  // 2  hair wide
            '..BBBBBBBBBBB...',  // 3
            '.BBBBSSSSSBBB...',  // 4  face starts
            '.BBBSSSSSSBB....',  // 5
            '.BBSSEESSESBBB.',  // 6  eyes (E=cyan)
            '.BBSSSSSSSSBB..',  // 7
            '.BBBSSMSSSBBBB.',  // 8  mouth
            '..BBBSSSSBBBB..',  // 9  chin
            '...BBBBBBBBB....',  // 10 hair sides
            '....GGGGGG......',  // 11 hoodie starts
            '...GGGGGGGGG....',  // 12
            '..SSGGGGGGGSS...',  // 13 arms (skin)
            '..SSGGDDDGGSS...',  // 14 hoodie pocket detail
            '..SSGGDDDGGSS...',  // 15
            '...SGGGGGGGS....',  // 16
            '....GGGGGG......',  // 17 hoodie bottom
            '....GGGGGG......',  // 18
            '....RRRRR.......',  // 19 shorts/skirt
            '....RRRRRR......',  // 20
            '....SS..SS......',  // 21 skin legs
            '....WW..WW......',  // 22 boots
            '....WW..WW......',  // 23
        ];

        const colorMap = {
            'B': '#8B5E3C',  // brown hair (warm, like reference)
            'S': '#FFDAB9',  // skin (peach)
            'E': '#4ECDC4',  // cyan eyes (from reference)
            'M': '#E8828A',  // mouth/blush
            'G': '#5BAE5B',  // green hoodie
            'D': '#4A9A4A',  // darker green (pocket/detail)
            'R': '#8B6242',  // brown shorts
            'W': '#6B4226',  // brown boots
            '.': null
        };

        for (let row = 0; row < pixels.length; row++) {
            for (let col = 0; col < pixels[row].length; col++) {
                const ch = pixels[row][col];
                const clr = colorMap[ch];
                if (clr) drawRect(ctx, col * s, row * s, s, s, clr);
            }
        }

        // Add hair highlights
        drawRect(ctx, 5 * s, 1 * s, 2 * s, s, '#A0704C');
        drawRect(ctx, 8 * s, 2 * s, 2 * s, s, '#A0704C');

        // Eye sparkle
        drawRect(ctx, 5 * s, 6 * s, s, s, '#FFFFFF');
        drawRect(ctx, 9 * s, 6 * s, s, s, '#FFFFFF');

        // Blush marks
        drawRect(ctx, 4 * s, 7 * s, s, s, '#FFB6B6');
        drawRect(ctx, 10 * s, 7 * s, s, s, '#FFB6B6');

        return c;
    }

    // ---- CROP SPRITES ----
    function generateCropSprite(type, stage, scale = 4) {
        const key = `crop_${type}_${stage}`;
        if (cache[key]) return cache[key];
        const w = 8, h = 8;
        const c = createCanvas(w * scale, h * scale);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const s = scale;

        if (stage === 'empty') {
            drawRect(ctx, 0, 5 * s, w * s, 3 * s, '#8B6914');
            drawRect(ctx, s, 4 * s, 6 * s, s, '#a07828');
        } else if (stage === 'planted') {
            drawRect(ctx, 0, 5 * s, w * s, 3 * s, '#8B6914');
            // Small seedling
            drawRect(ctx, 3 * s, 4 * s, 2 * s, s, '#4a7a2a');
            drawRect(ctx, 3.5 * s, 3 * s, s, s, '#5dba4c');
        } else if (stage === 'growing') {
            drawRect(ctx, 0, 5 * s, w * s, 3 * s, '#8B6914');
            const cropColor = CROPS[type]?.color || '#4a7a2a';
            // Stem
            drawRect(ctx, 3.5 * s, 2 * s, s, 3 * s, '#3d7a2d');
            // Leaves
            drawRect(ctx, 2 * s, 2 * s, 4 * s, 2 * s, cropColor);
            drawRect(ctx, 3 * s, 1 * s, 2 * s, s, '#5dba4c');
        } else if (stage === 'ready') {
            drawRect(ctx, 0, 5 * s, w * s, 3 * s, '#8B6914');
            const cropColor = CROPS[type]?.color || '#4a7a2a';
            // Full grown
            drawRect(ctx, 1 * s, 1 * s, 6 * s, 4 * s, cropColor);
            drawRect(ctx, 2 * s, 0, 4 * s, s, '#5dba4c');
            drawRect(ctx, 3 * s, 2 * s, s, 3 * s, '#3d7a2d');
            // Sparkles
            drawRect(ctx, 6 * s, 0, s, s, '#FFE566');
            drawRect(ctx, 0, 2 * s, s, s, '#FFE566');
            drawRect(ctx, 7 * s, 3 * s, s, s, '#FFE566');
        } else if (stage === 'watered') {
            drawRect(ctx, 0, 5 * s, w * s, 3 * s, '#6b5010');
            const cropColor = CROPS[type]?.color || '#4a7a2a';
            drawRect(ctx, 3.5 * s, 2 * s, s, 3 * s, '#3d7a2d');
            drawRect(ctx, 2 * s, 2 * s, 4 * s, 2 * s, cropColor);
            // Water droplets
            drawRect(ctx, s, s, s, s, '#6BC5F0');
            drawRect(ctx, 5 * s, 0, s, s, '#6BC5F0');
            drawRect(ctx, 3 * s, s, s, s, '#88D8F8');
        }

        cache[key] = c;
        return c;
    }

    // ---- FARM TILE ----
    function generateGrassTile(scale = 4) {
        if (cache['grass']) return cache['grass'];
        const sz = 16;
        const c = createCanvas(sz * scale, sz * scale);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawRect(ctx, 0, 0, sz * scale, sz * scale, '#5BAE5B');
        for (let i = 0; i < 10; i++) {
            const gx = Math.floor(Math.random() * sz) * scale;
            const gy = Math.floor(Math.random() * sz) * scale;
            drawRect(ctx, gx, gy, scale, scale, i % 2 ? '#4A9A4A' : '#6BC06B');
        }
        cache['grass'] = c;
        return c;
    }

    function generateDirtTile(scale = 4) {
        if (cache['dirt']) return cache['dirt'];
        const sz = 16;
        const c = createCanvas(sz * scale, sz * scale);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawRect(ctx, 0, 0, sz * scale, sz * scale, '#9B7424');
        for (let i = 0; i < 8; i++) {
            const gx = Math.floor(Math.random() * sz) * scale;
            const gy = Math.floor(Math.random() * sz) * scale;
            drawRect(ctx, gx, gy, scale, scale, i % 2 ? '#A8823A' : '#8B6914');
        }
        cache['dirt'] = c;
        return c;
    }

    // ---- BUILDINGS (inspired by reference: red barn with silo) ----
    function generateBarn(scale = 4) {
        if (cache['barn']) return cache['barn'];
        const w = 24, h = 20;
        const c = createCanvas(w * scale, h * scale);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const s = scale;
        // Walls - warm red like reference
        drawRect(ctx, 2 * s, 8 * s, 20 * s, 12 * s, '#C44040');
        // Horizontal plank lines
        for (let i = 0; i < 6; i++) {
            drawRect(ctx, 2 * s, (9 + i * 2) * s, 20 * s, s, '#B03535');
        }
        // Roof
        for (let i = 0; i < 8; i++) {
            drawRect(ctx, (2 + i) * s, (8 - i) * s, (20 - i * 2) * s, s, '#8B2525');
        }
        // Roof trim
        drawRect(ctx, 2 * s, 8 * s, 20 * s, s, '#A03030');
        // Door
        drawRect(ctx, 9 * s, 12 * s, 6 * s, 8 * s, '#5a2a0a');
        drawRect(ctx, 10 * s, 13 * s, 4 * s, 7 * s, '#7a4020');
        // Door cross
        drawRect(ctx, 11.5 * s, 13 * s, s, 7 * s, '#5a2a0a');
        drawRect(ctx, 10 * s, 16 * s, 4 * s, s, '#5a2a0a');
        // Windows with warm glow
        drawRect(ctx, 4 * s, 11 * s, 3 * s, 3 * s, '#FFE4A0');
        drawRect(ctx, 17 * s, 11 * s, 3 * s, 3 * s, '#FFE4A0');
        // Window cross panes
        drawRect(ctx, 5 * s, 11 * s, s, 3 * s, '#5a2a0a');
        drawRect(ctx, 4 * s, 12 * s, 3 * s, s, '#5a2a0a');
        drawRect(ctx, 18 * s, 11 * s, s, 3 * s, '#5a2a0a');
        drawRect(ctx, 17 * s, 12 * s, 3 * s, s, '#5a2a0a');
        cache['barn'] = c;
        return c;
    }

    function generateTruck(scale = 4) {
        if (cache['truck']) return cache['truck'];
        const w = 20, h = 12;
        const c = createCanvas(w * scale, h * scale);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const s = scale;
        // Cargo - wooden crate style
        drawRect(ctx, 0, s, 12 * s, 7 * s, '#A0845C');
        drawRect(ctx, 0, s, 12 * s, s, '#8B7040');
        drawRect(ctx, 0, 4 * s, 12 * s, s, '#8B7040');
        // Vertical plank lines
        for (let x = 0; x < 12; x += 3) {
            drawRect(ctx, x * s, s, s, 7 * s, '#7A6030');
        }
        // Cabin
        drawRect(ctx, 12 * s, 2 * s, 8 * s, 6 * s, '#4AA0D4');
        drawRect(ctx, 14 * s, 3 * s, 5 * s, 3 * s, '#B0E0FF');
        // Cabin detail
        drawRect(ctx, 12 * s, 2 * s, 8 * s, s, '#3888B8');
        // Wheels
        drawRect(ctx, 2 * s, 8 * s, 4 * s, 4 * s, '#333');
        drawRect(ctx, 14 * s, 8 * s, 4 * s, 4 * s, '#333');
        drawRect(ctx, 3 * s, 9 * s, 2 * s, 2 * s, '#666');
        drawRect(ctx, 15 * s, 9 * s, 2 * s, 2 * s, '#666');
        // Wheel highlight
        drawRect(ctx, 3 * s, 9 * s, s, s, '#888');
        drawRect(ctx, 15 * s, 9 * s, s, s, '#888');
        cache['truck'] = c;
        return c;
    }

    // ---- HOUSE INTERIOR (reference: warm wooden floor, patterned wallpaper, cozy furniture) ----
    function generateHouseInterior(scale = 2) {
        if (cache['houseInterior']) return cache['houseInterior'];
        const w = 480, h = 320;
        const c = createCanvas(w, h);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const s = scale;

        // === WALL with warm wallpaper pattern ===
        const wallH = Math.floor(h * 0.55);
        // Base wall color - warm cream
        drawRect(ctx, 0, 0, w, wallH, '#E8D8B8');

        // Upper wall section - patterned wallpaper (diamond pattern like reference)
        const patH = Math.floor(wallH * 0.5);
        drawRect(ctx, 0, 0, w, patH, '#C4726E');  // warm reddish/pink like reference
        // Diamond pattern
        for (let py = 0; py < patH; py += 8 * s) {
            for (let px = 0; px < w; px += 8 * s) {
                const ox = ((py / (8 * s)) % 2) * 4 * s;
                drawRect(ctx, px + ox + 2 * s, py + 2 * s, 4 * s, 4 * s, '#B86060');
                drawRect(ctx, px + ox + 3 * s, py + 3 * s, 2 * s, 2 * s, '#CC8080');
            }
        }
        // Wallpaper divider trim (wooden strip between upper and lower wall)
        drawRect(ctx, 0, patH - 2, w, 4 * s, '#8B6A40');
        drawRect(ctx, 0, patH + 2, w, 2, '#6B4A20');

        // Lower wall - warm cream with wainscoting
        drawRect(ctx, 0, patH + 2 * s, w, wallH - patH - 2 * s, '#E8D8B8');
        // Wainscoting vertical lines
        for (let px = 0; px < w; px += 24 * s) {
            drawRect(ctx, px, patH + 4 * s, 2, wallH - patH - 6 * s, '#D0C0A0');
        }

        // === FLOOR - warm wooden planks ===
        for (let y = wallH; y < h; y += 8 * s) {
            // Alternating plank colors
            const shade = ((y - wallH) / (8 * s)) % 2 === 0;
            drawRect(ctx, 0, y, w, 8 * s, shade ? '#B08050' : '#A07040');
            // Plank gaps
            drawRect(ctx, 0, y, w, s, '#906030');
            // Knots and grain detail
            for (let x = 0; x < w; x += 30 * s) {
                const offset = shade ? 15 * s : 0;
                drawRect(ctx, x + offset, y + 3 * s, 2 * s, 2 * s, '#9A6838');
            }
        }
        // Floor-wall divider (baseboard)
        drawRect(ctx, 0, wallH - 2, w, 4 * s, '#7A5A30');
        drawRect(ctx, 0, wallH + 2 * s, w, 2, '#6A4A20');

        // === WINDOW (left side, large) ===
        const winX = 30 * s, winY = patH + 6 * s, winW = 50 * s, winH = 35 * s;
        // Window frame
        drawRect(ctx, winX - 3 * s, winY - 3 * s, winW + 6 * s, winH + 6 * s, '#7A5A30');
        drawRect(ctx, winX - 2 * s, winY - 2 * s, winW + 4 * s, winH + 4 * s, '#8B6A40');
        // Glass - blue sky with gradient
        drawRect(ctx, winX, winY, winW, winH, '#87CEEB');
        drawRect(ctx, winX, winY, winW, winH / 3, '#A0D8F0');
        // Clouds through window
        drawRect(ctx, winX + 8 * s, winY + 4 * s, 14 * s, 4 * s, '#E8F4FF');
        drawRect(ctx, winX + 10 * s, winY + 2 * s, 10 * s, 3 * s, '#E8F4FF');
        drawRect(ctx, winX + 28 * s, winY + 6 * s, 10 * s, 3 * s, '#E8F4FF');
        // Window pane dividers
        drawRect(ctx, winX + winW / 2 - s, winY, 2 * s, winH, '#7A5A30');
        drawRect(ctx, winX, winY + winH / 2 - s, winW, 2 * s, '#7A5A30');
        // Window sill
        drawRect(ctx, winX - 4 * s, winY + winH + s, winW + 8 * s, 3 * s, '#8B6A40');

        // Curtains (warm red-orange, gathered)
        const curtL = winX - 8 * s, curtR = winX + winW + 2 * s;
        for (let cy = winY - 4 * s; cy < winY + winH + s; cy += 2 * s) {
            drawRect(ctx, curtL, cy, 6 * s, 2 * s, '#CC5555');
            drawRect(ctx, curtR, cy, 6 * s, 2 * s, '#CC5555');
            // Curtain fold highlight
            drawRect(ctx, curtL + s, cy, 2 * s, 2 * s, '#DD7070');
            drawRect(ctx, curtR + 3 * s, cy, 2 * s, 2 * s, '#DD7070');
        }
        // Curtain rod
        drawRect(ctx, curtL - 2 * s, winY - 6 * s, winW + 18 * s, 2 * s, '#8B6A40');

        // === TABLE (center-right) ===
        const tblX = 155 * s, tblY = wallH + 4 * s, tblW = 55 * s, tblH = 5 * s;
        drawRect(ctx, tblX, tblY, tblW, tblH, '#8B6A40');
        drawRect(ctx, tblX + 2 * s, tblY + s, tblW - 4 * s, 2 * s, '#A07E50');
        // Table legs
        drawRect(ctx, tblX + 3 * s, tblY + tblH, 3 * s, 30 * s, '#7A5A30');
        drawRect(ctx, tblX + tblW - 6 * s, tblY + tblH, 3 * s, 30 * s, '#7A5A30');
        // Letter on table (with wax seal visible)
        drawRect(ctx, tblX + 18 * s, tblY - 6 * s, 20 * s, 14 * s, '#FFF8E0');
        drawRect(ctx, tblX + 19 * s, tblY - 4 * s, 18 * s, s, '#C0B090');
        drawRect(ctx, tblX + 19 * s, tblY - 2 * s, 16 * s, s, '#C0B090');
        drawRect(ctx, tblX + 19 * s, tblY, 14 * s, s, '#C0B090');
        drawRect(ctx, tblX + 19 * s, tblY + 2 * s, 12 * s, s, '#C0B090');
        // Wax seal on letter
        drawRect(ctx, tblX + 25 * s, tblY + 4 * s, 4 * s, 4 * s, '#C83030');
        drawRect(ctx, tblX + 26 * s, tblY + 5 * s, 2 * s, 2 * s, '#E05050');

        // === COUCH (left side, green like reference) ===
        const couchX = 8 * s, couchY = wallH + 15 * s;
        // Couch back
        drawRect(ctx, couchX, couchY, 40 * s, 15 * s, '#6B9E5B');
        drawRect(ctx, couchX + 2 * s, couchY + 2 * s, 36 * s, 8 * s, '#7BAE6B');
        // Couch cushions
        drawRect(ctx, couchX + 2 * s, couchY + 10 * s, 17 * s, 8 * s, '#5B8E4B');
        drawRect(ctx, couchX + 21 * s, couchY + 10 * s, 17 * s, 8 * s, '#5B8E4B');
        // Cushion highlights
        drawRect(ctx, couchX + 4 * s, couchY + 12 * s, 13 * s, 4 * s, '#6B9E5B');
        drawRect(ctx, couchX + 23 * s, couchY + 12 * s, 13 * s, 4 * s, '#6B9E5B');
        // Couch armrests
        drawRect(ctx, couchX - 2 * s, couchY + 5 * s, 4 * s, 14 * s, '#5B8E4B');
        drawRect(ctx, couchX + 38 * s, couchY + 5 * s, 4 * s, 14 * s, '#5B8E4B');
        // Couch legs
        drawRect(ctx, couchX + s, couchY + 18 * s, 3 * s, 3 * s, '#5a3921');
        drawRect(ctx, couchX + 36 * s, couchY + 18 * s, 3 * s, 3 * s, '#5a3921');
        // Throw pillow
        drawRect(ctx, couchX + 6 * s, couchY + 4 * s, 8 * s, 8 * s, '#E8A040');
        drawRect(ctx, couchX + 7 * s, couchY + 5 * s, 6 * s, 6 * s, '#F0B858');

        // === POTTED PLANT (far left) ===
        const plantX = 8 * s, plantY = wallH - 8 * s;
        // Pot
        drawRect(ctx, plantX, plantY + 12 * s, 12 * s, 10 * s, '#CC7744');
        drawRect(ctx, plantX + s, plantY + 12 * s, 10 * s, 2 * s, '#DD8855');
        // Leaves
        drawRect(ctx, plantX + 3 * s, plantY, 6 * s, 6 * s, '#4A9A4A');
        drawRect(ctx, plantX + s, plantY + 2 * s, 4 * s, 4 * s, '#5BAE5B');
        drawRect(ctx, plantX + 7 * s, plantY + 2 * s, 4 * s, 5 * s, '#5BAE5B');
        drawRect(ctx, plantX + 4 * s, plantY - 2 * s, 4 * s, 4 * s, '#6BC06B');
        // Stem
        drawRect(ctx, plantX + 5 * s, plantY + 6 * s, 2 * s, 6 * s, '#3D7A2D');

        // === BOOKSHELF (right side) ===
        const bsX = 200 * s, bsY = patH + 4 * s;
        drawRect(ctx, bsX, bsY, 30 * s, 45 * s, '#7A5A30');
        drawRect(ctx, bsX + 2 * s, bsY + 2 * s, 26 * s, 12 * s, '#5A3A10');
        drawRect(ctx, bsX + 2 * s, bsY + 16 * s, 26 * s, 12 * s, '#5A3A10');
        drawRect(ctx, bsX + 2 * s, bsY + 30 * s, 26 * s, 12 * s, '#5A3A10');
        // Books row 1
        const bookColors = ['#C03030', '#3060C0', '#30A030', '#C0A030', '#8030A0', '#C06030'];
        bookColors.forEach((col, i) => {
            drawRect(ctx, bsX + (3 + i * 4) * s, bsY + 3 * s, 3 * s, 10 * s, col);
        });
        // Books row 2
        ['#D04040', '#4070D0', '#D0B040', '#40B040', '#A040B0'].forEach((col, i) => {
            drawRect(ctx, bsX + (3 + i * 5) * s, bsY + 17 * s, 4 * s, 10 * s, col);
        });
        // Books row 3
        ['#E06060', '#5080E0', '#50C050'].forEach((col, i) => {
            drawRect(ctx, bsX + (4 + i * 8) * s, bsY + 31 * s, 6 * s, 10 * s, col);
        });

        // === DOOR (right wall) ===
        const doorX = 195 * s, doorY = 4 * s;
        drawRect(ctx, doorX, doorY, 35 * s, wallH - doorY, '#6B4A28');
        drawRect(ctx, doorX + 3 * s, doorY + 3 * s, 29 * s, wallH - doorY - 6 * s, '#7A5A35');
        // Door panels
        drawRect(ctx, doorX + 5 * s, doorY + 5 * s, 25 * s, 15 * s, '#6B4A28');
        drawRect(ctx, doorX + 6 * s, doorY + 6 * s, 23 * s, 13 * s, '#8B6A42');
        drawRect(ctx, doorX + 5 * s, doorY + 24 * s, 25 * s, 20 * s, '#6B4A28');
        drawRect(ctx, doorX + 6 * s, doorY + 25 * s, 23 * s, 18 * s, '#8B6A42');
        // Door knob
        drawRect(ctx, doorX + 26 * s, doorY + 28 * s, 3 * s, 3 * s, '#E0C060');
        drawRect(ctx, doorX + 27 * s, doorY + 29 * s, s, s, '#FFE080');

        // === SMALL CARPET ===
        const carpetX = 90 * s, carpetY = wallH + 28 * s;
        drawRect(ctx, carpetX, carpetY, 50 * s, 24 * s, '#C05050');
        drawRect(ctx, carpetX + 2 * s, carpetY + 2 * s, 46 * s, 20 * s, '#D06060');
        drawRect(ctx, carpetX + 4 * s, carpetY + 4 * s, 42 * s, 16 * s, '#C85555');
        // Pattern
        drawRect(ctx, carpetX + 8 * s, carpetY + 8 * s, 34 * s, 8 * s, '#B84545');
        drawRect(ctx, carpetX + 12 * s, carpetY + 10 * s, 26 * s, 4 * s, '#C85555');

        cache['houseInterior'] = c;
        return c;
    }

    // ---- FARM LANDSCAPE (reference: red barn, windmill, silo, fence, bright sky) ----
    function generateFarmLandscape(scale = 2) {
        if (cache['farmLandscape']) return cache['farmLandscape'];
        const w = 480, h = 320;
        const c = createCanvas(w, h);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const s = scale;

        // Sky - bright cyan like reference
        for (let y = 0; y < h * 0.55; y++) {
            const t = y / (h * 0.55);
            const r = Math.floor(100 + t * 30);
            const g = Math.floor(190 + t * 20);
            const b = Math.floor(240 - t * 20);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, y, w, 1);
        }
        // Sun
        drawRect(ctx, 390, 20, 30, 30, '#FFDD44');
        drawRect(ctx, 386, 24, 38, 22, '#FFDD44');
        drawRect(ctx, 394, 16, 22, 38, '#FFDD44');
        // Sun rays
        drawRect(ctx, 400, 10, 10, 6, '#FFE880');
        drawRect(ctx, 380, 30, 6, 10, '#FFE880');
        drawRect(ctx, 424, 30, 6, 10, '#FFE880');

        // Clouds - fluffy pixel clouds
        function drawCloud(cx, cy, w) {
            drawRect(ctx, cx, cy, w, 10, '#FFFFFF');
            drawRect(ctx, cx + 6, cy - 6, w - 12, 8, '#FFFFFF');
            drawRect(ctx, cx + 3, cy - 3, w - 6, 6, '#F8F8FF');
        }
        drawCloud(50, 50, 70);
        drawCloud(180, 35, 55);
        drawCloud(320, 55, 45);

        // Hills background
        const ground = Math.floor(h * 0.55);
        for (let x = 0; x < w; x += 2) {
            const hillH = Math.sin(x * 0.008) * 35 + Math.sin(x * 0.02) * 18 + 25;
            drawRect(ctx, x, ground - hillH, 2, hillH, '#3D8A30');
        }

        // Ground - bright green like reference
        drawRect(ctx, 0, ground, w, h - ground, '#5BAE5B');
        // Grass variation
        for (let x = 0; x < w; x += 4) {
            if (Math.random() > 0.6) drawRect(ctx, x, ground, 4, 4, '#4A9A4A');
            if (Math.random() > 0.8) drawRect(ctx, x, ground + 4, 4, 4, '#6BC06B');
        }

        // Barn (reference style: red with white/gray roof trim)
        const barnX = 300, barnY = ground - 60;
        drawRect(ctx, barnX, barnY + 20, 70, 40, '#C44040');
        // Plank lines
        for (let i = 0; i < 4; i++) {
            drawRect(ctx, barnX, barnY + 22 + i * 10, 70, 2, '#B03535');
        }
        // Roof
        for (let i = 0; i < 20; i++) {
            drawRect(ctx, barnX - 5 + i, barnY + 20 - i, 80 - i * 2, 2, '#8B2525');
        }
        // Barn door
        drawRect(ctx, barnX + 25, barnY + 35, 20, 25, '#5a2a0a');
        drawRect(ctx, barnX + 27, barnY + 37, 16, 23, '#7a4020');
        // Barn windows
        drawRect(ctx, barnX + 8, barnY + 30, 12, 10, '#FFE4A0');
        drawRect(ctx, barnX + 50, barnY + 30, 12, 10, '#FFE4A0');

        // Silo (from reference)
        drawRect(ctx, barnX - 20, barnY + 5, 16, 55, '#A0A8B0');
        drawRect(ctx, barnX - 22, barnY, 20, 8, '#888E98');
        drawRect(ctx, barnX - 18, barnY - 4, 12, 6, '#8890A0');

        // Windmill (from reference)
        const millX = 210, millY = ground - 50;
        drawRect(ctx, millX + 8, millY + 15, 20, 35, '#B09870');
        drawRect(ctx, millX + 6, millY + 12, 24, 6, '#9A8060');
        // Windmill blades
        drawRect(ctx, millX + 15, millY - 15, 6, 30, '#8B7050');
        drawRect(ctx, millX + 3, millY, 30, 6, '#8B7050');
        // Blade tips
        drawRect(ctx, millX + 16, millY - 18, 4, 6, '#7A6040');
        drawRect(ctx, millX + 16, millY + 12, 4, 6, '#7A6040');
        drawRect(ctx, millX, millY + 1, 6, 4, '#7A6040');
        drawRect(ctx, millX + 30, millY + 1, 6, 4, '#7A6040');

        // Fence (wooden, like reference)
        for (let x = 20; x < 190; x += 20) {
            drawRect(ctx, x, ground - 6, 4, 20, '#8B6A40');
            drawRect(ctx, x + 1, ground - 6, 2, 2, '#A08050');
        }
        drawRect(ctx, 20, ground - 2, 170, 4, '#8B6A40');
        drawRect(ctx, 20, ground + 6, 170, 4, '#8B6A40');

        // Some trees (like reference)
        function drawTree(tx, ty) {
            drawRect(ctx, tx + 4, ty + 16, 6, 16, '#6B4A28');
            drawRect(ctx, tx, ty, 14, 18, '#3D8A30');
            drawRect(ctx, tx + 2, ty - 4, 10, 8, '#4A9A4A');
            drawRect(ctx, tx + 4, ty - 6, 6, 5, '#5BAE5B');
        }
        drawTree(30, ground - 40);
        drawTree(100, ground - 35);
        drawTree(440, ground - 30);

        // Dirt path
        drawRect(ctx, 200, ground + 8, 35, h - ground - 8, '#A08050');
        drawRect(ctx, 202, ground + 8, 31, h - ground - 8, '#B09060');

        // Hot air balloon (from reference)
        drawRect(ctx, 420, 15, 20, 25, '#E05050');
        drawRect(ctx, 422, 13, 16, 4, '#E05050');
        drawRect(ctx, 424, 10, 12, 4, '#E06060');
        drawRect(ctx, 426, 40, 8, 4, '#A08050');
        drawRect(ctx, 427, 44, 6, 4, '#8B7040');
        // Balloon stripe
        drawRect(ctx, 420, 22, 20, 4, '#F0E060');

        cache['farmLandscape'] = c;
        return c;
    }

    // ---- SHOP ICON ----
    function generateShopIcon(scale = 4) {
        if (cache['shop']) return cache['shop'];
        const w = 12, h = 12;
        const c = createCanvas(w * scale, h * scale);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const s = scale;
        drawRect(ctx, s, 4 * s, 10 * s, 8 * s, '#E8C84A');
        drawRect(ctx, 0, 2 * s, 12 * s, 2 * s, '#C8A838');
        drawRect(ctx, 2 * s, 0, 8 * s, 2 * s, '#C8A838');
        // $ sign
        drawRect(ctx, 5 * s, 5 * s, 2 * s, 6 * s, '#5a3921');
        drawRect(ctx, 3 * s, 6 * s, 6 * s, s, '#5a3921');
        drawRect(ctx, 3 * s, 9 * s, 6 * s, s, '#5a3921');
        cache['shop'] = c;
        return c;
    }

    // ---- EQUIPMENT SPRITES ----
    function generateEquipment(name, scale = 4) {
        const key = `equip_${name}`;
        if (cache[key]) return cache[key];
        const w = 10, h = 10;
        const c = createCanvas(w * scale, h * scale);
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const s = scale;

        if (name === 'Corn Popper') {
            drawRect(ctx, 2 * s, 3 * s, 6 * s, 6 * s, '#888');
            drawRect(ctx, 3 * s, 1 * s, 4 * s, 2 * s, '#666');
            drawRect(ctx, 4 * s, 0, 2 * s, s, '#aaa');
            drawRect(ctx, 3 * s, 4 * s, 4 * s, 4 * s, '#FFF5CC');
        } else if (name === 'Mill') {
            drawRect(ctx, 3 * s, 2 * s, 4 * s, 7 * s, '#A0845C');
            drawRect(ctx, s, 4 * s, 8 * s, 2 * s, '#7A6040');
            drawRect(ctx, 4 * s, 0, 2 * s, 2 * s, '#666');
        } else if (name === 'Oven') {
            drawRect(ctx, s, 2 * s, 8 * s, 7 * s, '#777');
            drawRect(ctx, 2 * s, 3 * s, 6 * s, 4 * s, '#FF6600');
            drawRect(ctx, 3 * s, 4 * s, 4 * s, 2 * s, '#FFAA00');
            drawRect(ctx, s, s, 8 * s, s, '#999');
        }
        cache[key] = c;
        return c;
    }

    return {
        generateHolly,
        generateCropSprite,
        generateGrassTile,
        generateDirtTile,
        generateBarn,
        generateTruck,
        generateHouseInterior,
        generateFarmLandscape,
        generateShopIcon,
        generateEquipment,
        drawPixel, drawRect, createCanvas
    };
})();
