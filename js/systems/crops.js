// ===== CROP SYSTEM =====
// Crop definitions, growth, processing recipes

const CropData = {
    lettuce: {
        name: 'Lettuce',
        icon: '🥬',
        xp: 10,
        money: 1,
        food: 5,
        growthDays: 5,
        stages: 4, // seed, sprout, growing, ready
        waterNeeds: 'constant', // needs regular watering
        description: 'Easy to grow. Water regularly and harvest when ready.',
        steps: ['Plant seeds', 'Water constantly', 'Harvest when ready'],
    },
    corn: {
        name: 'Corn',
        icon: '🌽',
        xp: 20,
        money: 3,
        food: 15,
        growthDays: 10,
        stages: 4,
        waterNeeds: 'cycle', // water in cycles, not too much
        description: 'Water in cycles - don\'t overwater! Can be made into popcorn.',
        steps: ['Plant', 'Water in cycles (not too much)', 'Wait for growth', 'Harvest ears'],
        processedInto: 'popcorn',
    },
    rice: {
        name: 'Rice',
        icon: '🌾',
        xp: 15,
        money: 2,
        food: 12,
        growthDays: 4,
        stages: 4,
        waterNeeds: 'flooded', // needs flooded field
        description: 'Grow in flooded fields. Control water level with gates.',
        steps: ['Prepare flooded field', 'Plant', 'Control water level', 'Harvest', 'Process (husk)', 'Cook'],
    },
    wheat: {
        name: 'Wheat',
        icon: '🌾',
        xp: 14,
        money: 1.5,
        food: 10,
        growthDays: 8,
        stages: 4,
        waterNeeds: 'minimal',
        description: 'Long growth. Mill into flour, then bake bread.',
        steps: ['Plant', 'Wait for long growth', 'Harvest', 'Mill into flour', 'Bake into bread'],
        processedInto: 'flour',
    },
};

const ProcessedData = {
    popcorn: {
        name: 'Popcorn',
        icon: '🍿',
        xp: 30,
        money: 5,
        food: 22,
        requires: { item: 'corn', equipment: 'popcornMaker' },
        description: 'Pop corn kernels into delicious popcorn!',
    },
    flour: {
        name: 'Flour',
        icon: '🌾',
        xp: 28,
        money: 3.5,
        food: 17,
        requires: { item: 'wheat', equipment: 'mill' },
        description: 'Mill wheat into fine flour.',
        processedInto: 'bread',
    },
    bread: {
        name: 'Bread',
        icon: '🍞',
        xp: 45,
        money: 6.5,
        food: 28,
        requires: { item: 'flour', equipment: 'oven' },
        description: 'Bake flour into fresh bread!',
    },
};

const CropSystem = {
    // Create a new crop instance on a plot
    createCrop(type) {
        const data = CropData[type];
        if (!data) return null;
        return {
            type,
            stage: 0,           // 0=seed, 1=sprout, 2=growing, 3=ready
            growthTimer: 0,     // current growth progress
            growthTarget: data.growthDays, // days to fully grow
            waterLevel: 0,      // 0-5
            waterTimer: 0,      // time since last water
            overWatered: false,
            needsWater: true,
            isReady: false,
        };
    },

    // Update crop growth (called each game tick)
    updateCrop(crop, deltaTime, dayPassed) {
        if (!crop || crop.isReady) return;

        const data = CropData[crop.type];

        // Water decay
        crop.waterTimer += deltaTime;
        if (crop.waterTimer > 3) { // Every 3 seconds, water decreases
            crop.waterLevel = Math.max(0, crop.waterLevel - 1);
            crop.waterTimer = 0;
        }

        // Check water needs
        switch (data.waterNeeds) {
            case 'constant':
                crop.needsWater = crop.waterLevel < 2;
                if (crop.waterLevel >= 2 && dayPassed) {
                    crop.growthTimer++;
                }
                break;
            case 'cycle':
                crop.needsWater = crop.waterLevel === 0;
                crop.overWatered = crop.waterLevel > 3;
                if (!crop.overWatered && dayPassed) {
                    crop.growthTimer++;
                }
                break;
            case 'flooded':
                crop.needsWater = crop.waterLevel < 3;
                if (crop.waterLevel >= 3 && dayPassed) {
                    crop.growthTimer++;
                }
                break;
            case 'minimal':
                crop.needsWater = crop.waterLevel === 0;
                if (dayPassed) {
                    crop.growthTimer++;
                }
                break;
        }

        // Update stage
        const progress = crop.growthTimer / crop.growthTarget;
        if (progress >= 1) {
            crop.stage = 3;
            crop.isReady = true;
        } else if (progress >= 0.6) {
            crop.stage = 2;
        } else if (progress >= 0.2) {
            crop.stage = 1;
        }
    },

    // Water a crop
    waterCrop(crop) {
        if (!crop) return false;
        crop.waterLevel = Math.min(5, crop.waterLevel + 2);
        crop.waterTimer = 0;
        return true;
    },

    // Harvest a crop
    harvestCrop(crop) {
        if (!crop || !crop.isReady) return null;
        const data = CropData[crop.type];
        return {
            type: crop.type,
            xp: data.xp,
            money: data.money,
            food: data.food,
        };
    },

    // Process a raw item into a processed product
    processItem(itemType, equipment) {
        // Check if item can be processed
        for (const [key, data] of Object.entries(ProcessedData)) {
            if (data.requires.item === itemType && equipment.includes(data.requires.equipment)) {
                return {
                    type: key,
                    xp: data.xp,
                    money: data.money,
                    food: data.food,
                };
            }
        }
        return null;
    },

    // Check if an item can be further processed
    canProcess(itemType, equipment) {
        if (CropData[itemType] && CropData[itemType].processedInto) {
            const processed = ProcessedData[CropData[itemType].processedInto];
            return processed && equipment.includes(processed.requires.equipment);
        }
        if (ProcessedData[itemType] && ProcessedData[itemType].processedInto) {
            const processed = ProcessedData[ProcessedData[itemType].processedInto];
            return processed && equipment.includes(processed.requires.equipment);
        }
        return false;
    },
};
