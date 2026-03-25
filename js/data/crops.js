// ============================================================
// crops.js — Crop & processed item data
// ============================================================
const CROPS = {
    lettuce: {
        name: 'Lettuce',
        xp: 10,
        price: 1,
        food: 2,
        growDays: 5,
        waterPerDay: 3,
        color: '#5dba4c',
        seedCost: 0.5,
        steps: ['plant', 'water', 'harvest'],
        description: 'Plant seeds, water 3x/day, harvest when ready.'
    },
    corn: {
        name: 'Corn',
        xp: 20,
        price: 3,
        food: 4,
        growDays: 9,
        waterPerDay: 1,
        color: '#f5c542',
        seedCost: 1,
        steps: ['plant', 'water', 'grow', 'harvest'],
        description: 'Plant, water 1x/day, wait for growth, harvest ears.'
    },
    rice: {
        name: 'Rice',
        xp: 15,
        price: 2,
        food: 3,
        growDays: 4,
        waterPerDay: 2,
        color: '#e8e0c8',
        seedCost: 0.8,
        steps: ['flood', 'plant', 'harvest', 'husk', 'cook'],
        description: 'Flood field, plant, harvest, husk, then cook.'
    },
    wheat: {
        name: 'Wheat',
        xp: 14,
        price: 1.5,
        food: 3,
        growDays: 8,
        waterPerDay: 2,
        color: '#d4a843',
        seedCost: 0.6,
        steps: ['plant', 'water', 'grow', 'harvest'],
        description: 'Plant, water 2x/day, long growth, harvest.'
    }
};

const PROCESSED_ITEMS = {
    popcorn: {
        name: 'Popcorn',
        xp: 30,
        price: 5,
        food: 6,
        source: 'corn',
        equipmentCost: 8,
        equipmentName: 'Corn Popper',
        color: '#fff5cc',
        description: 'Pop corn with a Corn Popper (buy from shop).'
    },
    bread: {
        name: 'Bread',
        xp: 45,
        price: 6.5,
        food: 7,
        source: 'wheat',
        requiresFlour: true,
        equipmentCost: 12,
        equipmentName: 'Oven',
        color: '#c8915a',
        description: 'Bake bread from flour using an Oven.'
    },
    flour: {
        name: 'Flour',
        xp: 28,
        price: 3.5,
        food: 5,
        source: 'wheat',
        equipmentCost: 10,
        equipmentName: 'Mill',
        color: '#f0e6d0',
        description: 'Mill wheat into flour (optional transformation).'
    }
};
