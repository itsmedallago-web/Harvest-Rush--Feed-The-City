// ============================================================
// audio.js — Web Audio API sound manager
// ============================================================
const AudioManager = (() => {
    let ctx = null;
    let masterVolume = 0.5;
    let muted = false;

    function getCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return ctx;
    }

    function playTone(freq, duration, type = 'square', vol = 0.3) {
        if (muted) return;
        try {
            const c = getCtx();
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.value = vol * masterVolume;
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime);
            osc.stop(c.currentTime + duration);
        } catch (e) { }
    }

    function playClick() { playTone(800, 0.08, 'square', 0.2); }
    function playSelect() { playTone(520, 0.1, 'square', 0.15); playTone(780, 0.1, 'square', 0.15); }
    function playPlant() { playTone(300, 0.15, 'triangle', 0.25); }
    function playWater() { playTone(400, 0.2, 'sine', 0.15); playTone(500, 0.15, 'sine', 0.1); }
    function playHarvest() {
        playTone(523, 0.1, 'square', 0.2);
        setTimeout(() => playTone(659, 0.1, 'square', 0.2), 100);
        setTimeout(() => playTone(784, 0.15, 'square', 0.2), 200);
    }
    function playDeliver() {
        playTone(440, 0.1, 'square', 0.2);
        setTimeout(() => playTone(554, 0.1, 'square', 0.2), 80);
        setTimeout(() => playTone(659, 0.1, 'square', 0.2), 160);
        setTimeout(() => playTone(880, 0.2, 'square', 0.25), 240);
    }
    function playError() { playTone(200, 0.25, 'sawtooth', 0.15); }
    function playMusic() {
        // Simple background loop using oscillators
        if (muted) return;
        const melody = [262, 294, 330, 349, 392, 349, 330, 294];
        let i = 0;
        const interval = setInterval(() => {
            if (muted) { clearInterval(interval); return; }
            playTone(melody[i % melody.length], 0.3, 'triangle', 0.08);
            i++;
            if (i > 64) clearInterval(interval);
        }, 500);
    }

    return {
        playClick, playSelect, playPlant, playWater, playHarvest,
        playDeliver, playError, playMusic,
        getVolume: () => masterVolume,
        setVolume: (v) => { masterVolume = Math.max(0, Math.min(1, v)); },
        isMuted: () => muted,
        toggleMute: () => { muted = !muted; },
        init: () => { getCtx(); }
    };
})();
