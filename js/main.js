// ===== MAIN.JS =====
// Game entry point, scene manager, and game loop

const Game = {
    canvas: null,
    ctx: null,
    currentScene: 'title', // title, settings, cutscene, gameplay, cropSelect, monthEnd, demoEnd
    lastTime: 0,
    canvasWidth: 800,
    canvasHeight: 500,
    month: 1,
    selectedCrops: ['lettuce'],
    mouseX: 0,
    mouseY: 0,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        // Handle high-DPI
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Input events
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Init audio on first interaction
        this.canvas.addEventListener('click', () => Audio.init(), { once: true });
        window.addEventListener('keydown', () => Audio.init(), { once: true });

        // Init systems
        Economy.init();
        Equipment.init();

        // Start at title screen
        this.switchScene('title');

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    },

    resizeCanvas() {
        const container = document.getElementById('game-container');
        const maxW = container.clientWidth - 40;
        const maxH = container.clientHeight - 40;

        const scaleX = maxW / this.canvasWidth;
        const scaleY = maxH / this.canvasHeight;
        const scale = Math.min(scaleX, scaleY, 2); // cap at 2x

        this.canvas.style.width = `${this.canvasWidth * scale}px`;
        this.canvas.style.height = `${this.canvasHeight * scale}px`;
    },

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvasWidth / rect.width;
        const scaleY = this.canvasHeight / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    },

    switchScene(scene) {
        this.currentScene = scene;

        switch (scene) {
            case 'title':
                TitleScreen.init(this.canvas);
                break;

            case 'settings':
                SettingsScreen.init(this.canvas);
                break;

            case 'cutscene':
                Cutscene.start(CutsceneData.getOpeningCutscene(), () => {
                    this.startMonth(1);
                });
                break;

            case 'gameplay':
                // Gameplay.init called by startMonth
                break;

            case 'cropSelect':
                CropSelect.init(this.canvas, this.month, (crops) => {
                    this.selectedCrops = crops;
                    this.switchScene('gameplay');
                    Gameplay.init(this.canvas, this.month, this.selectedCrops, () => this.endMonth());
                });
                break;

            case 'monthEnd':
                const summary = Economy.getMonthSummary();
                MonthEnd.init(this.canvas, this.month, summary, () => {
                    Economy.resetMonthly();
                    this.month++;
                    if (this.month > 3) {
                        this.switchScene('demoEnd');
                    } else {
                        this.switchScene('cropSelect');
                    }
                });
                break;

            case 'demoEnd':
                DemoEnd.init(this.canvas);
                break;
        }
    },

    startMonth(month) {
        this.month = month;
        if (month === 1) {
            // Month 1: only lettuce
            this.selectedCrops = ['lettuce'];
            this.switchScene('gameplay');
            Gameplay.init(this.canvas, this.month, this.selectedCrops, () => this.endMonth());
        } else {
            // Months 2 & 3: crop selection
            this.switchScene('cropSelect');
        }
    },

    endMonth() {
        this.switchScene('monthEnd');
    },

    newGame() {
        Economy.init();
        Equipment.init();
        this.month = 1;
        this.selectedCrops = ['lettuce'];
        this.switchScene('cutscene');
    },

    // ===== GAME LOOP =====
    gameLoop(timestamp) {
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1); // cap delta
        this.lastTime = timestamp;

        // Update
        this.update(deltaTime);

        // Draw
        this.draw();

        requestAnimationFrame((t) => this.gameLoop(t));
    },

    update(deltaTime) {
        switch (this.currentScene) {
            case 'title':
                TitleScreen.update(deltaTime);
                break;
            case 'settings':
                SettingsScreen.update(deltaTime);
                break;
            case 'cutscene':
                Cutscene.update(deltaTime);
                break;
            case 'gameplay':
                Gameplay.update(deltaTime, this.canvas);
                break;
            case 'cropSelect':
                CropSelect.update(deltaTime);
                break;
            case 'monthEnd':
                MonthEnd.update(deltaTime);
                break;
            case 'demoEnd':
                DemoEnd.update(deltaTime);
                break;
        }
    },

    draw() {
        // Clear
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        switch (this.currentScene) {
            case 'title':
                TitleScreen.draw(this.ctx, this.canvas);
                break;
            case 'settings':
                SettingsScreen.draw(this.ctx, this.canvas);
                break;
            case 'cutscene':
                Cutscene.draw(this.ctx, this.canvas);
                break;
            case 'gameplay':
                Gameplay.draw(this.ctx, this.canvas);
                break;
            case 'cropSelect':
                CropSelect.draw(this.ctx, this.canvas);
                break;
            case 'monthEnd':
                MonthEnd.draw(this.ctx, this.canvas);
                break;
            case 'demoEnd':
                DemoEnd.draw(this.ctx, this.canvas);
                break;
        }
    },

    // ===== INPUT HANDLERS =====
    onMouseMove(e) {
        const pos = this.getMousePos(e);
        this.mouseX = pos.x;
        this.mouseY = pos.y;

        switch (this.currentScene) {
            case 'title': TitleScreen.onMouseMove(pos.x, pos.y); break;
            case 'settings': SettingsScreen.onMouseMove(pos.x, pos.y); break;
            case 'cropSelect': CropSelect.onMouseMove(pos.x, pos.y); break;
            case 'monthEnd': MonthEnd.onMouseMove(pos.x, pos.y); break;
            case 'demoEnd': DemoEnd.onMouseMove(pos.x, pos.y); break;
        }
    },

    onMouseDown(e) {
        const pos = this.getMousePos(e);
        if (this.currentScene === 'settings') {
            SettingsScreen.onMouseDown(pos.x, pos.y);
        }
    },

    onMouseUp(e) {
        if (this.currentScene === 'settings') {
            SettingsScreen.onMouseUp();
        }
    },

    onClick(e) {
        const pos = this.getMousePos(e);
        Audio.init(); // Ensure audio context on click

        switch (this.currentScene) {
            case 'title': {
                const result = TitleScreen.onClick(pos.x, pos.y);
                if (result === 'play') this.newGame();
                else if (result === 'settings') this.switchScene('settings');
                break;
            }
            case 'settings': {
                const result = SettingsScreen.onClick(pos.x, pos.y);
                if (result === 'back') this.switchScene('title');
                break;
            }
            case 'cutscene':
                Cutscene.onClick();
                break;
            case 'gameplay':
                Gameplay.onClick(pos.x, pos.y);
                break;
            case 'cropSelect':
                CropSelect.onClick(pos.x, pos.y);
                break;
            case 'monthEnd':
                MonthEnd.onClick(pos.x, pos.y);
                break;
            case 'demoEnd': {
                const result = DemoEnd.onClick(pos.x, pos.y);
                if (result === 'title') this.switchScene('title');
                break;
            }
        }
    },

    onKeyDown(e) {
        // Prevent default for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab'].includes(e.key)) {
            e.preventDefault();
        }

        switch (this.currentScene) {
            case 'cutscene':
                Cutscene.onKeyDown(e.key);
                break;
            case 'gameplay':
                Gameplay.onKeyDown(e.key);
                break;
        }
    },

    onKeyUp(e) {
        if (this.currentScene === 'gameplay') {
            Gameplay.onKeyUp(e.key);
        }
    },
};

// ===== START GAME =====
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
