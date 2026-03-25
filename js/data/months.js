// ============================================================
// months.js — Month progression config
// ============================================================
const MONTH_CONFIG = [
    {
        month: 1,
        name: 'Month 1',
        days: 30,
        foodGoal: 30,
        availableCrops: ['lettuce'],
        cropChoices: 0,
        chooseFrom: [],
        intro: 'Welcome to Greenfield Farm! Start by growing Lettuce to feed the city.'
    },
    {
        month: 2,
        name: 'Month 2',
        days: 30,
        foodGoal: 80,
        availableCrops: [],
        cropChoices: 1,
        chooseFrom: ['corn', 'rice', 'wheat'],
        intro: 'The city needs more food! Choose a new crop to grow.'
    },
    {
        month: 3,
        name: 'Month 3',
        days: 30,
        foodGoal: 150,
        availableCrops: [],
        cropChoices: 1,
        chooseFrom: [],  // will be dynamically filled with remaining crops + processed items
        intro: 'Final month! The city is counting on you, Holly!'
    }
];
