"use client";

type SoundEffect =
  | "play"
  | "draw"
  | "action"
  | "wild4"
  | "z_swap"
  | "shield"
  | "unoz"
  | "tegur"
  | "emote"
  | "win"
  | "click";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.muted = window.localStorage.getItem("unoz_muted") === "true";
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined" || this.muted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(value: boolean): void {
    this.muted = value;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("unoz_muted", String(value));
    }
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    gainValue = 0.14,
    delay = 0,
    endFreq?: number
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  play(effect: SoundEffect): void {
    try {
      switch (effect) {
        case "click":
          this.tone(520, 0.06, "triangle", 0.09, 0, 680);
          break;
        case "play":
          this.tone(360, 0.09, "triangle", 0.15, 0, 580);
          break;
        case "draw":
          this.tone(280, 0.08, "sine", 0.12, 0, 210);
          break;
        case "action":
          this.tone(440, 0.1, "triangle", 0.14, 0, 660);
          this.tone(660, 0.12, "triangle", 0.14, 0.07, 880);
          break;
        case "wild4":
          this.tone(180, 0.24, "sawtooth", 0.16, 0, 75);
          this.tone(130, 0.26, "square", 0.1, 0.05, 65);
          break;
        case "z_swap":
          this.tone(300, 0.12, "triangle", 0.15, 0, 720);
          this.tone(720, 0.14, "triangle", 0.15, 0.1, 360);
          this.tone(360, 0.18, "sine", 0.16, 0.2, 920);
          break;
        case "shield":
          this.tone(520, 0.12, "sine", 0.15, 0, 1040);
          this.tone(880, 0.2, "triangle", 0.14, 0.08, 1320);
          break;
        case "unoz":
          this.tone(587, 0.11, "triangle", 0.16, 0);
          this.tone(880, 0.18, "triangle", 0.18, 0.09);
          break;
        case "tegur":
          this.tone(240, 0.16, "sawtooth", 0.14, 0, 180);
          this.tone(180, 0.2, "sawtooth", 0.14, 0.14, 140);
          break;
        case "emote":
          this.tone(640, 0.08, "sine", 0.1, 0, 820);
          break;
        case "win":
          this.tone(523.25, 0.14, "triangle", 0.16, 0);
          this.tone(659.25, 0.14, "triangle", 0.16, 0.12);
          this.tone(783.99, 0.16, "triangle", 0.17, 0.24);
          this.tone(1046.5, 0.35, "triangle", 0.19, 0.36);
          break;
      }
    } catch {
      // Ignore Web Audio autoplay restrictions before user gesture
    }
  }
}

export const soundEngine = new SoundEngine();
