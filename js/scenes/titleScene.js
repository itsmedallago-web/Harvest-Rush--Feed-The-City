// ============================================================
// titleScene.js — Title screen with Play, Settings, Quit
// ============================================================
const TitleScene = (() => {
    const buttons = [
        { id: 'play', label: 'PLAY', y: 0 },
        { id: 'settings', label: 'SETTINGS', y: 0 },
        { id: 'quit', label: 'QUIT', y: 0 }
    ];
    let hovered = -1;
    let stars = [];
    let twinkleTimer = 0;

    function init() {
        hovered = -1;
        stars = [];
        for (let i = 0; i < 60; i++) {
            stars.push({
                x: Math.random() * 960,
                y: Math.random() * 300,
                size: Math.random() * 3 + 1,
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.01
            });
        }
    }

    function update(dt) {
        twinkleTimer += dt;
    }

    function render(ctx) {
        const W = 960, H = 640;

        // Night sky gradient
        for (let y = 0; y < H * 0.6; y++) {
            const t = y / (H * 0.6);
            const r = Math.floor(15 + t * 20);
            const g = Math.floor(10 + t * 30);
            const b = Math.floor(40 + t * 50);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, y, W, 1);
        }

        // Stars
        stars.forEach(s => {
            const alpha = 0.4 + Math.sin(twinkleTimer * s.speed * 100 + s.twinkle) * 0.4;
            ctx.fillStyle = `rgba(255,255,220,${alpha})`;
            ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
        });

        // Ground
        for (let y = Math.floor(H * 0.6); y < H; y++) {
            const t = (y - H * 0.6) / (H * 0.4);
            const r = Math.floor(30 + t * 20);
            const g = Math.floor(70 + t * 30);
            const b = Math.floor(20 + t * 10);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, y, W, 1);
        }

        // Silhouette hills
        for (let x = 0; x < W; x += 2) {
            const hillH = Math.sin(x * 0.006) * 50 + Math.sin(x * 0.015) * 25 + 80;
            ctx.fillStyle = '#1a3a1a';
            ctx.fillRect(x, H * 0.6 - hillH + 40, 2, hillH);
        }

        // Barn silhouette
        ctx.fillStyle = '#15250f';
        ctx.fillRect(700, H * 0.6 - 80, 80, 80);
        // Barn roof
        ctx.beginPath();
        ctx.moveTo(690, H * 0.6 - 80);
        ctx.lineTo(740, H * 0.6 - 120);
        ctx.lineTo(790, H * 0.6 - 80);
        ctx.fill();
        // Barn window glow
        ctx.fillStyle = '#f0c040';
        ctx.fillRect(720, H * 0.6 - 60, 12, 12);
        ctx.fillRect(748, H * 0.6 - 60, 12, 12);

        // Title
        ctx.save();
        ctx.textAlign = 'center';

        // Title shadow
        ctx.font = '36px "Press Start 2P", monospace';
        ctx.fillStyle = '#2a5a1a';
        ctx.fillText('HARVEST RUSH', W / 2 + 3, 143);

        // Title text
        const titleGrad = ctx.createLinearGradient(0, 100, 0, 160);
        titleGrad.addColorStop(0, '#7dda5c');
        titleGrad.addColorStop(0.5, '#5dba3c');
        titleGrad.addColorStop(1, '#3d9a1c');
        ctx.fillStyle = titleGrad;
        ctx.fillText('HARVEST RUSH', W / 2, 140);

        // Subtitle
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = '#f5c542';
        ctx.fillText('FEED THE CITY', W / 2, 180);

        // Decorative line
        ctx.fillStyle = '#5dba3c';
        ctx.fillRect(W / 2 - 140, 195, 280, 3);

        // Buttons
        const btnW = 260, btnH = 48;
        const startY = 260;
        buttons.forEach((btn, i) => {
            btn.y = startY + i * 70;
            const isHovered = hovered === i;

            // Button bg
            ctx.fillStyle = isHovered ? '#4a9a2a' : '#2a5a1a';
            ctx.fillRect(W / 2 - btnW / 2, btn.y, btnW, btnH);

            // Button border
            ctx.strokeStyle = isHovered ? '#7dda5c' : '#5dba3c';
            ctx.lineWidth = 3;
            ctx.strokeRect(W / 2 - btnW / 2, btn.y, btnW, btnH);

            // Inner highlight
            if (isHovered) {
                ctx.fillStyle = 'rgba(125, 218, 92, 0.15)';
                ctx.fillRect(W / 2 - btnW / 2 + 3, btn.y + 3, btnW - 6, btnH - 6);
            }

            // Button text
            ctx.font = '18px "Press Start 2P", monospace';
            ctx.fillStyle = isHovered ? '#fff' : '#cde8c0';
            ctx.fillText(btn.label, W / 2, btn.y + btnH / 2 + 7);

            // Arrow indicators on hover
            if (isHovered) {
                ctx.fillText('▸', W / 2 - btnW / 2 + 20, btn.y + btnH / 2 + 7);
                ctx.fillText('◂', W / 2 + btnW / 2 - 20, btn.y + btnH / 2 + 7);
            }
        });

        // Version text
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#4a6a3a';
        ctx.fillText('DEMO v1.0', W / 2, H - 20);

        ctx.restore();
    }

    function onMouseMove(x, y) {
        const W = 960, btnW = 260, btnH = 48;
        hovered = -1;
        buttons.forEach((btn, i) => {
            if (x >= W / 2 - btnW / 2 && x <= W / 2 + btnW / 2 &&
                y >= btn.y && y <= btn.y + btnH) {
                hovered = i;
            }
        });
    }

    function onClick(x, y) {
        const W = 960, btnW = 260, btnH = 48;
        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            if (x >= W / 2 - btnW / 2 && x <= W / 2 + btnW / 2 &&
                y >= btn.y && y <= btn.y + btnH) {
                AudioManager.playClick();
                if (btn.id === 'play') {
                    AudioManager.init();
                    Game.changeScene('cutscene_intro');
                } else if (btn.id === 'settings') {
                    Game.changeScene('settings');
                } else if (btn.id === 'quit') {
                    // Can't really quit a web game, show message
                    alert('Thanks for playing Harvest Rush!');
                }
                return;
            }
        }
    }

    return { init, update, render, onMouseMove, onClick };
})();
