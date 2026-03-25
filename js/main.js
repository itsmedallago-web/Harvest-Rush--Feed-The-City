// ============================================================
// main.js — Game loop, scene manager, global state
// ============================================================
const Game = (() => {
    let canvas, ctx;
    let currentScene = null;
    let currentSceneName = '';
    let state = {};  // shared game state between scenes
    let lastTime = 0;

    const scenes = {};

    function init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Register scenes
        scenes['title'] = TitleScene;
        scenes['settings'] = SettingsScene;
        scenes['cutscene_intro'] = { ...CutsceneScene, initMode: 'intro' };
        scenes['cutscene_ending'] = { ...CutsceneScene, initMode: 'ending' };
        scenes['farm'] = FarmScene;
        scenes['monthEnd'] = MonthEndScene;
        scenes['end'] = EndScene;

        // Input events
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            if (currentScene && currentScene.onMouseMove) {
                currentScene.onMouseMove(x, y);
            }
        });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            if (currentScene && currentScene.onClick) {
                currentScene.onClick(x, y);
            }
        });

        canvas.addEventListener('mouseup', (e) => {
            if (currentScene && currentScene.onMouseUp) {
                currentScene.onMouseUp();
            }
        });

        // Resize handler
        function resize() {
            const maxW = window.innerWidth - 20;
            const maxH = window.innerHeight - 20;
            const aspect = 960 / 640;
            let w = maxW;
            let h = w / aspect;
            if (h > maxH) {
                h = maxH;
                w = h * aspect;
            }
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
        }
        window.addEventListener('resize', resize);
        resize();

        // Start at title
        changeScene('title');
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function changeScene(name) {
        currentSceneName = name;

        if (name === 'cutscene_intro') {
            currentScene = CutsceneScene;
            currentScene.init('intro');
        } else if (name === 'cutscene_ending') {
            currentScene = CutsceneScene;
            currentScene.init('ending');
        } else {
            currentScene = scenes[name];
            if (currentScene && currentScene.init) {
                currentScene.init();
            }
        }
    }

    function gameLoop(time) {
        const dt = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        // Update
        if (currentScene && currentScene.update) {
            currentScene.update(dt);
        }

        // Render
        ctx.clearRect(0, 0, 960, 640);
        if (currentScene && currentScene.render) {
            currentScene.render(ctx);
        }

        requestAnimationFrame(gameLoop);
    }

    // Public API
    const api = {
        init,
        changeScene,
        state: state,
        getState: () => state
    };

    // Use a proxy so state can be reassigned
    Object.defineProperty(api, 'state', {
        get() { return state; },
        set(v) { state = v; }
    });

    return api;
})();

// Boot the game
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
