// ============================================================
// settingsScene.js — Sound settings
// ============================================================
const SettingsScene = (() => {
    let volume = 0.5;
    let sliderDragging = false;
    let hoverBack = false;

    function init() {
        volume = AudioManager.getVolume();
        sliderDragging = false;
        hoverBack = false;
    }

    function update(dt) { }

    function render(ctx) {
        const W = 960, H = 640;

        // Background
        for (let y = 0; y < H; y++) {
            const t = y / H;
            ctx.fillStyle = `rgb(${Math.floor(20 + t * 15)},${Math.floor(25 + t * 20)},${Math.floor(45 + t * 30)})`;
            ctx.fillRect(0, y, W, 1);
        }

        ctx.save();
        ctx.textAlign = 'center';

        // Title
        ctx.font = '28px "Press Start 2P", monospace';
        ctx.fillStyle = '#7dda5c';
        ctx.fillText('SETTINGS', W / 2, 80);

        // Decorative line
        ctx.fillStyle = '#5dba3c';
        ctx.fillRect(W / 2 - 100, 95, 200, 3);

        // Sound label
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = '#cde8c0';
        ctx.fillText('SOUND VOLUME', W / 2, 200);

        // Volume bar background
        const barX = W / 2 - 150, barY = 230, barW = 300, barH = 30;
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = '#5dba3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);

        // Volume fill
        const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW * volume, 0);
        fillGrad.addColorStop(0, '#3d9a1c');
        fillGrad.addColorStop(1, '#7dda5c');
        ctx.fillStyle = fillGrad;
        ctx.fillRect(barX + 2, barY + 2, (barW - 4) * volume, barH - 4);

        // Volume knob
        const knobX = barX + barW * volume;
        ctx.fillStyle = '#fff';
        ctx.fillRect(knobX - 4, barY - 4, 8, barH + 8);
        ctx.fillStyle = '#5dba3c';
        ctx.fillRect(knobX - 2, barY - 2, 4, barH + 4);

        // Volume percentage
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#f5c542';
        ctx.fillText(Math.round(volume * 100) + '%', W / 2, barY + barH + 35);

        // Mute toggle
        const muted = AudioManager.isMuted();
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = muted ? '#e74c3c' : '#5dba3c';
        ctx.fillText(muted ? '🔇 MUTED (Click to unmute)' : '🔊 ON (Click to mute)', W / 2, 340);

        // Back button
        const backBtnX = W / 2 - 100, backBtnY = 440, backBtnW = 200, backBtnH = 48;
        ctx.fillStyle = hoverBack ? '#4a9a2a' : '#2a5a1a';
        ctx.fillRect(backBtnX, backBtnY, backBtnW, backBtnH);
        ctx.strokeStyle = hoverBack ? '#7dda5c' : '#5dba3c';
        ctx.lineWidth = 3;
        ctx.strokeRect(backBtnX, backBtnY, backBtnW, backBtnH);
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = hoverBack ? '#fff' : '#cde8c0';
        ctx.fillText('BACK', W / 2, backBtnY + 30);

        ctx.restore();
    }

    function onMouseMove(x, y) {
        const W = 960;
        hoverBack = (x >= W / 2 - 100 && x <= W / 2 + 100 && y >= 440 && y <= 488);

        if (sliderDragging) {
            const barX = W / 2 - 150, barW = 300;
            volume = Math.max(0, Math.min(1, (x - barX) / barW));
            AudioManager.setVolume(volume);
        }
    }

    function onClick(x, y) {
        const W = 960;
        // Back button
        if (x >= W / 2 - 100 && x <= W / 2 + 100 && y >= 440 && y <= 488) {
            AudioManager.playClick();
            Game.changeScene('title');
            return;
        }
        // Slider
        const barX = W / 2 - 150, barY = 230, barW = 300, barH = 30;
        if (x >= barX - 10 && x <= barX + barW + 10 && y >= barY - 10 && y <= barY + barH + 10) {
            volume = Math.max(0, Math.min(1, (x - barX) / barW));
            AudioManager.setVolume(volume);
            sliderDragging = true;
        }
        // Mute toggle
        if (y >= 320 && y <= 360 && x >= W / 2 - 200 && x <= W / 2 + 200) {
            AudioManager.toggleMute();
        }
    }

    function onMouseUp() {
        sliderDragging = false;
    }

    return { init, update, render, onMouseMove, onClick, onMouseUp };
})();
