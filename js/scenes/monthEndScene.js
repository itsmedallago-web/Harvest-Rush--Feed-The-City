// ============================================================
// monthEndScene.js — Month summary + crop selection
// ============================================================
const MonthEndScene = (() => {
    let hoverBtn = '';
    let choices = [];
    let selectedChoice = null;

    function init() {
        hoverBtn = '';
        selectedChoice = null;
        const state = Game.state;
        const nextMonth = (state.month || 1) + 1;

        if (nextMonth === 2) {
            // Choose 1 of 3: corn, rice, wheat
            choices = ['corn', 'rice', 'wheat'];
        } else if (nextMonth === 3) {
            // Choose 1 of remaining crops + processed items
            const alreadyUnlocked = state.unlockedCrops || ['lettuce'];
            const remaining = ['corn', 'rice', 'wheat'].filter(c => !alreadyUnlocked.includes(c));
            // Add processed items options
            choices = [...remaining].slice(0, 3);
        } else {
            choices = [];
        }
    }

    function update(dt) { }

    function render(ctx) {
        const W = 960, H = 640;

        // Background
        for (let y = 0; y < H; y++) {
            const t = y / H;
            ctx.fillStyle = `rgb(${Math.floor(15 + t * 15)},${Math.floor(20 + t * 20)},${Math.floor(35 + t * 25)})`;
            ctx.fillRect(0, y, W, 1);
        }

        const state = Game.state;
        ctx.save();
        ctx.textAlign = 'center';

        // Title
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.fillStyle = '#f5c542';
        ctx.fillText(`MONTH ${state.month} COMPLETE!`, W / 2, 70);

        // Stats
        ctx.font = '12px "Press Start 2P", monospace';
        const statsY = 130;
        ctx.fillStyle = '#cde8c0';
        ctx.fillText(`Food Delivered: ${state.monthFood || 0} / ${state.foodGoal}`, W / 2, statsY);

        const goalMet = (state.monthFood || state.food || 0) >= (state.foodGoal || 30);
        ctx.fillStyle = goalMet ? '#5dba3c' : '#e74c3c';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText(goalMet ? '★ GOAL ACHIEVED! ★' : 'Goal not met... Keep trying!', W / 2, statsY + 35);

        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = '#87CEEB';
        ctx.fillText(`Money: $${(state.money || 0).toFixed(1)}`, W / 2 - 150, statsY + 70);
        ctx.fillStyle = '#7dda5c';
        ctx.fillText(`XP: ${state.xp || 0}`, W / 2 + 150, statsY + 70);

        // Crop selection
        if (choices.length > 0) {
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText('Choose a new crop to unlock:', W / 2, 290);

            const cardW = 180, cardH = 180, gap = 30;
            const totalW = choices.length * cardW + (choices.length - 1) * gap;
            const startX = W / 2 - totalW / 2;

            choices.forEach((choice, i) => {
                const cx = startX + i * (cardW + gap);
                const cy = 310;
                const isHover = hoverBtn === `choice_${i}`;
                const isSelected = selectedChoice === i;
                const isProcessed = !!PROCESSED_ITEMS[choice];
                const itemData = isProcessed ? PROCESSED_ITEMS[choice] : CROPS[choice];

                // Card bg
                ctx.fillStyle = isSelected ? '#4a9a2a' : (isHover ? '#3a5a2a' : '#2a3a1a');
                ctx.fillRect(cx, cy, cardW, cardH);
                ctx.strokeStyle = isSelected ? '#7dda5c' : (isHover ? '#5dba3c' : '#3a5a2a');
                ctx.lineWidth = isSelected ? 3 : 2;
                ctx.strokeRect(cx, cy, cardW, cardH);

                // Color swatch
                ctx.fillStyle = itemData.color;
                ctx.fillRect(cx + cardW / 2 - 20, cy + 15, 40, 30);

                // Name
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillStyle = '#fff';
                ctx.fillText(itemData.name, cx + cardW / 2, cy + 65);

                // Stats
                ctx.font = '8px "Press Start 2P", monospace';
                ctx.fillStyle = '#f5c542';
                ctx.fillText(`$${itemData.price}`, cx + cardW / 2, cy + 90);
                ctx.fillStyle = '#7dda5c';
                ctx.fillText(`${itemData.xp} XP`, cx + cardW / 2, cy + 110);
                ctx.fillStyle = '#e8a040';
                ctx.fillText(`${itemData.food} food`, cx + cardW / 2, cy + 130);

                if (!isProcessed) {
                    ctx.fillStyle = '#87CEEB';
                    ctx.fillText(`${itemData.growDays} days`, cx + cardW / 2, cy + 150);
                } else {
                    ctx.fillStyle = '#c8a838';
                    ctx.fillText('Processed', cx + cardW / 2, cy + 150);
                }

                // Selection checkbox
                if (isSelected) {
                    ctx.fillStyle = '#7dda5c';
                    ctx.fillText('✓ SELECTED', cx + cardW / 2, cy + 172);
                }
            });
        }

        // Continue button
        const btnW = 260, btnH = 50;
        const btnX = W / 2 - btnW / 2, btnY = 540;
        const canContinue = choices.length === 0 || selectedChoice !== null;
        const btnHover = hoverBtn === 'continue';
        ctx.fillStyle = canContinue ? (btnHover ? '#4a9a2a' : '#2a5a1a') : '#1a2a1a';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = canContinue ? '#5dba3c' : '#2a3a2a';
        ctx.lineWidth = 3;
        ctx.strokeRect(btnX, btnY, btnW, btnH);
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = canContinue ? '#fff' : '#555';
        ctx.fillText('CONTINUE', W / 2, btnY + 32);

        ctx.restore();
    }

    function onMouseMove(x, y) {
        const W = 960;
        hoverBtn = '';

        // Choice cards
        const cardW = 180, cardH = 180, gap = 30;
        const totalW = choices.length * cardW + (choices.length - 1) * gap;
        const startX = W / 2 - totalW / 2;
        choices.forEach((_, i) => {
            const cx = startX + i * (cardW + gap);
            if (x >= cx && x <= cx + cardW && y >= 310 && y <= 310 + cardH) {
                hoverBtn = `choice_${i}`;
            }
        });

        // Continue button
        const btnW = 260, btnH = 50;
        const btnX = W / 2 - btnW / 2, btnY = 540;
        if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
            hoverBtn = 'continue';
        }
    }

    function onClick(x, y) {
        // Choice selection
        if (hoverBtn.startsWith('choice_')) {
            const idx = parseInt(hoverBtn.replace('choice_', ''));
            selectedChoice = idx;
            AudioManager.playSelect();
            return;
        }

        // Continue
        if (hoverBtn === 'continue') {
            const canContinue = choices.length === 0 || selectedChoice !== null;
            if (!canContinue) return;

            AudioManager.playClick();

            const state = Game.state;
            const newCrops = [...(state.unlockedCrops || ['lettuce'])];

            if (selectedChoice !== null && choices[selectedChoice]) {
                const chosen = choices[selectedChoice];
                if (!newCrops.includes(chosen)) {
                    newCrops.push(chosen);
                }
            }

            Game.state = {
                continuing: true,
                money: state.money,
                xp: state.xp,
                food: 0,  // Reset food for new month
                month: (state.month || 1) + 1,
                unlockedCrops: newCrops,
                equipment: state.equipment || {},
                inventory: state.inventory || {}
            };

            Game.changeScene('farm');
        }
    }

    return { init, update, render, onMouseMove, onClick };
})();
