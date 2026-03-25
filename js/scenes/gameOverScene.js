// ============================================================
// gameOverScene.js — Game Over screen for missed food goals
// ============================================================
const GameOverScene = (() => {
    let hoverBtn = '';

    function init() {
        hoverBtn = '';
    }

    function update(dt) { }

    function render(ctx) {
        const W = 960, H = 640;

        // Background (dark red to indicate failure)
        for (let y = 0; y < H; y++) {
            const t = y / H;
            ctx.fillStyle = `rgb(${Math.floor(40 - t * 20)},${Math.floor(10 - t * 5)},${Math.floor(10 - t * 5)})`;
            ctx.fillRect(0, y, W, 1);
        }

        ctx.save();
        ctx.textAlign = 'center';

        // Title
        ctx.font = '32px "Press Start 2P", monospace';
        ctx.fillStyle = '#e74c3c';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 80);

        // Subtitle
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = '#f5c542';
        ctx.fillText('You did not achieve the food goal', W / 2, H / 2 - 20);

        // Stats summary
        const state = Game.state;
        if (state) {
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = '#aaa';
            ctx.fillText(`Food Delivered: ${state.monthFood || state.food || 0} / ${state.foodGoal}`, W / 2, H / 2 + 20);
            ctx.fillText(`Reached Month: ${state.month || 1}`, W / 2, H / 2 + 50);
        }

        // Back to Title Button
        const btnW = 320, btnH = 50;
        const btnX = W / 2 - btnW / 2, btnY = H / 2 + 120;
        const btnHover = hoverBtn === 'title';
        ctx.fillStyle = btnHover ? '#c0392b' : '#8e2a1e';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.strokeRect(btnX, btnY, btnW, btnH);
        
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('BACK TO TITLE', W / 2, btnY + 32);

        ctx.restore();
    }

    function onMouseMove(x, y) {
        const W = 960, H = 640;
        hoverBtn = '';

        const btnW = 320, btnH = 50;
        const btnX = W / 2 - btnW / 2, btnY = H / 2 + 120;
        if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
            hoverBtn = 'title';
        }
    }

    function onClick(x, y) {
        if (hoverBtn === 'title') {
            AudioManager.playClick();
            // Reset game state
            Game.state = null;
            Game.changeScene('title');
        }
    }

    return { init, update, render, onMouseMove, onClick };
})();
