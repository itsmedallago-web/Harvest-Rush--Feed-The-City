// ============================================================
// farmScene.js — Main gameplay: farm grid, planting, HUD, shop
// ============================================================
const FarmScene = (() => {
    // ---- STATE ----
    let plots = [];        // { crop, stage, dayPlanted, waterCount, waterToday, growthDay, processStep }
    let money = 5;
    let xp = 0;
    let food = 0;
    let currentDay = 1;
    let currentMonth = 1;
    let foodGoal = 30;
    let unlockedCrops = ['lettuce'];
    let equipment = {};    // { 'Corn Popper': true, ... }
    let selectedTool = null; // 'plant_lettuce', 'water', etc.
    let shopOpen = false;
    let selectedShopTab = 'seeds';
    let message = '';
    let messageTimer = 0;
    let dayTimer = 0;
    let paused = false;
    let hoverPlot = -1;
    let hoverBtn = '';
    let inventory = {};    // harvested crops: { lettuce: 3, corn: 2, ... }
    let processingQueue = []; // items being processed
    let daySpeed = 4;     // seconds per day
    let cameraX = 0;
    let cameraY = 0;

    // Farm grid config
    const GRID_COLS = 6;
    const GRID_ROWS = 4;
    const PLOT_SIZE = 72;
    const PLOT_PAD = 8;
    const FARM_X = 60;
    const FARM_Y = 120;

    // ---- INIT ----
    function init() {
        if (Game.state && Game.state.continuing) {
            // Restore state from Game.state
            money = Game.state.money || 5;
            xp = Game.state.xp || 0;
            food = Game.state.food || 0;
            currentDay = 1;
            currentMonth = Game.state.month || 1;
            unlockedCrops = Game.state.unlockedCrops || ['lettuce'];
            equipment = Game.state.equipment || {};
            inventory = Game.state.inventory || {};
        } else {
            money = 5;
            xp = 0;
            food = 0;
            currentDay = 1;
            currentMonth = 1;
            unlockedCrops = ['lettuce'];
            equipment = {};
            inventory = {};
        }
        const mc = MONTH_CONFIG[currentMonth - 1];
        foodGoal = mc ? mc.foodGoal : 30;
        selectedTool = null;
        shopOpen = false;
        message = mc ? mc.intro : '';
        messageTimer = 5;
        dayTimer = 0;
        paused = false;
        hoverPlot = -1;
        hoverBtn = '';
        processingQueue = [];

        // Init plots
        plots = [];
        for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
            plots.push({
                crop: null, stage: 'empty', dayPlanted: 0,
                waterCount: 0, waterToday: 0, growthDay: 0,
                processStep: 0
            });
        }
    }

    // ---- UPDATE ----
    function update(dt) {
        if (paused || shopOpen) return;

        // Message timer
        if (messageTimer > 0) {
            messageTimer -= dt;
        }

        // Day progression
        dayTimer += dt;
        if (dayTimer >= daySpeed) {
            dayTimer = 0;
            advanceDay();
        }

        // Processing queue (day-based, checked in advanceDay)
        // Show processing status 
        processingQueue.forEach(item => {
            // visual only — completion happens in advanceDay
        });
    }

    function advanceDay() {
        currentDay++;

        // Reset water count for today on all plots
        plots.forEach(p => {
            p.waterToday = 0;
        });

        // Grow crops
        plots.forEach(p => {
            if (p.crop && (p.stage === 'planted' || p.stage === 'growing' || p.stage === 'watered')) {
                p.growthDay++;
                const cropData = CROPS[p.crop];
                if (cropData && p.growthDay >= cropData.growDays) {
                    p.stage = 'ready';
                } else if (p.growthDay > 0) {
                    p.stage = 'growing';
                }
            }
        });

        // Check month end
        if (currentDay > 30) {
            endMonth();
            return;
        }

        // Advance processing queue (2-day processing)
        processingQueue = processingQueue.filter(item => {
            item.daysLeft--;
            if (item.daysLeft <= 0) {
                const pItem = PROCESSED_ITEMS[item.type];
                if (pItem) {
                    inventory[item.type] = (inventory[item.type] || 0) + 1;
                    showMessage(`${pItem.name} ready!`);
                    AudioManager.playHarvest();
                }
                return false;
            }
            return true;
        });
    }

    function endMonth() {
        paused = true;
        // Save state for next month
        Game.state = {
            money, xp, food, foodGoal,
            month: currentMonth,
            unlockedCrops: [...unlockedCrops],
            equipment: { ...equipment },
            inventory: { ...inventory },
            monthFood: food
        };

        if (food < foodGoal) {
            Game.changeScene('gameOver');
        } else if (currentMonth >= 3) {
            // Demo ends
            Game.changeScene('cutscene_ending');
        } else {
            Game.changeScene('monthEnd');
        }
    }

    // ---- ACTIONS ----
    function plantCrop(plotIndex, cropType) {
        const plot = plots[plotIndex];
        const cropData = CROPS[cropType];
        if (!cropData) return;
        if (plot.stage !== 'empty') {
            showMessage('This plot is already in use!');
            AudioManager.playError();
            return;
        }
        if (money < cropData.seedCost) {
            showMessage('Not enough money for seeds!');
            AudioManager.playError();
            return;
        }
        money -= cropData.seedCost;
        plot.crop = cropType;
        plot.stage = 'planted';
        plot.dayPlanted = currentDay;
        plot.waterCount = 0;
        plot.waterToday = 0;
        plot.growthDay = 0;
        plot.processStep = 0;
        AudioManager.playPlant();
        showMessage(`Planted ${cropData.name}!`);
    }

    function waterPlot(plotIndex) {
        const plot = plots[plotIndex];
        if (!plot.crop || plot.stage === 'empty' || plot.stage === 'ready') {
            showMessage('Nothing to water here!');
            return;
        }
        const cropData = CROPS[plot.crop];
        if (plot.waterToday >= cropData.waterPerDay) {
            showMessage('Already watered enough today!');
            return;
        }
        plot.waterToday++;
        plot.waterCount++;
        plot.stage = 'watered';
        AudioManager.playWater();
        showMessage(`Watered ${cropData.name}! (${plot.waterToday}/${cropData.waterPerDay})`);
    }

    function harvestPlot(plotIndex) {
        const plot = plots[plotIndex];
        if (plot.stage !== 'ready') {
            showMessage('Crop is not ready yet!');
            AudioManager.playError();
            return;
        }
        const cropData = CROPS[plot.crop];
        xp += cropData.xp;
        inventory[plot.crop] = (inventory[plot.crop] || 0) + 1;
        AudioManager.playHarvest();
        showMessage(`Harvested ${cropData.name}! +${cropData.xp} XP`);

        // Reset plot
        plot.crop = null;
        plot.stage = 'empty';
        plot.waterCount = 0;
        plot.waterToday = 0;
        plot.growthDay = 0;
    }

    function deliverToTruck(cropType) {
        const isProcessed = !!PROCESSED_ITEMS[cropType];
        const itemData = isProcessed ? PROCESSED_ITEMS[cropType] : CROPS[cropType];
        if (!itemData) return;
        if (!inventory[cropType] || inventory[cropType] <= 0) {
            showMessage(`No ${itemData.name} to deliver!`);
            AudioManager.playError();
            return;
        }
        inventory[cropType]--;
        money += itemData.price;
        food += itemData.food;
        AudioManager.playDeliver();
        showMessage(`Delivered ${itemData.name}! +$${itemData.price} +${itemData.food} food`);
    }

    function processItem(sourceType, resultType) {
        const pItem = PROCESSED_ITEMS[resultType];
        if (!pItem) return;
        if (!inventory[sourceType] || inventory[sourceType] <= 0) {
            showMessage(`No ${CROPS[sourceType]?.name || sourceType} to process!`);
            AudioManager.playError();
            return;
        }
        if (!equipment[pItem.equipmentName]) {
            showMessage(`You need a ${pItem.equipmentName}! Buy it from the shop.`);
            AudioManager.playError();
            return;
        }
        inventory[sourceType]--;
        processingQueue.push({ type: resultType, daysLeft: 2 });
        AudioManager.playSelect();
        showMessage(`Processing ${pItem.name}...`);
    }

    function buyEquipment(name, cost) {
        if (equipment[name]) {
            showMessage(`Already own ${name}!`);
            return;
        }
        if (money < cost) {
            showMessage('Not enough money!');
            AudioManager.playError();
            return;
        }
        money -= cost;
        equipment[name] = true;
        AudioManager.playSelect();
        showMessage(`Bought ${name}!`);
    }

    function showMessage(msg) {
        message = msg;
        messageTimer = 3;
    }

    // ---- RENDER ----
    function render(ctx) {
        const W = 960, H = 640;

        // ---- Background ----
        // Sky
        for (let y = 0; y < 100; y++) {
            const t = y / 100;
            ctx.fillStyle = `rgb(${Math.floor(100 + t * 35)},${Math.floor(180 + t * 25)},${Math.floor(220 - t * 10)})`;
            ctx.fillRect(0, y, W, 1);
        }
        // Ground
        ctx.fillStyle = '#4a8c38';
        ctx.fillRect(0, 100, W, H - 100);

        // Draw some grass detail
        for (let x = 0; x < W; x += 20) {
            ctx.fillStyle = x % 40 === 0 ? '#3d7a2d' : '#52943e';
            ctx.fillRect(x, 100, 10, 4);
        }

        // ---- FARM PLOTS ----
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const idx = row * GRID_COLS + col;
                const px = FARM_X + col * (PLOT_SIZE + PLOT_PAD);
                const py = FARM_Y + row * (PLOT_SIZE + PLOT_PAD);
                const plot = plots[idx];

                // Plot background (dirt)
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(px, py, PLOT_SIZE, PLOT_SIZE);
                ctx.fillStyle = '#a07828';
                ctx.fillRect(px + 2, py + 2, PLOT_SIZE - 4, PLOT_SIZE - 4);

                // Hover highlight
                if (hoverPlot === idx) {
                    ctx.fillStyle = 'rgba(255,255,255,0.15)';
                    ctx.fillRect(px, py, PLOT_SIZE, PLOT_SIZE);
                }

                // Draw crop sprite
                if (plot.crop) {
                    const sprite = Assets.generateCropSprite(plot.crop, plot.stage, 2);
                    const sx = px + PLOT_SIZE / 2 - sprite.width / 2;
                    const sy = py + PLOT_SIZE / 2 - sprite.height / 2;
                    ctx.drawImage(sprite, sx, sy);

                    // Stage label
                    ctx.save();
                    ctx.font = '7px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(CROPS[plot.crop].name, px + PLOT_SIZE / 2, py + PLOT_SIZE - 5);

                    // Growth bar
                    const cropData = CROPS[plot.crop];
                    if (plot.stage !== 'ready' && plot.stage !== 'empty') {
                        const progress = Math.min(1, plot.growthDay / cropData.growDays);
                        ctx.fillStyle = '#333';
                        ctx.fillRect(px + 4, py + 4, PLOT_SIZE - 8, 6);
                        ctx.fillStyle = progress >= 1 ? '#5dba3c' : '#f5c542';
                        ctx.fillRect(px + 4, py + 4, (PLOT_SIZE - 8) * progress, 6);
                    }

                    // Ready indicator
                    if (plot.stage === 'ready') {
                        ctx.font = '9px "Press Start 2P", monospace';
                        ctx.fillStyle = '#5dba3c';
                        ctx.fillText('READY!', px + PLOT_SIZE / 2, py + 14);
                    }
                    ctx.restore();
                } else {
                    // Empty plot indicator
                    ctx.save();
                    ctx.font = '20px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillText('+', px + PLOT_SIZE / 2, py + PLOT_SIZE / 2 + 8);
                    ctx.restore();
                }

                // Border
                ctx.strokeStyle = hoverPlot === idx ? '#7dda5c' : '#5a4a10';
                ctx.lineWidth = 2;
                ctx.strokeRect(px, py, PLOT_SIZE, PLOT_SIZE);
            }
        }

        // ---- RIGHT SIDE PANELS ----
        const panelX = 570;

        // TRUCK
        const truckSprite = Assets.generateTruck(3);
        ctx.drawImage(truckSprite, panelX + 10, 120);
        ctx.save();
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('DELIVERY TRUCK', panelX + 100, 115);
        ctx.restore();

        // Delivery buttons
        let deliverY = 180;
        const allDeliverables = [...unlockedCrops];
        Object.keys(PROCESSED_ITEMS).forEach(k => {
            if (inventory[k] > 0) allDeliverables.push(k);
        });

        ctx.save();
        ctx.font = '8px "Press Start 2P", monospace';
        allDeliverables.forEach(crop => {
            const count = inventory[crop] || 0;
            const isProcessed = !!PROCESSED_ITEMS[crop];
            const itemData = isProcessed ? PROCESSED_ITEMS[crop] : CROPS[crop];
            if (!itemData) return;

            const btnHover = (hoverBtn === `deliver_${crop}`);
            ctx.fillStyle = btnHover ? '#4a9a2a' : '#2a5a1a';
            ctx.fillRect(panelX, deliverY, 180, 28);
            ctx.strokeStyle = '#5dba3c';
            ctx.lineWidth = 1;
            ctx.strokeRect(panelX, deliverY, 180, 28);
            ctx.textAlign = 'left';
            ctx.fillStyle = count > 0 ? '#fff' : '#666';
            ctx.fillText(`${itemData.name}(${count})`, panelX + 8, deliverY + 18);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#f5c542';
            ctx.fillText(`SEND`, panelX + 172, deliverY + 18);
            deliverY += 32;
        });
        ctx.restore();

        // PROCESSING panel
        const procItems = getAvailableProcessed();
        if (procItems.length > 0) {
            let procY = deliverY + 20;
            ctx.save();
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.fillStyle = '#f5c542';
            ctx.textAlign = 'center';
            ctx.fillText('PROCESSING', panelX + 90, procY);
            procY += 15;

            ctx.font = '7px "Press Start 2P", monospace';
            procItems.forEach(({ key, item }) => {
                const btnHover = (hoverBtn === `process_${key}`);
                ctx.fillStyle = btnHover ? '#5a3a1a' : '#3a2a0a';
                ctx.fillRect(panelX, procY, 180, 26);
                ctx.strokeStyle = '#c8a838';
                ctx.lineWidth = 1;
                ctx.strokeRect(panelX, procY, 180, 26);
                ctx.textAlign = 'left';
                ctx.fillStyle = '#fff';
                ctx.fillText(`${item.name}`, panelX + 6, procY + 16);
                ctx.textAlign = 'right';
                ctx.fillStyle = equipment[item.equipmentName] ? '#5dba3c' : '#e74c3c';
                ctx.fillText('MAKE', panelX + 172, procY + 16);
                procY += 30;
            });
            ctx.restore();
        }

        // ---- TOOLBAR ----
        renderToolbar(ctx, W, H);

        // ---- HUD ----
        renderHUD(ctx, W, H);

        // ---- SHOP OVERLAY ----
        if (shopOpen) {
            renderShop(ctx, W, H);
        }

        // ---- MESSAGE ----
        if (messageTimer > 0 && message) {
            ctx.save();
            const msgAlpha = Math.min(1, messageTimer);
            ctx.globalAlpha = msgAlpha;

            // Speech bubble style
            const msgW = Math.min(message.length * 10 + 40, 600);
            const msgX = W / 2 - msgW / 2;
            const msgY = H / 2 - 60;

            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(msgX, msgY, msgW, 44);
            ctx.strokeStyle = '#5dba3c';
            ctx.lineWidth = 2;
            ctx.strokeRect(msgX, msgY, msgW, 44);

            ctx.textAlign = 'center';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText(message, W / 2, msgY + 27);
            ctx.restore();
        }
    }

    function renderToolbar(ctx, W, H) {
        const toolY = H - 70;
        const toolH = 60;

        // Toolbar bg
        ctx.fillStyle = 'rgba(20,15,10,0.9)';
        ctx.fillRect(0, toolY, 560, toolH);
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, toolY, 560, toolH);

        const tools = getToolbarItems();
        const btnSize = 52;
        let tx = 10;

        ctx.save();
        ctx.font = '7px "Press Start 2P", monospace';
        tools.forEach(tool => {
            const isSelected = (selectedTool === tool.id);
            const isHover = (hoverBtn === `tool_${tool.id}`);

            ctx.fillStyle = isSelected ? '#4a9a2a' : (isHover ? '#3a6a2a' : '#2a3a1a');
            ctx.fillRect(tx, toolY + 4, btnSize, btnSize);
            ctx.strokeStyle = isSelected ? '#7dda5c' : '#5dba3c';
            ctx.lineWidth = isSelected ? 3 : 1;
            ctx.strokeRect(tx, toolY + 4, btnSize, btnSize);

            // Tool icon (colored square)
            ctx.fillStyle = tool.color;
            ctx.fillRect(tx + 12, toolY + 10, 28, 20);

            // Label
            ctx.textAlign = 'center';
            ctx.fillStyle = isSelected ? '#fff' : '#aaa';
            ctx.fillText(tool.label, tx + btnSize / 2, toolY + 50);

            tx += btnSize + 6;
        });

        // Shop button
        const shopBtnX = tx + 10;
        const shopHover = (hoverBtn === 'shop');
        ctx.fillStyle = shopHover ? '#c8a838' : '#8B6914';
        ctx.fillRect(shopBtnX, toolY + 4, 70, btnSize);
        ctx.strokeStyle = '#f5c542';
        ctx.lineWidth = 2;
        ctx.strokeRect(shopBtnX, toolY + 4, 70, btnSize);
        ctx.textAlign = 'center';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('SHOP', shopBtnX + 35, toolY + 35);

        ctx.restore();
    }

    function renderHUD(ctx, W, H) {
        // Top HUD bar
        ctx.fillStyle = 'rgba(10,10,20,0.85)';
        ctx.fillRect(0, 0, W, 50);
        ctx.strokeStyle = '#5dba3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, W, 50);

        ctx.save();
        ctx.font = '10px "Press Start 2P", monospace';

        // Money
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f5c542';
        ctx.fillText(`$${money.toFixed(1)}`, 15, 22);

        // XP
        ctx.fillStyle = '#7dda5c';
        ctx.fillText(`XP:${xp}`, 130, 22);

        // Food / Goal
        ctx.fillStyle = food >= foodGoal ? '#5dba3c' : '#e8a040';
        ctx.fillText(`Food:${food}/${foodGoal}`, 250, 22);

        // Day / Month
        ctx.fillStyle = '#87CEEB';
        ctx.fillText(`Day ${currentDay}/30`, 480, 22);
        ctx.fillStyle = '#fff';
        ctx.fillText(`Month ${currentMonth}`, 640, 22);

        // Day progress bar
        const dayProgress = dayTimer / daySpeed;
        ctx.fillStyle = '#333';
        ctx.fillRect(15, 34, 200, 8);
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(15, 34, 200 * dayProgress, 8);

        // Goal status
        ctx.textAlign = 'right';
        if (food >= foodGoal) {
            ctx.fillStyle = '#5dba3c';
            ctx.fillText('GOAL MET!', W - 15, 22);
        } else {
            ctx.fillStyle = '#888';
            ctx.fillText(`Need ${foodGoal - food} more`, W - 15, 22);
        }

        // Speed control
        ctx.textAlign = 'right';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = hoverBtn === 'speed' ? '#f5c542' : '#888';
        ctx.fillText(`Speed: ${daySpeed}s/day [click]`, W - 15, 44);

        ctx.restore();
    }

    function renderShop(ctx, W, H) {
        // Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);

        const shopW = 600, shopH = 440;
        const sx = W / 2 - shopW / 2, sy = H / 2 - shopH / 2;

        // Shop bg
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(sx, sy, shopW, shopH);
        ctx.strokeStyle = '#c8a838';
        ctx.lineWidth = 3;
        ctx.strokeRect(sx, sy, shopW, shopH);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = '#f5c542';
        ctx.fillText('SHOP', W / 2, sy + 35);

        // Tabs
        const tabs = ['seeds', 'equipment'];
        tabs.forEach((tab, i) => {
            const tabX = sx + 20 + i * 150;
            const isActive = selectedShopTab === tab;
            ctx.fillStyle = isActive ? '#5a3a1a' : '#3a2a0a';
            ctx.fillRect(tabX, sy + 50, 130, 30);
            ctx.strokeStyle = '#c8a838';
            ctx.strokeRect(tabX, sy + 50, 130, 30);
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillStyle = isActive ? '#f5c542' : '#888';
            ctx.textAlign = 'center';
            ctx.fillText(tab.toUpperCase(), tabX + 65, sy + 70);
        });

        // Content
        let itemY = sy + 100;
        ctx.font = '9px "Press Start 2P", monospace';

        if (selectedShopTab === 'seeds') {
            unlockedCrops.forEach(cropKey => {
                const crop = CROPS[cropKey];
                if (!crop) return;
                const btnHover = hoverBtn === `buy_${cropKey}`;

                ctx.fillStyle = btnHover ? '#4a3a1a' : '#3a2a1a';
                ctx.fillRect(sx + 20, itemY, shopW - 40, 40);
                ctx.strokeStyle = '#8B6914';
                ctx.strokeRect(sx + 20, itemY, shopW - 40, 40);

                ctx.textAlign = 'left';
                ctx.fillStyle = crop.color;
                ctx.fillRect(sx + 30, itemY + 8, 24, 24);
                ctx.fillStyle = '#fff';
                ctx.fillText(crop.name, sx + 65, itemY + 18);
                ctx.fillStyle = '#aaa';
                ctx.fillText(`${crop.growDays}d | ${crop.food}food | ${crop.xp}xp`, sx + 65, itemY + 32);

                ctx.textAlign = 'right';
                ctx.fillStyle = '#f5c542';
                ctx.fillText(`$${crop.seedCost}`, sx + shopW - 30, itemY + 25);

                itemY += 48;
            });
        } else if (selectedShopTab === 'equipment') {
            Object.entries(PROCESSED_ITEMS).forEach(([key, item]) => {
                const owned = equipment[item.equipmentName];
                const btnHover = hoverBtn === `buyequip_${key}`;

                ctx.fillStyle = btnHover ? '#4a3a1a' : '#3a2a1a';
                ctx.fillRect(sx + 20, itemY, shopW - 40, 40);
                ctx.strokeStyle = '#8B6914';
                ctx.strokeRect(sx + 20, itemY, shopW - 40, 40);

                ctx.textAlign = 'left';
                ctx.fillStyle = '#fff';
                ctx.fillText(item.equipmentName, sx + 30, itemY + 18);
                ctx.fillStyle = '#aaa';
                ctx.fillText(`For ${item.name}`, sx + 30, itemY + 32);

                ctx.textAlign = 'right';
                ctx.fillStyle = owned ? '#5dba3c' : '#f5c542';
                ctx.fillText(owned ? 'OWNED' : `$${item.equipmentCost}`, sx + shopW - 30, itemY + 25);

                itemY += 48;
            });
        }

        // Close button
        const closeBtnX = sx + shopW - 40, closeBtnY = sy + 5;
        ctx.fillStyle = hoverBtn === 'closeShop' ? '#c0392b' : '#8e2a1e';
        ctx.fillRect(closeBtnX, closeBtnY, 30, 30);
        ctx.textAlign = 'center';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('X', closeBtnX + 15, closeBtnY + 22);

        ctx.restore();
    }

    // ---- HELPERS ----
    function getToolbarItems() {
        const tools = [{ id: 'water', label: 'WATER', color: '#5599dd' }];
        unlockedCrops.forEach(c => {
            const crop = CROPS[c];
            if (crop) {
                tools.push({ id: `plant_${c}`, label: crop.name.substring(0, 6).toUpperCase(), color: crop.color });
            }
        });
        tools.push({ id: 'harvest', label: 'HARVEST', color: '#e8a040' });
        return tools;
    }

    function getAvailableProcessed() {
        const result = [];
        // Check if we can process anything
        if (unlockedCrops.includes('corn') && (inventory.corn > 0 || equipment['Corn Popper'])) {
            result.push({ key: 'popcorn', item: PROCESSED_ITEMS.popcorn });
        }
        if (unlockedCrops.includes('wheat')) {
            if (inventory.wheat > 0 || equipment['Mill']) {
                result.push({ key: 'flour', item: PROCESSED_ITEMS.flour });
            }
            if ((inventory.flour > 0 || equipment['Oven']) && equipment['Mill']) {
                result.push({ key: 'bread', item: PROCESSED_ITEMS.bread });
            }
        }
        return result;
    }

    function getPlotAt(x, y) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const px = FARM_X + col * (PLOT_SIZE + PLOT_PAD);
                const py = FARM_Y + row * (PLOT_SIZE + PLOT_PAD);
                if (x >= px && x <= px + PLOT_SIZE && y >= py && y <= py + PLOT_SIZE) {
                    return row * GRID_COLS + col;
                }
            }
        }
        return -1;
    }

    // ---- INPUT ----
    function onMouseMove(x, y) {
        hoverPlot = getPlotAt(x, y);
        hoverBtn = '';

        const W = 960, H = 640;
        const toolY = H - 70;
        const tools = getToolbarItems();
        const btnSize = 52;
        let tx = 10;

        tools.forEach(tool => {
            if (x >= tx && x <= tx + btnSize && y >= toolY + 4 && y <= toolY + 4 + btnSize) {
                hoverBtn = `tool_${tool.id}`;
            }
            tx += btnSize + 6;
        });

        // Shop button
        const shopBtnX = tx + 10;
        if (x >= shopBtnX && x <= shopBtnX + 70 && y >= toolY + 4 && y <= toolY + 4 + btnSize) {
            hoverBtn = 'shop';
        }

        // Speed control
        if (x >= W - 200 && x <= W - 15 && y >= 35 && y <= 50) {
            hoverBtn = 'speed';
        }

        // Delivery buttons
        const panelX = 570;
        let deliverY = 180;
        const allDeliverables = [...unlockedCrops];
        Object.keys(PROCESSED_ITEMS).forEach(k => {
            if (inventory[k] > 0) allDeliverables.push(k);
        });
        allDeliverables.forEach(crop => {
            if (x >= panelX && x <= panelX + 180 && y >= deliverY && y <= deliverY + 28) {
                hoverBtn = `deliver_${crop}`;
            }
            deliverY += 32;
        });

        // Processing buttons
        const procItems = getAvailableProcessed();
        if (procItems.length > 0) {
            let procY = deliverY + 35;
            procItems.forEach(({ key }) => {
                if (x >= panelX && x <= panelX + 180 && y >= procY && y <= procY + 26) {
                    hoverBtn = `process_${key}`;
                }
                procY += 30;
            });
        }

        // Shop overlay
        if (shopOpen) {
            const shopW = 600, shopH = 440;
            const sx = W / 2 - shopW / 2, sy = H / 2 - shopH / 2;
            hoverBtn = '';

            // Close
            if (x >= sx + shopW - 40 && x <= sx + shopW - 10 && y >= sy + 5 && y <= sy + 35) {
                hoverBtn = 'closeShop';
            }
            // Tabs
            const tabs = ['seeds', 'equipment'];
            tabs.forEach((tab, i) => {
                const tabX = sx + 20 + i * 150;
                if (x >= tabX && x <= tabX + 130 && y >= sy + 50 && y <= sy + 80) {
                    hoverBtn = `tab_${tab}`;
                }
            });
            // Items
            let itemY = sy + 100;
            if (selectedShopTab === 'seeds') {
                unlockedCrops.forEach(cropKey => {
                    if (x >= sx + 20 && x <= sx + shopW - 20 && y >= itemY && y <= itemY + 40) {
                        hoverBtn = `buy_${cropKey}`;
                    }
                    itemY += 48;
                });
            } else {
                Object.keys(PROCESSED_ITEMS).forEach(key => {
                    if (x >= sx + 20 && x <= sx + shopW - 20 && y >= itemY && y <= itemY + 40) {
                        hoverBtn = `buyequip_${key}`;
                    }
                    itemY += 48;
                });
            }
        }
    }

    function onClick(x, y) {
        const W = 960, H = 640;

        if (shopOpen) {
            handleShopClick(x, y, W, H);
            return;
        }

        // Speed control
        if (hoverBtn === 'speed') {
            daySpeed = daySpeed === 4 ? 2 : daySpeed === 2 ? 1 : 4;
            showMessage(`Day speed: ${daySpeed}s`);
            AudioManager.playClick();
            return;
        }

        // Tool selection
        if (hoverBtn.startsWith('tool_')) {
            selectedTool = hoverBtn.replace('tool_', '');
            AudioManager.playClick();
            return;
        }

        // Shop button
        if (hoverBtn === 'shop') {
            shopOpen = true;
            AudioManager.playClick();
            return;
        }

        // Delivery
        if (hoverBtn.startsWith('deliver_')) {
            const crop = hoverBtn.replace('deliver_', '');
            deliverToTruck(crop);
            return;
        }

        // Processing
        if (hoverBtn.startsWith('process_')) {
            const resultType = hoverBtn.replace('process_', '');
            const pItem = PROCESSED_ITEMS[resultType];
            if (pItem) {
                if (resultType === 'bread' && inventory.flour > 0) {
                    processItem('flour', 'bread');
                } else {
                    processItem(pItem.source, resultType);
                }
            }
            return;
        }

        // Plot interaction
        const plotIdx = getPlotAt(x, y);
        if (plotIdx >= 0 && selectedTool) {
            if (selectedTool === 'water') {
                waterPlot(plotIdx);
            } else if (selectedTool === 'harvest') {
                harvestPlot(plotIdx);
            } else if (selectedTool.startsWith('plant_')) {
                const cropType = selectedTool.replace('plant_', '');
                plantCrop(plotIdx, cropType);
            }
        } else if (plotIdx >= 0) {
            showMessage('Select a tool from the toolbar first!');
        }
    }

    function handleShopClick(x, y, W, H) {
        const shopW = 600, shopH = 440;
        const sx = W / 2 - shopW / 2, sy = H / 2 - shopH / 2;

        // Close
        if (hoverBtn === 'closeShop') {
            shopOpen = false;
            AudioManager.playClick();
            return;
        }

        // Click outside shop
        if (x < sx || x > sx + shopW || y < sy || y > sy + shopH) {
            shopOpen = false;
            return;
        }

        // Tabs
        if (hoverBtn === 'tab_seeds') { selectedShopTab = 'seeds'; AudioManager.playClick(); return; }
        if (hoverBtn === 'tab_equipment') { selectedShopTab = 'equipment'; AudioManager.playClick(); return; }

        // Buy seeds (select tool)
        if (hoverBtn.startsWith('buy_')) {
            const cropKey = hoverBtn.replace('buy_', '');
            selectedTool = `plant_${cropKey}`;
            shopOpen = false;
            AudioManager.playSelect();
            showMessage(`Selected ${CROPS[cropKey]?.name} seeds! Click a plot to plant.`);
            return;
        }

        // Buy equipment
        if (hoverBtn.startsWith('buyequip_')) {
            const key = hoverBtn.replace('buyequip_', '');
            const item = PROCESSED_ITEMS[key];
            if (item && !equipment[item.equipmentName]) {
                buyEquipment(item.equipmentName, item.equipmentCost);
            }
            return;
        }
    }

    function onMouseUp() { }

    return { init, update, render, onMouseMove, onClick, onMouseUp };
})();
