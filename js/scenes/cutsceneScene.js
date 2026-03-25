// ============================================================
// cutsceneScene.js — Narrative cutscenes (intro & ending)
// ============================================================
const CutsceneScene = (() => {
    let currentFrame = 0;
    let textIndex = 0;
    let textTimer = 0;
    let mode = 'intro'; // 'intro' or 'ending'
    let fadeAlpha = 1;
    let fadeDir = -1; // -1 = fading in, 1 = fading out
    let waitTimer = 0;
    let clickEnabled = false;

    const INTRO_FRAMES = [
        {
            type: 'scene',
            bg: 'house',
            text: '',
            subText: 'Holly arrives home after a long day...',
            duration: 3
        },
        {
            type: 'scene',
            bg: 'house',
            text: '',
            subText: 'She notices a letter on the table...',
            showHolly: true,
            hollyPos: { x: 350, y: 280 },
            duration: 3
        },
        {
            type: 'scene',
            bg: 'house',
            text: '',
            subText: 'Holly picks up the letter and begins to read...',
            showHolly: true,
            hollyPos: { x: 430, y: 280 },
            duration: 2.5
        },
        {
            type: 'letter',
            text: [
                'Dear Holly,',
                '',
                'Your uncle needs help with the',
                'farm here in Greenfield. The food',
                'supplies are running low and I know',
                'you study Environmental Science,',
                'so you already have some experience.',
                '',
                'Please, help us with this big',
                'problem for at least a year.',
                '',
                'Thank you in advance,',
                'Uncle Jorge'
            ]
        },
        {
            type: 'scene',
            bg: 'house',
            text: '',
            subText: 'Holly folds the letter with determination.',
            showHolly: true,
            hollyPos: { x: 430, y: 280 },
            duration: 2.5
        },
        {
            type: 'transition',
            text: 'And so, Holly heads to Greenfield...',
            duration: 3
        },
        {
            type: 'scene',
            bg: 'farm',
            text: '',
            subText: 'Welcome to Greenfield Farm!',
            duration: 3
        }
    ];

    const ENDING_FRAMES = [
        {
            type: 'transition',
            text: 'Three months later...',
            duration: 3
        },
        {
            type: 'letter',
            text: [
                'Dear Holly,',
                '',
                'We, the citizens of Greenfield,',
                'want to express our deepest',
                'gratitude for everything you',
                'have done for our city.',
                '',
                'Thanks to your hard work and',
                'dedication, our food supplies',
                'are restored and the city is',
                'thriving once again!',
                '',
                'You are our hero!',
                '',
                'With love,',
                'The Citizens of Greenfield'
            ]
        }
    ];

    function init(m) {
        mode = m || 'intro';
        currentFrame = 0;
        textIndex = 0;
        textTimer = 0;
        fadeAlpha = 1;
        fadeDir = -1;
        waitTimer = 0;
        clickEnabled = false;
    }

    function getFrames() {
        return mode === 'intro' ? INTRO_FRAMES : ENDING_FRAMES;
    }

    function update(dt) {
        const frames = getFrames();
        if (currentFrame >= frames.length) return;
        const frame = frames[currentFrame];

        // Fade handling
        if (fadeDir === -1) {
            fadeAlpha -= dt * 1.5;
            if (fadeAlpha <= 0) {
                fadeAlpha = 0;
                fadeDir = 0;
                clickEnabled = true;
            }
            return;
        }
        if (fadeDir === 1) {
            fadeAlpha += dt * 1.5;
            if (fadeAlpha >= 1) {
                fadeAlpha = 1;
                fadeDir = -1;
                nextFrame();
            }
            return;
        }

        // Text typing for letter
        if (frame.type === 'letter') {
            const fullText = frame.text.join('\n');
            if (textIndex < fullText.length) {
                textTimer += dt;
                if (textTimer > 0.03) {
                    textTimer = 0;
                    textIndex++;
                }
            }
        }

        // Auto-advance for timed frames
        if (frame.duration) {
            waitTimer += dt;
            if (waitTimer >= frame.duration) {
                advanceFrame();
            }
        }
    }

    function advanceFrame() {
        fadeDir = 1;
        clickEnabled = false;
    }

    function nextFrame() {
        const frames = getFrames();
        currentFrame++;
        textIndex = 0;
        textTimer = 0;
        waitTimer = 0;
        clickEnabled = false;

        if (currentFrame >= frames.length) {
            if (mode === 'intro') {
                Game.changeScene('farm');
            } else {
                Game.changeScene('end');
            }
        }
    }

    function render(ctx) {
        const W = 960, H = 640;
        const frames = getFrames();
        if (currentFrame >= frames.length) return;
        const frame = frames[currentFrame];

        // Background
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, W, H);

        if (frame.type === 'scene') {
            // Draw background art
            if (frame.bg === 'house') {
                const houseImg = Assets.generateHouseInterior(2);
                ctx.drawImage(houseImg, 0, 0, W, H);
            } else if (frame.bg === 'farm') {
                const farmImg = Assets.generateFarmLandscape(2);
                ctx.drawImage(farmImg, 0, 0, W, H);
            }

            // Draw Holly
            if (frame.showHolly) {
                const holly = Assets.generateHolly(6);
                ctx.drawImage(holly, frame.hollyPos.x, frame.hollyPos.y);
            }

            // Subtitle bar
            if (frame.subText) {
                ctx.fillStyle = 'rgba(0,0,0,0.75)';
                ctx.fillRect(0, H - 100, W, 100);
                ctx.fillStyle = 'rgba(93,186,60,0.3)';
                ctx.fillRect(0, H - 100, W, 3);

                ctx.save();
                ctx.textAlign = 'center';
                ctx.font = '14px "Press Start 2P", monospace';
                ctx.fillStyle = '#fff';
                ctx.fillText(frame.subText, W / 2, H - 50);

                if (clickEnabled && !frame.duration) {
                    ctx.font = '10px "Press Start 2P", monospace';
                    ctx.fillStyle = '#aaa';
                    ctx.fillText('Click to continue...', W / 2, H - 20);
                }
                ctx.restore();
            }
        } else if (frame.type === 'letter') {
            // Parchment background
            const lx = W / 2 - 240, ly = 50, lw = 480, lh = 500;
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(lx + 6, ly + 6, lw, lh);
            // Parchment
            ctx.fillStyle = '#f5ecd0';
            ctx.fillRect(lx, ly, lw, lh);
            // Border
            ctx.strokeStyle = '#c8a868';
            ctx.lineWidth = 4;
            ctx.strokeRect(lx + 8, ly + 8, lw - 16, lh - 16);
            // Inner border
            ctx.strokeStyle = '#e0d0a0';
            ctx.lineWidth = 1;
            ctx.strokeRect(lx + 14, ly + 14, lw - 28, lh - 28);

            // Wax seal at bottom
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.arc(W / 2, ly + lh - 50, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(W / 2, ly + lh - 50, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#c0392b';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('J', W / 2, ly + lh - 46);

            // Letter text (typewriter effect)
            const fullText = frame.text.join('\n');
            const visibleText = fullText.substring(0, textIndex);
            const lines = visibleText.split('\n');

            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = '#3a2a1a';
            ctx.textAlign = 'left';

            lines.forEach((line, i) => {
                // Use italic style for "Dear" and signature lines
                if (line.startsWith('Dear') || line.startsWith('Uncle') || line.startsWith('Thank') || line.startsWith('With')) {
                    ctx.fillStyle = '#5a3a1a';
                } else {
                    ctx.fillStyle = '#3a2a1a';
                }
                ctx.fillText(line, lx + 40, ly + 55 + i * 28);
            });

            // Click hint
            ctx.textAlign = 'center';
            if (textIndex >= fullText.length) {
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillStyle = '#888';
                ctx.fillText('Click to continue...', W / 2, H - 30);
            }
        } else if (frame.type === 'transition') {
            // Dark background with centered text
            ctx.fillStyle = '#0a0a15';
            ctx.fillRect(0, 0, W, H);

            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = '18px "Press Start 2P", monospace';
            ctx.fillStyle = '#cde8c0';
            ctx.fillText(frame.text, W / 2, H / 2);
            ctx.restore();
        }

        // Fade overlay
        if (fadeAlpha > 0) {
            ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
            ctx.fillRect(0, 0, W, H);
        }
    }

    function onClick() {
        if (!clickEnabled) return;
        const frames = getFrames();
        if (currentFrame >= frames.length) return;
        const frame = frames[currentFrame];

        AudioManager.playClick();

        if (frame.type === 'letter') {
            const fullText = frame.text.join('\n');
            if (textIndex < fullText.length) {
                textIndex = fullText.length;
            } else {
                advanceFrame();
            }
        } else if (!frame.duration) {
            advanceFrame();
        }
    }

    function onMouseMove() { }

    return { init, update, render, onClick, onMouseMove };
})();
