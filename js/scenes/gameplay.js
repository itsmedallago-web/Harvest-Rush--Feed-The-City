// ===== GAMEPLAY SCENE =====
// Main farm gameplay with player movement, crop management, and truck delivery

const Gameplay = {
    player: null,
    inventory: [],
    maxInventory: 8,
    selectedSlot: 0,
    currentCrops: ['lettuce'], // Active crops for current month
    time: 0,
    paused: false,
    keys: {},
    tooltip: null,
    processingStation: null,
    activeAction: null, // current action being performed
    actionTimer: 0,
    actionDuration: 0,
    month: 1,
    day: 1,
    daysInMonth: 15, // game days per month
    dayTimer: 0,
    dayDuration: 20, // seconds per game day
    dayPassed: false,
    notification: null,
    notificationTimer: 0,
    onMonthEnd: null,

    init(canvas, month, crops, onMonthEnd) {
        this.month = month;
        this.currentCrops = crops || ['lettuce'];
        this.onMonthEnd = onMonthEnd;
        this.day = 1;
        this.dayTimer = 0;
        this.dayPassed = false;
        this.time = 0;
        this.inventory = [];
        this.selectedSlot = 0;
        this.keys = {};
        this.tooltip = null;
        this.activeAction = null;
        this.notification = null;
        this.notificationTimer = 0;

        // Player
        this.player = {
            x: canvas.width / 2 - 12,
            y: canvas.height / 2 + 60,
            width: 24,
            height: 44,
            speed: 120,
            direction: 'down',
            frame: 0,
            frameTimer: 0,
            moving: false,
        };

        // Initialize farm
        Farm.init(canvas.width, canvas.height);

        // Initialize truck
        Truck.init(canvas.width, canvas.height);

        // Processing station area (appears when equipment is owned)
        this.processingStation = {
            x: 20,
            y: canvas.height / 2 - 30,
            width: 40,
            height: 40,
        };
    },

    update(deltaTime, canvas) {
        if (this.paused) return;

        this.time += deltaTime;

        // Day timer
        this.dayPassed = false;
        this.dayTimer += deltaTime;
        if (this.dayTimer >= this.dayDuration) {
            this.dayTimer = 0;
            this.day++;
            this.dayPassed = true;
            Audio.playNewDay();
            this.showNotification(`Day ${this.day}`);

            if (this.day > this.daysInMonth) {
                // Month is over
                if (this.onMonthEnd) this.onMonthEnd();
                return;
            }
        }

        // Player movement
        this.updatePlayer(deltaTime, canvas);

        // Update crops
        Farm.updateCrops(deltaTime, this.dayPassed);

        // Update truck
        const deliveryDone = Truck.update(deltaTime);
        if (deliveryDone) {
            this.showNotification('Delivery complete!');
        }

        // Notification timer
        if (this.notification) {
            this.notificationTimer -= deltaTime;
            if (this.notificationTimer <= 0) {
                this.notification = null;
            }
        }

        // Action timer
        if (this.activeAction) {
            this.actionTimer += deltaTime;
            if (this.actionTimer >= this.actionDuration) {
                this.completeAction();
            }
        }

        // Update tooltip based on player position
        this.updateTooltip();
    },

    updatePlayer(deltaTime, canvas) {
        let dx = 0, dy = 0;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dx -= 1;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dx += 1;
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) dy -= 1;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) dy += 1;

        this.player.moving = dx !== 0 || dy !== 0;

        if (this.player.moving) {
            // Normalize diagonal
            if (dx !== 0 && dy !== 0) {
                dx *= 0.707;
                dy *= 0.707;
            }

            this.player.x += dx * this.player.speed * deltaTime;
            this.player.y += dy * this.player.speed * deltaTime;

            // Clamp to canvas
            this.player.x = Math.max(0, Math.min(canvas.width - this.player.width, this.player.x));
            this.player.y = Math.max(40, Math.min(canvas.height - this.player.height, this.player.y));

            // Direction
            if (Math.abs(dx) > Math.abs(dy)) {
                this.player.direction = dx > 0 ? 'right' : 'left';
            } else {
                this.player.direction = dy > 0 ? 'down' : 'up';
            }

            // Animation frame
            this.player.frameTimer += deltaTime;
            if (this.player.frameTimer > 0.15) {
                this.player.frameTimer = 0;
                this.player.frame++;
            }
        } else {
            this.player.direction = 'idle';
            this.player.frame = 0;
        }
    },

    updateTooltip() {
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;

        const nearPlot = Farm.getNearestPlot(px, py, 50);
        if (nearPlot) {
            if (!nearPlot.tilled) {
                this.tooltip = { text: '[E] Till soil', x: nearPlot.x, y: nearPlot.y - 16 };
            } else if (!nearPlot.crop) {
                this.tooltip = { text: '[E] Plant', x: nearPlot.x, y: nearPlot.y - 16 };
            } else if (nearPlot.crop.isReady) {
                this.tooltip = { text: '[E] Harvest', x: nearPlot.x, y: nearPlot.y - 16 };
            } else if (nearPlot.crop.needsWater) {
                this.tooltip = { text: '[E] Water', x: nearPlot.x, y: nearPlot.y - 16 };
            } else {
                this.tooltip = { text: 'Growing...', x: nearPlot.x, y: nearPlot.y - 16 };
            }
            return;
        }

        if (Truck.isNear(px, py)) {
            this.tooltip = { text: '[E] Interaction', x: Truck.x, y: Truck.y - 24 };
            return;
        }

        this.tooltip = null;
    },

    interact() {
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;

        const nearPlot = Farm.getNearestPlot(px, py, 50);
        if (nearPlot) {
            this.interactWithPlot(nearPlot);
            return;
        }

        if (Truck.isNear(px, py)) {
            this.interactWithTruck();
            return;
        }
    },

    interactWithPlot(plot) {
        if (!plot.tilled) {
            Farm.tillPlot(plot);
            Audio.playPlant();
        } else if (!plot.crop) {
            const cropType = this.currentCrops[0];
            Farm.plantCrop(plot, cropType);
            Audio.playPlant();
        } else if (plot.crop.isReady) {
            const result = Farm.harvestPlot(plot);
            if (result) {
                this.inventory.push(result);
                Audio.playHarvest();
            }
        } else if (plot.crop.needsWater) {
            Farm.waterPlot(plot);
            Audio.playWater();
        }
    },

    interactWithTruck() {
        if (this.inventory.length > 0) {
            const item = this.inventory.shift();
            Truck.addItem(item);
        }
    },

    sendTruck() {
        const result = Truck.sendDelivery();
        if (result) {
            Economy.addMoney(result.money);
            Audio.playTruck();
        }
    },

    showNotification(text) {
        this.notification = text;
        this.notificationTimer = 2;
    },

    draw(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = '#2d5a27'; ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 48) {
            for (let x = 0; x < w; x += 48) { Sprites.drawGrassTile(ctx, x, y, Math.floor(x/48)); }
        }
        Farm.draw(ctx);
        Truck.draw(ctx, this.time);
        Sprites.drawHolly(ctx, this.player.x, this.player.y, this.player.frame, this.player.direction);

        if (this.tooltip) UI.drawTooltip(ctx, this.tooltip.text, this.tooltip.x, this.tooltip.y);
        UI.drawHUD(ctx, {
            month: this.month, day: this.day, daysInMonth: this.daysInMonth,
            dayTimer: this.dayTimer, dayDuration: this.dayDuration,
            money: Economy.state.money, xp: Economy.state.xp, food: Economy.state.food
        }, w);

        this.drawInventory(ctx, w, h);
    },

    drawInventory(ctx, w, h) {
        const slotSize = 36;
        const gap = 4;
        const startX = w / 2 - (this.maxInventory * (slotSize + gap)) / 2;
        const startY = h - 30;

        for (let i = 0; i < this.maxInventory; i++) {
            const item = this.inventory[i];
            UI.drawInventorySlot(ctx, startX + i * (slotSize + gap), startY, slotSize, item ? item.type : null, 1, i === this.selectedSlot);
        }
    },

    onKeyDown(key) {
        this.keys[key] = true;
        if (key === 'e' || key === 'E' || key === ' ') this.interact();
        if (key === 't' || key === 'T') this.sendTruck();
    },

    onKeyUp(key) { this.keys[key] = false; },
};
