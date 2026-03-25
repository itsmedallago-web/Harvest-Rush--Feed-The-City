// ===== TRUCK SYSTEM =====
// Delivery truck mechanics

const Truck = {
    x: 0,
    y: 0,
    visible: true,
    loaded: false,
    items: [],
    maxItems: 5,
    delivering: false,
    deliveryTimer: 0,
    deliveryDuration: 2, // seconds

    init(canvasWidth, canvasHeight) {
        this.x = canvasWidth - 110;
        this.y = canvasHeight - 70;
        this.items = [];
        this.loaded = false;
        this.delivering = false;
        this.deliveryTimer = 0;
        this.visible = true;
    },

    addItem(item) {
        if (this.items.length >= this.maxItems || this.delivering) return false;
        this.items.push(item);
        this.loaded = this.items.length > 0;
        return true;
    },

    canAddItem() {
        return this.items.length < this.maxItems && !this.delivering;
    },

    sendDelivery() {
        if (this.items.length === 0 || this.delivering) return null;

        this.delivering = true;
        this.deliveryTimer = 0;

        // Calculate totals
        let totalMoney = 0, totalXP = 0, totalFood = 0;
        for (const item of this.items) {
            totalMoney += item.money;
            totalXP += item.xp;
            totalFood += item.food;
        }

        return { money: totalMoney, xp: totalXP, food: totalFood, itemCount: this.items.length };
    },

    update(deltaTime) {
        if (this.delivering) {
            this.deliveryTimer += deltaTime;
            if (this.deliveryTimer >= this.deliveryDuration) {
                this.delivering = false;
                this.items = [];
                this.loaded = false;
                return true; // delivery complete
            }
        }
        return false;
    },

    draw(ctx, time) {
        if (!this.visible) return;

        const drawX = this.delivering ?
            this.x + (this.deliveryTimer / this.deliveryDuration) * 200 :
            this.x;

        // Truck animation (subtle bounce)
        const bounceY = this.delivering ? Math.sin(time * 10) * 2 : 0;

        Sprites.drawTruck(ctx, drawX, this.y + bounceY, this.loaded);

        // Item count
        if (this.items.length > 0 && !this.delivering) {
            UI.drawText(ctx, `${this.items.length}/${this.maxItems}`, drawX + 55, this.y - 8, {
                font: '9px "Press Start 2P"',
                color: '#fbbf24',
                align: 'center'
            });
        }

        // "Send" indicator
        if (this.items.length > 0 && !this.delivering) {
            const pulse = Math.sin(time * 4) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(74, 222, 128, ${pulse})`;
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('Press T to send!', drawX + 45, this.y - 18);
        }

        // Delivering text
        if (this.delivering) {
            UI.drawText(ctx, 'Delivering...', this.x + 30, this.y - 10, {
                font: '10px "Press Start 2P"',
                color: '#fbbf24',
                align: 'center'
            });
        }
    },

    // Check if a point is near the truck (for interaction)
    isNear(worldX, worldY, range = 80) {
        const cx = this.x + 45;
        const cy = this.y + 20;
        return Math.sqrt((worldX - cx) ** 2 + (worldY - cy) ** 2) < range;
    },
};
