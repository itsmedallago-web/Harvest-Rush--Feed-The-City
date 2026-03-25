// ===== ECONOMY SYSTEM =====
// Money, XP, Food tracking and management

const Economy = {
    state: {
        money: 5,
        xp: 0,
        food: 0,
        totalFoodDelivered: 0,
        monthlyEarnings: 0,
        monthlyXP: 0,
        monthlyFood: 0,
    },

    init() {
        this.state = {
            money: 5,
            xp: 0,
            food: 0,
            totalFoodDelivered: 0,
            monthlyEarnings: 0,
            monthlyXP: 0,
            monthlyFood: 0,
        };
    },

    addMoney(amount) {
        this.state.money += amount;
        this.state.monthlyEarnings += amount;
    },

    spendMoney(amount) {
        if (this.state.money >= amount) {
            this.state.money -= amount;
            return true;
        }
        return false;
    },

    addXP(amount) {
        this.state.xp += amount;
        this.state.monthlyXP += amount;
    },

    addFood(amount) {
        this.state.food += amount;
    },

    deliverFood(amount) {
        if (this.state.food >= amount) {
            this.state.food -= amount;
            this.state.totalFoodDelivered += amount;
            this.state.monthlyFood += amount;
            return true;
        }
        return false;
    },

    getMonthSummary() {
        const summary = {
            earnings: this.state.monthlyEarnings,
            xp: this.state.monthlyXP,
            food: this.state.monthlyFood,
        };
        return summary;
    },

    resetMonthly() {
        this.state.monthlyEarnings = 0;
        this.state.monthlyXP = 0;
        this.state.monthlyFood = 0;
    },

    canAfford(amount) {
        return this.state.money >= amount;
    },
};
