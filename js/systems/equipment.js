// ===== EQUIPMENT SYSTEM =====
// Shop items and equipment management

const EquipmentData = {
    mill: {
        name: 'Mill',
        icon: '⚙️',
        price: 20,
        description: 'Grinds wheat into flour.',
        drawFn: 'drawMill',
    },
    popcornMaker: {
        name: 'Popcorn Maker',
        icon: '🍿',
        price: 15,
        description: 'Pops corn into popcorn!',
        drawFn: 'drawPopcornMaker',
    },
    oven: {
        name: 'Oven',
        icon: '🔥',
        price: 25,
        description: 'Bakes flour into bread.',
        drawFn: 'drawOven',
    },
};

const Equipment = {
    owned: [],

    init() {
        this.owned = [];
    },

    buy(itemId) {
        const data = EquipmentData[itemId];
        if (!data) return false;
        if (this.owned.includes(itemId)) return false;
        if (!Economy.canAfford(data.price)) return false;

        Economy.spendMoney(data.price);
        this.owned.push(itemId);
        return true;
    },

    has(itemId) {
        return this.owned.includes(itemId);
    },

    getAvailable() {
        return Object.entries(EquipmentData)
            .filter(([id]) => !this.owned.includes(id))
            .map(([id, data]) => ({ id, ...data }));
    },

    getOwned() {
        return this.owned.map(id => ({ id, ...EquipmentData[id] }));
    },
};
