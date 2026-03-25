// ===== AUDIO SYSTEM =====
// Web Audio API oscillator-based sound effects

const Audio = {
    ctx: null,
    masterVolume: 0.5,
    enabled: true,
    _initialized: false,

    init() {
        if (this._initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._initialized = true;
            // Load saved volume
            const saved = localStorage.getItem('harvestRush_volume');
            if (saved !== null) {
                this.masterVolume = parseFloat(saved);
            }
        } catch (e) {
            console.warn('Audio not available:', e);
            this.enabled = false;
        }
    },

    setVolume(v) {
        this.masterVolume = Math.max(0, Math.min(1, v));
        localStorage.setItem('harvestRush_volume', this.masterVolume);
    },

    getVolume() {
        return this.masterVolume;
    },

    _playTone(freq, duration, type = 'square', volume = 0.3) {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume * this.masterVolume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    _playNotes(notes, type = 'square', volume = 0.2) {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        notes.forEach(([freq, start, dur]) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.value = volume * this.masterVolume;
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + start + dur);

            osc.start(this.ctx.currentTime + start);
            osc.stop(this.ctx.currentTime + start + dur);
        });
    },

    // ===== SFX =====
    playClick() {
        this._playTone(800, 0.08, 'square', 0.15);
    },

    playPlant() {
        this._playNotes([
            [300, 0, 0.1],
            [450, 0.1, 0.15],
        ], 'triangle', 0.25);
    },

    playWater() {
        this._playNotes([
            [600, 0, 0.05],
            [500, 0.05, 0.05],
            [400, 0.1, 0.05],
            [350, 0.15, 0.1],
        ], 'sine', 0.15);
    },

    playHarvest() {
        this._playNotes([
            [523, 0, 0.1],
            [659, 0.1, 0.1],
            [784, 0.2, 0.15],
            [1047, 0.35, 0.25],
        ], 'square', 0.2);
    },

    playTruck() {
        this._playNotes([
            [150, 0, 0.3],
            [200, 0.1, 0.3],
            [150, 0.3, 0.2],
        ], 'sawtooth', 0.15);
        // Horn
        setTimeout(() => {
            this._playNotes([
                [440, 0, 0.2],
                [440, 0.25, 0.3],
            ], 'square', 0.2);
        }, 400);
    },

    playMoney() {
        this._playNotes([
            [1200, 0, 0.05],
            [1400, 0.08, 0.05],
            [1600, 0.16, 0.08],
        ], 'square', 0.12);
    },

    playProcess() {
        this._playNotes([
            [200, 0, 0.1],
            [300, 0.1, 0.1],
            [400, 0.2, 0.1],
            [500, 0.3, 0.15],
        ], 'triangle', 0.2);
    },

    playError() {
        this._playNotes([
            [300, 0, 0.15],
            [200, 0.15, 0.2],
        ], 'square', 0.25);
    },

    playSuccess() {
        this._playNotes([
            [523, 0, 0.12],
            [659, 0.12, 0.12],
            [784, 0.24, 0.12],
            [1047, 0.36, 0.3],
        ], 'triangle', 0.25);
    },

    playTypewriter() {
        this._playTone(600 + Math.random() * 200, 0.03, 'square', 0.05);
    },

    playNewDay() {
        this._playNotes([
            [440, 0, 0.15],
            [494, 0.12, 0.15],
            [523, 0.24, 0.15],
            [587, 0.36, 0.2],
        ], 'triangle', 0.15);
    },

    playMenuMusic() {
        // Simple pleasant melody loop
        const melody = [
            [523, 0, 0.3],    // C
            [587, 0.35, 0.3], // D
            [659, 0.7, 0.3],  // E
            [523, 1.05, 0.3], // C
            [587, 1.4, 0.3],  // D
            [784, 1.75, 0.4], // G
            [659, 2.2, 0.3],  // E
            [523, 2.55, 0.5], // C
        ];
        this._playNotes(melody, 'triangle', 0.1);
    },
};
