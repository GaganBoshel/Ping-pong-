/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, Trophy, Flame, Play, Sparkles, Shield, Award, Palette } from 'lucide-react';

// ==========================================
// PROCEDURAL SOUND SYNTHESIZER (Web Audio API)
// ==========================================
class SoundSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public paddleHit(power = 1.0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Wood/rubber resonance
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = 230 + Math.min(power * 90, 200);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.06);

    const hitVol = Math.min(0.45 * power, 0.7);
    gain.gain.setValueAtTime(hitVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);

    // Sharp contact snap
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1100, now);
    snapOsc.frequency.exponentialRampToValueAtTime(240, now + 0.02);
    snapGain.gain.setValueAtTime(0.35 * power, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.03);
  }

  public tableBounce(power = 1.0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.032);

    const vol = Math.min(0.32 * power, 0.5);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public netHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public pointScore(isPlayer: boolean) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = isPlayer
      ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 (Bright triumph)
      : [440.0, 392.0, 349.23, 293.66]; // A4, G4, F4, D4 (Minor descent)

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isPlayer ? 'triangle' : 'sine';
      const startTime = now + idx * 0.08;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  public matchPoint() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [880, 1174.66].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const startTime = now + idx * 0.11;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  }

  public victory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, t: 0, d: 0.14 },
      { f: 659.25, t: 0.13, d: 0.14 },
      { f: 783.99, t: 0.26, d: 0.14 },
      { f: 1046.5, t: 0.39, d: 0.4 },
      { f: 880.0, t: 0.54, d: 0.14 },
      { f: 1046.5, t: 0.68, d: 0.55 },
    ];
    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const startTime = now + note.t;
      osc.frequency.setValueAtTime(note.f, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + note.d + 0.05);
    });
  }

  public defeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [
      { f: 392.0, t: 0, d: 0.2 },
      { f: 349.23, t: 0.18, d: 0.2 },
      { f: 311.13, t: 0.38, d: 0.25 },
      { f: 261.63, t: 0.6, d: 0.5 },
    ];
    notes.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const startTime = now + note.t;
      osc.frequency.setValueAtTime(note.f, startTime);
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + note.d + 0.05);
    });
  }

  public whoosh() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }
}

// Global single sound instance
const sound = new SoundSynth();

// ==========================================
// GAME CONSTANTS & INTERFACES
// ==========================================
const CANVAS_W = 960;
const CANVAS_H = 640;
const WINNING_SCORE = 11;
const PADDLE_HALF_BASE = 0.17;
const PLAYER_HIT_DEPTH = 0.94;
const AI_HIT_DEPTH = 0.06;

interface BallState {
  depth: number;       // 0 (far/AI edge) to 1 (near/player edge)
  lateral: number;     // -1 (left edge) to +1 (right edge)
  vDepth: number;      // Depth velocity
  vLateral: number;    // Lateral velocity
  z: number;           // Vertical altitude above table in pixels (0 = table surface)
  vz: number;          // Vertical velocity
  spinLateral: number; // Curve/Magnus spin (-2..+2)
  rotation: number;    // Ball seam visual rotation angle
  tableBounces: number;// Count bounces since last hit
  lastHitter: 'player' | 'cpu' | null;
  smash: boolean;      // High speed hit flag
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

interface FloatText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
}

type Difficulty = 'casual' | 'pro' | 'master';

export type PaddleColor = 'blue' | 'green' | 'purple';

export const PADDLE_COLOR_OPTIONS: PaddleColor[] = ['blue', 'green', 'purple'];

export const PADDLE_COLOR_CONFIG: Record<PaddleColor, {
  name: string;
  light: string;
  mid: string;
  dark: string;
  dotColorClass: string;
  avatarClass: string;
  sparkColors: string[];
}> = {
  blue: {
    name: 'Cobalt Blue',
    light: '#60a5fa',
    mid: '#2563eb',
    dark: '#1e40af',
    dotColorClass: 'bg-blue-400 shadow-blue-400/50',
    avatarClass: 'bg-gradient-to-br from-blue-500 to-indigo-700 shadow-indigo-900/40 text-white',
    sparkColors: ['#ffffff', '#93c5fd', '#3b82f6', '#1d4ed8'],
  },
  green: {
    name: 'Emerald Green',
    light: '#4ade80',
    mid: '#16a34a',
    dark: '#14532d',
    dotColorClass: 'bg-emerald-400 shadow-emerald-400/50',
    avatarClass: 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-900/40 text-white',
    sparkColors: ['#ffffff', '#86efac', '#22c55e', '#15803d'],
  },
  purple: {
    name: 'Cyber Purple',
    light: '#c084fc',
    mid: '#9333ea',
    dark: '#581c87',
    dotColorClass: 'bg-purple-400 shadow-purple-400/50',
    avatarClass: 'bg-gradient-to-br from-purple-500 to-fuchsia-800 shadow-purple-900/40 text-white',
    sparkColors: ['#ffffff', '#e9d5ff', '#a855f7', '#7e22ce'],
  },
};

export const getRandomPaddleColor = (exclude?: PaddleColor): PaddleColor => {
  const choices = exclude ? PADDLE_COLOR_OPTIONS.filter((c) => c !== exclude) : PADDLE_COLOR_OPTIONS;
  return choices[Math.floor(Math.random() * choices.length)];
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Randomly select paddle color (blue, green, purple) for the match
  const [playerPaddleColor, setPlayerPaddleColor] = useState<PaddleColor>(() => getRandomPaddleColor());

  // Game UI State
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [serving, setServing] = useState(true);
  const [server, setServer] = useState<'player' | 'cpu'>('player');
  const [rallyCount, setRallyCount] = useState(0);
  const [bestRally, setBestRally] = useState(0);
  const [totalSmashes, setTotalSmashes] = useState(0);
  const [muted, setMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('pro');
  const [bannerMessage, setBannerMessage] = useState<{ text: string; sub: string } | null>({
    text: 'Ping Pong 3D',
    sub: 'Click or Tap to Serve',
  });
  const [gameOver, setGameOver] = useState<'player' | 'cpu' | null>(null);
  const [screenShakeActive, setScreenShakeActive] = useState(false);
  const shakeTimerRef = useRef<number | null>(null);

  // Game logic refs to avoid frame tearing
  const gameStateRef = useRef({
    playerScore: 0,
    cpuScore: 0,
    playerPaddleColor,
    serving: true,
    server: 'player' as 'player' | 'cpu',
    rallyCount: 0,
    bestRally: 0,
    totalSmashes: 0,
    difficulty: 'pro' as Difficulty,
    gameOver: null as 'player' | 'cpu' | null,

    // Inputs & Positions
    paddleLateral: 0,
    paddleVx: 0,
    prevPaddleLateral: 0,
    paddleDepth: 0.94,
    prevPaddleDepth: 0.94,
    paddleVy: 0,
    aiLateral: 0,
    aiVx: 0,

    // Tilt angles for 3D realism
    paddleTilt: 0,
    aiTilt: 0,

    // Ball
    ball: null as BallState | null,
    trail: [] as { x: number; y: number; r: number; alpha: number; smash: boolean }[],

    // FX & Camera Shake
    sparks: [] as SparkParticle[],
    floatTexts: [] as FloatText[],
    shakeMag: 0,
    shakeX: 0,
    shakeY: 0,

    // Serve sequence
    serveCounter: 0,
  });

  // Table geometry helper
  const tableGeom = {
    topY: 130,        // AI table edge
    bottomY: 535,     // Player table edge
    topHalfW: 155,    // Far edge half width
    bottomHalfW: 385, // Near edge half width
    cx: CANVAS_W / 2,
    thickness: 24,    // Table extrusion depth
  };

  const tableEdgeAt = useCallback((depth: number) => {
    const y = tableGeom.topY + (tableGeom.bottomY - tableGeom.topY) * depth;
    const halfW = tableGeom.topHalfW + (tableGeom.bottomHalfW - tableGeom.topHalfW) * depth;
    return { y, halfW };
  }, [tableGeom.bottomHalfW, tableGeom.bottomY, tableGeom.topHalfW, tableGeom.topY]);

  const worldToScreen = useCallback((depth: number, lateral: number) => {
    const { y, halfW } = tableEdgeAt(depth);
    const x = tableGeom.cx + lateral * halfW;
    return { x, y };
  }, [tableEdgeAt, tableGeom.cx]);

  // Spawn visual impact sparks
  const spawnHitSparks = useCallback((screenX: number, screenY: number, count = 18, colorTheme = 'warm') => {
    const gs = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      let color = '#ffffff';
      if (colorTheme in PADDLE_COLOR_CONFIG) {
        const themeColors = PADDLE_COLOR_CONFIG[colorTheme as PaddleColor].sparkColors;
        color = themeColors[Math.floor(Math.random() * themeColors.length)];
      } else if (colorTheme === 'ice') {
        const colors = ['#ffffff', '#80deea', '#00e5ff', '#2979ff'];
        color = colors[Math.floor(Math.random() * colors.length)];
      } else {
        const colors = ['#ffffff', '#ffeb3b', '#ff9800', '#ff5722'];
        color = colors[Math.floor(Math.random() * colors.length)];
      }
      gs.sparks.push({
        x: screenX,
        y: screenY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        color,
        size: 1.5 + Math.random() * 3,
        alpha: 1,
        decay: 0.028 + Math.random() * 0.035,
      });
    }
  }, []);

  const addFloatText = useCallback((text: string, x: number, y: number, color = '#ffeb3b') => {
    gameStateRef.current.floatTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      alpha: 1.4,
      scale: 1.3,
    });
  }, []);

  // Trigger camera shake
  const addCameraShake = useCallback((mag: number) => {
    gameStateRef.current.shakeMag = Math.min(gameStateRef.current.shakeMag + mag, 16);
  }, []);

  // Initialize fresh ball with relaxed speed
  const createBall = useCallback((servedBy: 'player' | 'cpu'): BallState => {
    const gs = gameStateRef.current;
    const startDepth = servedBy === 'player' ? gs.paddleDepth - 0.02 : 0.06;
    const dir = servedBy === 'player' ? -1 : 1;
    const baseVd = dir * 0.0105;
    return {
      depth: startDepth,
      lateral: (Math.random() - 0.5) * 0.3,
      vDepth: baseVd,
      vLateral: (Math.random() - 0.5) * 0.006,
      z: 26,
      vz: 3.6,
      spinLateral: 0,
      rotation: 0,
      tableBounces: 0,
      lastHitter: servedBy,
      smash: false,
    };
  }, []);

  // Reset for next serve
  const resetServe = useCallback((nextServer: 'player' | 'cpu', msg?: string, subMsg = 'Click or Tap to Serve') => {
    const gs = gameStateRef.current;
    gs.serving = true;
    gs.server = nextServer;
    gs.ball = createBall(nextServer);
    gs.rallyCount = 0;

    setServing(true);
    setServer(nextServer);
    setRallyCount(0);
    if (msg) {
      setBannerMessage({ text: msg, sub: subMsg });
    }
  }, [createBall]);

  // Scoring logic with Match Point & Deuce Detection
  const handlePointScored = useCallback((winner: 'player' | 'cpu') => {
    const gs = gameStateRef.current;
    if (gs.gameOver) return;

    sound.pointScore(winner === 'player');

    // Trigger physical 3D camera shake and container/screen shake on point score
    addCameraShake(9);
    setScreenShakeActive(true);
    if (shakeTimerRef.current) {
      window.clearTimeout(shakeTimerRef.current);
    }
    shakeTimerRef.current = window.setTimeout(() => {
      setScreenShakeActive(false);
      shakeTimerRef.current = null;
    }, 450);

    let newP = gs.playerScore;
    let newC = gs.cpuScore;
    if (winner === 'player') {
      newP++;
      gs.playerScore = newP;
      setPlayerScore(newP);
    } else {
      newC++;
      gs.cpuScore = newC;
      setCpuScore(newC);
    }

    // Check Win Condition (First to 11, must lead by 2)
    const pLead = newP - newC;
    const cLead = newC - newP;
    if (newP >= WINNING_SCORE && pLead >= 2) {
      gs.gameOver = 'player';
      setGameOver('player');
      sound.victory();
      return;
    }
    if (newC >= WINNING_SCORE && cLead >= 2) {
      gs.gameOver = 'cpu';
      setGameOver('cpu');
      sound.defeat();
      return;
    }

    // Service changes every 2 points, or every point in deuce (>= 10-10)
    gs.serveCounter++;
    let nextServer = gs.server;
    const isDeuce = newP >= 10 && newC >= 10;
    if (isDeuce || gs.serveCounter % 2 === 0) {
      nextServer = gs.server === 'player' ? 'cpu' : 'player';
    }

    // Match point alert
    const isMatchPoint = (newP >= WINNING_SCORE - 1 && pLead >= 1) || (newC >= WINNING_SCORE - 1 && cLead >= 1);
    if (isMatchPoint) {
      sound.matchPoint();
    }

    let banner = winner === 'player' ? 'Point for You!' : 'CPU Scored!';
    if (isMatchPoint) {
      banner = `${winner === 'player' ? 'YOU HAVE' : 'CPU HAS'} MATCH POINT!`;
    } else if (isDeuce) {
      banner = `DEUCE! (${newP} - ${newC})`;
    }

    resetServe(nextServer, banner, nextServer === 'player' ? 'Your Serve — Click / Tap' : 'CPU Serve Incoming...');

    // If CPU serves, auto-launch after brief delay
    if (nextServer === 'cpu') {
      setTimeout(() => {
        if (gameStateRef.current.serving && gameStateRef.current.server === 'cpu' && !gameStateRef.current.gameOver) {
          gameStateRef.current.serving = false;
          setServing(false);
          setBannerMessage(null);
          sound.paddleHit(1.0);
          if (gameStateRef.current.ball) {
            gameStateRef.current.ball.vDepth = 0.0105;
            gameStateRef.current.ball.vLateral = (Math.random() - 0.5) * 0.006;
            gameStateRef.current.ball.vz = 3.6;
            gameStateRef.current.ball.tableBounces = 0;
            gameStateRef.current.ball.lastHitter = 'cpu';
          }
        }
      }, 1100);
    }
  }, [addCameraShake, resetServe]);

  // Restart complete match
  const startNewMatch = useCallback(() => {
    const gs = gameStateRef.current;
    gs.playerScore = 0;
    gs.cpuScore = 0;
    gs.rallyCount = 0;
    gs.bestRally = 0;
    gs.totalSmashes = 0;
    gs.gameOver = null;
    gs.serveCounter = 0;

    if (shakeTimerRef.current) {
      window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
    setScreenShakeActive(false);

    // Randomly select a new paddle color (blue, green, purple) each time a match starts
    const nextPaddleColor = getRandomPaddleColor(gs.playerPaddleColor);
    gs.playerPaddleColor = nextPaddleColor;
    setPlayerPaddleColor(nextPaddleColor);

    setPlayerScore(0);
    setCpuScore(0);
    setRallyCount(0);
    setBestRally(0);
    setTotalSmashes(0);
    setGameOver(null);

    resetServe('player', 'Ping Pong 3D', 'Click or Tap to Serve');
  }, [resetServe]);

  // Pointer & Touch handlers
  const handlePointerMove = useCallback((clientX: number, clientY?: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const canvasX = (clientX - rect.left) * scaleX;

    const gs = gameStateRef.current;

    // Calculate depth if clientY is supplied
    if (clientY !== undefined) {
      const canvasY = (clientY - rect.top) * scaleY;
      // topY = 130 (depth 0), bottomY = 535 (depth 1)
      const rawDepth = (canvasY - tableGeom.topY) / (tableGeom.bottomY - tableGeom.topY);
      // Freely move along the net area (from 0.48 right along the net to 1.06 back edge)
      const depth = Math.max(0.48, Math.min(1.06, rawDepth));
      gs.prevPaddleDepth = gs.paddleDepth;
      gs.paddleDepth = depth;
      gs.paddleVy = gs.paddleDepth - gs.prevPaddleDepth;
    }

    const { halfW } = tableEdgeAt(gs.paddleDepth);
    let lateral = (canvasX - tableGeom.cx) / halfW;
    lateral = Math.max(-1.18, Math.min(1.18, lateral));

    gs.prevPaddleLateral = gs.paddleLateral;
    gs.paddleLateral = lateral;
    gs.paddleVx = (gs.paddleLateral - gs.prevPaddleLateral);
  }, [tableEdgeAt, tableGeom.bottomY, tableGeom.cx, tableGeom.topY]);

  const handlePointerDown = useCallback(() => {
    sound.init();
    const gs = gameStateRef.current;
    if (gs.gameOver) return;

    if (gs.serving) {
      gs.serving = false;
      setServing(false);
      setBannerMessage(null);
      sound.paddleHit(1.2);

      // Impart gentle serve direction, speed, and smooth arc clearing the net
      if (gs.ball) {
        gs.ball.vDepth = -0.011;
        gs.ball.vLateral = gs.paddleLateral * -0.005;
        gs.ball.vz = 3.6;
        gs.ball.tableBounces = 0;
        gs.ball.lastHitter = 'player';
        const pos = worldToScreen(gs.ball.depth, gs.ball.lateral);
        spawnHitSparks(pos.x, pos.y - gs.ball.z, 14, gs.playerPaddleColor);
      }
    }
  }, [spawnHitSparks, worldToScreen]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    sound.muted = !sound.muted;
    setMuted(sound.muted);
  }, []);

  // Difficulty change
  const setDifficultyMode = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    gameStateRef.current.difficulty = diff;
  }, []);

  // ==========================================
  // MAIN GAME ENGINE & RENDER LOOP
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // AI logic update
    const updateAI = () => {
      const gs = gameStateRef.current;
      if (!gs.ball) return;

      const diff = gs.difficulty;
      let aiSpeed = 0.018;
      let errorTolerance = 0.08;

      if (diff === 'casual') {
        aiSpeed = 0.013;
        errorTolerance = 0.14;
      } else if (diff === 'pro') {
        aiSpeed = 0.020;
        errorTolerance = 0.07;
      } else if (diff === 'master') {
        aiSpeed = 0.027;
        errorTolerance = 0.03;
      }

      // If ball is moving toward CPU, track predicted target
      let targetLateral = gs.ball.lateral;
      if (gs.ball.vDepth < 0) {
        // Linear lookahead with slight curve factor
        const timeToReach = Math.abs(gs.ball.depth - AI_HIT_DEPTH) / Math.max(0.006, Math.abs(gs.ball.vDepth));
        targetLateral = gs.ball.lateral + gs.ball.vLateral * timeToReach + (gs.ball.spinLateral * 0.0003) * (timeToReach * timeToReach * 0.5);
      } else {
        // Idle reposition towards center
        targetLateral = targetLateral * 0.5;
      }

      // Add gentle human-like reaction offset
      const dist = targetLateral - gs.aiLateral;
      const prevAi = gs.aiLateral;
      if (Math.abs(dist) > errorTolerance * 0.3) {
        gs.aiLateral += Math.sign(dist) * Math.min(Math.abs(dist), aiSpeed);
      }
      gs.aiLateral = Math.max(-1.1, Math.min(1.1, gs.aiLateral));
      gs.aiVx = gs.aiLateral - prevAi;
      gs.aiTilt += (gs.aiVx * 12 - gs.aiTilt) * 0.15;
    };

    // Physics & Ball Update
    const updatePhysics = () => {
      const gs = gameStateRef.current;
      if (gs.gameOver) return;

      // Update paddle tilt with smooth spring interpolation
      gs.paddleTilt += (gs.paddleVx * 15 - gs.paddleTilt) * 0.2;
      gs.paddleVx *= 0.75;

      // Update camera shake decay
      if (gs.shakeMag > 0.05) {
        gs.shakeX = (Math.random() - 0.5) * gs.shakeMag * 1.5;
        gs.shakeY = (Math.random() - 0.5) * gs.shakeMag * 1.5;
        gs.shakeMag *= 0.88;
      } else {
        gs.shakeMag = 0;
        gs.shakeX = 0;
        gs.shakeY = 0;
      }

      // Update particles
      for (let i = gs.sparks.length - 1; i >= 0; i--) {
        const p = gs.sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          gs.sparks.splice(i, 1);
        }
      }

      // Update float texts
      for (let i = gs.floatTexts.length - 1; i >= 0; i--) {
        const ft = gs.floatTexts[i];
        ft.y -= 1.1;
        ft.alpha -= 0.022;
        ft.scale = Math.max(1.0, ft.scale - 0.008);
        if (ft.alpha <= 0) {
          gs.floatTexts.splice(i, 1);
        }
      }

      const ball = gs.ball;
      if (!ball) return;

      // Serving hover/idle motion
      if (gs.serving) {
        ball.lateral = gs.server === 'player' ? gs.paddleLateral : gs.aiLateral;
        ball.depth = gs.server === 'player' ? gs.paddleDepth - 0.02 : 0.06;
        ball.z = 24 + Math.sin(Date.now() * 0.008) * 8;
        return;
      }

      // 1. Magnus Effect & Lateral Spin Curve
      ball.vLateral += ball.spinLateral * 0.00042;
      ball.lateral += ball.vLateral;
      ball.depth += ball.vDepth;
      ball.rotation += (ball.vLateral * 30 + ball.spinLateral * 10);

      // Side table edge bounces or out-of-bounds check
      if (ball.lateral > 1.25 || ball.lateral < -1.25) {
        if (ball.depth > 0.1 && ball.depth < 0.9) {
          // Ball flew out of bounds!
          handlePointScored(ball.lastHitter === 'player' ? 'cpu' : 'player');
          return;
        }
      }

      // 2. Vertical Ball Altitude & Table Bounce
      ball.z += ball.vz;
      ball.vz -= 0.25; // Relaxed vertical gravity for comfortable, controllable rally pace

      // Smooth net clearance: Ball cleanly glides above net level without clipping or net cord
      if (Math.abs(ball.depth - 0.5) < 0.08) {
        if (ball.z < 18) {
          ball.z = 18;
          if (ball.vz < 0.5) ball.vz = 0.5;
        }
      }

      // Table surface contact (z <= 0 over the table footprint)
      const isOverTable = ball.depth >= 0.0 && ball.depth <= 1.0 && Math.abs(ball.lateral) <= 1.04;
      if (ball.z <= 0) {
        if (isOverTable) {
          ball.z = 0;
          ball.vz = Math.max(3.2, -ball.vz * 0.82); // Restitution bounce
          ball.tableBounces++;

          const bouncePower = Math.min(1.4, Math.abs(ball.vz) / 7);
          sound.tableBounce(bouncePower);

          const pos = worldToScreen(ball.depth, ball.lateral);
          spawnHitSparks(pos.x, pos.y, 8, 'ice');

          // If ball bounces twice on one side, point scored!
          if (ball.tableBounces >= 2) {
            handlePointScored(ball.lastHitter === 'player' ? 'player' : 'cpu');
            return;
          }
        } else {
          // Ball fell below table level off table edge!
          if (ball.depth >= 1.05) {
            handlePointScored('cpu');
            return;
          } else if (ball.depth <= -0.05) {
            handlePointScored('player');
            return;
          }
        }
      }

      // Motion Trail Recording
      const curScr = worldToScreen(ball.depth, ball.lateral);
      gs.trail.unshift({
        x: curScr.x,
        y: curScr.y - ball.z,
        r: (9 * (0.45 + ball.depth * 0.85)),
        alpha: ball.smash ? 0.85 : 0.45,
        smash: ball.smash,
      });
      if (gs.trail.length > (ball.smash ? 14 : 7)) {
        gs.trail.pop();
      }

      // 3. Player Hit Zone Collision (Freely moves from net area to baseline)
      const paddleHalfW = PADDLE_HALF_BASE;
      if (ball.vDepth > 0) {
        const depthDiff = Math.abs(ball.depth - gs.paddleDepth);
        const hitDepthThreshold = Math.max(0.048, Math.abs(ball.vDepth) * 1.4);
        const crossedPaddle = (ball.depth >= gs.paddleDepth - 0.02 && (ball.depth - ball.vDepth) <= gs.paddleDepth + 0.02);

        if ((depthDiff <= hitDepthThreshold || crossedPaddle) && ball.depth <= 1.07) {
          const offset = ball.lateral - gs.paddleLateral;
          if (Math.abs(offset) < paddleHalfW + 0.09 && ball.z < 85) {
            // Successful Player Return with relaxed, comfortable ball speed
            const strikeSpeed = Math.hypot(gs.paddleVx, gs.paddleVy || 0);
            const isSmash = strikeSpeed > 0.028 || ball.z > 38;

            // Compute return depth speed (gentler pace)
            let speedFactor = 1.02;
            if (isSmash) {
              speedFactor = 1.22;
              ball.smash = true;
              gs.totalSmashes++;
              setTotalSmashes(gs.totalSmashes);
              sound.whoosh();
              addCameraShake(6);
              const pos = worldToScreen(ball.depth, ball.lateral);
              addFloatText('POWER SMASH!', pos.x, pos.y - ball.z - 30, '#ff5722');
            } else {
              ball.smash = false;
            }

            // Decreased return speed for better gameplay flow and control
            ball.vDepth = -Math.max(0.010, Math.min(0.021, Math.abs(ball.vDepth) * speedFactor));
            // Impart lateral angle based on contact point & paddle velocity
            ball.vLateral = offset * 0.032 + gs.paddleVx * 0.45;
            // Impart Magnus curve spin based on paddle swipe speed
            ball.spinLateral = Math.max(-2.0, Math.min(2.0, gs.paddleVx * 45 + offset * 1.2));
            ball.vz = isSmash ? 2.2 : 3.5;
            ball.tableBounces = 0;
            ball.lastHitter = 'player';

            // Rally Increment
            gs.rallyCount++;
            setRallyCount(gs.rallyCount);
            if (gs.rallyCount > gs.bestRally) {
              gs.bestRally = gs.rallyCount;
              setBestRally(gs.bestRally);
            }

            sound.paddleHit(isSmash ? 1.6 : 1.0);
            const pos = worldToScreen(ball.depth, ball.lateral);
            spawnHitSparks(pos.x, pos.y - ball.z, isSmash ? 28 : 16, gs.playerPaddleColor);

            if (gs.rallyCount % 5 === 0) {
              addFloatText(`RALLY ${gs.rallyCount}!`, pos.x, pos.y - ball.z - 45, '#ffd700');
            }
          }
        } else if (ball.depth >= 1.08) {
          // Missed by player off baseline!
          handlePointScored('cpu');
          return;
        }
      }

      // 4. CPU Hit Zone Collision
      if (ball.vDepth < 0 && ball.depth <= AI_HIT_DEPTH) {
        const offset = ball.lateral - gs.aiLateral;
        if (Math.abs(offset) < paddleHalfW + 0.09 && ball.z < 65) {
          // Successful CPU Return with relaxed, controllable speed
          const isAiSmash = ball.z > 35 && Math.random() < 0.35;
          ball.vDepth = Math.max(0.0095, Math.min(0.019, Math.abs(ball.vDepth) * (isAiSmash ? 1.15 : 1.02)));
          ball.vLateral = offset * 0.03 + (Math.random() - 0.5) * 0.008;
          ball.spinLateral = (Math.random() - 0.5) * 1.4;
          ball.vz = isAiSmash ? 2.2 : 3.6;
          ball.tableBounces = 0;
          ball.lastHitter = 'cpu';
          ball.smash = isAiSmash;

          gs.rallyCount++;
          setRallyCount(gs.rallyCount);
          if (gs.rallyCount > gs.bestRally) {
            gs.bestRally = gs.rallyCount;
            setBestRally(gs.bestRally);
          }

          sound.paddleHit(isAiSmash ? 1.4 : 0.9);
          const pos = worldToScreen(ball.depth, ball.lateral);
          spawnHitSparks(pos.x, pos.y - ball.z, isAiSmash ? 22 : 14, 'warm');
          if (isAiSmash) {
            addFloatText('CPU COUNTER!', pos.x, pos.y - ball.z - 25, '#ff3d00');
          }
        } else if (ball.depth <= -0.08) {
          // Missed by CPU!
          handlePointScored('player');
          return;
        }
      }
    };

    // Drawing Helpers
    const drawTable = () => {
      const far = tableEdgeAt(0);
      const near = tableEdgeAt(1);
      const thick = tableGeom.thickness;

      // 1. Table floor shadow (soft realistic ambient shadow on ground)
      const floorShadowGrad = ctx.createRadialGradient(
        tableGeom.cx,
        near.y + 35,
        100,
        tableGeom.cx,
        near.y + 45,
        near.halfW * 1.25
      );
      floorShadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      floorShadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
      floorShadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = floorShadowGrad;
      ctx.beginPath();
      ctx.ellipse(tableGeom.cx, near.y + 40, near.halfW * 1.15, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Heavy steel table legs & crossbar
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 10;
      ctx.beginPath();
      // Near left leg
      ctx.moveTo(tableGeom.cx - near.halfW * 0.85, near.y + thick);
      ctx.lineTo(tableGeom.cx - near.halfW * 0.88, near.y + 90);
      // Near right leg
      ctx.moveTo(tableGeom.cx + near.halfW * 0.85, near.y + thick);
      ctx.lineTo(tableGeom.cx + near.halfW * 0.88, near.y + 90);
      // Far left leg
      ctx.moveTo(tableGeom.cx - far.halfW * 0.85, far.y + thick);
      ctx.lineTo(tableGeom.cx - far.halfW * 0.87, far.y + 55);
      // Far right leg
      ctx.moveTo(tableGeom.cx + far.halfW * 0.85, far.y + thick);
      ctx.lineTo(tableGeom.cx + far.halfW * 0.87, far.y + 55);
      // Cross support bar
      ctx.moveTo(tableGeom.cx - near.halfW * 0.86, near.y + 60);
      ctx.lineTo(tableGeom.cx + near.halfW * 0.86, near.y + 60);
      ctx.stroke();

      // 3. 3D Table Apron / Rim Extrusion (Front & Sides)
      // Front face
      const frontGrad = ctx.createLinearGradient(0, near.y, 0, near.y + thick);
      frontGrad.addColorStop(0, '#0a3663');
      frontGrad.addColorStop(1, '#051d38');
      ctx.fillStyle = frontGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - near.halfW, near.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y + thick);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y + thick);
      ctx.closePath();
      ctx.fill();

      // Front bottom trim line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - near.halfW, near.y + thick);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y + thick);
      ctx.stroke();

      // Left side apron
      const leftApronGrad = ctx.createLinearGradient(
        tableGeom.cx - near.halfW,
        near.y,
        tableGeom.cx - far.halfW,
        far.y
      );
      leftApronGrad.addColorStop(0, '#082a4d');
      leftApronGrad.addColorStop(1, '#031426');
      ctx.fillStyle = leftApronGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - near.halfW, near.y);
      ctx.lineTo(tableGeom.cx - far.halfW, far.y);
      ctx.lineTo(tableGeom.cx - far.halfW, far.y + thick * 0.7);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y + thick);
      ctx.closePath();
      ctx.fill();

      // Right side apron
      const rightApronGrad = ctx.createLinearGradient(
        tableGeom.cx + near.halfW,
        near.y,
        tableGeom.cx + far.halfW,
        far.y
      );
      rightApronGrad.addColorStop(0, '#0a3561');
      rightApronGrad.addColorStop(1, '#04172b');
      ctx.fillStyle = rightApronGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y + thick * 0.7);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y + thick);
      ctx.closePath();
      ctx.fill();

      // 4. Glossy Tournament Table Top Surface
      const tableSurfGrad = ctx.createLinearGradient(0, tableGeom.topY, 0, tableGeom.bottomY);
      tableSurfGrad.addColorStop(0, '#0f4c82'); // Darker competition blue at distance
      tableSurfGrad.addColorStop(0.5, '#1560a1');
      tableSurfGrad.addColorStop(1, '#1b74be'); // Vibrant blue closer to player
      ctx.fillStyle = tableSurfGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y);
      ctx.closePath();
      ctx.fill();

      // Subtle diagonal stadium gloss reflection sheen
      const sheenGrad = ctx.createLinearGradient(
        tableGeom.cx - 200,
        far.y,
        tableGeom.cx + 250,
        near.y
      );
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
      sheenGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)');
      sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.14)');
      sheenGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.04)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y);
      ctx.closePath();
      ctx.fill();

      // 5. White Regulation Boundary Lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y);
      ctx.closePath();
      ctx.stroke();

      // Center lengthwise dividing line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx, far.y);
      ctx.lineTo(tableGeom.cx, near.y);
      ctx.stroke();

      // 6. Realistic 3D Net with diamond mesh, metal posts, and drop shadow
      const netEdge = tableEdgeAt(0.5);
      const netH = 34; // height in screen pixels
      const postOverhang = 18;

      // Net shadow cast on table
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - netEdge.halfW, netEdge.y);
      ctx.lineTo(tableGeom.cx + netEdge.halfW, netEdge.y);
      ctx.lineTo(tableGeom.cx + netEdge.halfW + 4, netEdge.y + 12);
      ctx.lineTo(tableGeom.cx - netEdge.halfW - 4, netEdge.y + 12);
      ctx.closePath();
      ctx.fill();

      // Metal Net Posts
      const postLeftX = tableGeom.cx - netEdge.halfW - postOverhang;
      const postRightX = tableGeom.cx + netEdge.halfW + postOverhang;
      const postW = 7;

      // Left post
      const postGrad = ctx.createLinearGradient(postLeftX, 0, postLeftX + postW, 0);
      postGrad.addColorStop(0, '#64748b');
      postGrad.addColorStop(0.5, '#cbd5e1');
      postGrad.addColorStop(1, '#334155');
      ctx.fillStyle = postGrad;
      ctx.fillRect(postLeftX - postW / 2, netEdge.y - netH - 4, postW, netH + 18);

      // Right post
      ctx.fillRect(postRightX - postW / 2, netEdge.y - netH - 4, postW, netH + 18);

      // Net Mesh (Semi-transparent grid texture)
      ctx.fillStyle = 'rgba(230, 235, 245, 0.35)';
      ctx.beginPath();
      ctx.moveTo(postLeftX, netEdge.y - netH);
      ctx.lineTo(postRightX, netEdge.y - netH);
      ctx.lineTo(tableGeom.cx + netEdge.halfW, netEdge.y);
      ctx.lineTo(tableGeom.cx - netEdge.halfW, netEdge.y);
      ctx.closePath();
      ctx.fill();

      // Net grid vertical mesh cords
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      const meshColumns = 38;
      const netSpan = postRightX - postLeftX;
      for (let i = 1; i < meshColumns; i++) {
        const frac = i / meshColumns;
        const topX = postLeftX + netSpan * frac;
        const bottomX = (tableGeom.cx - netEdge.halfW) + (netEdge.halfW * 2) * frac;
        ctx.beginPath();
        ctx.moveTo(topX, netEdge.y - netH);
        ctx.lineTo(bottomX, netEdge.y);
        ctx.stroke();
      }

      // Net horizontal mesh cords
      const meshRows = 5;
      for (let j = 1; j <= meshRows; j++) {
        const frac = j / (meshRows + 1);
        const curY = (netEdge.y - netH) + netH * frac;
        ctx.beginPath();
        ctx.moveTo(postLeftX, curY);
        ctx.lineTo(postRightX, curY);
        ctx.stroke();
      }

      // White reinforced Net Top Tape (Crisp binding band)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(postLeftX, netEdge.y - netH);
      ctx.lineTo(postRightX, netEdge.y - netH);
      ctx.stroke();
    };

    const drawPaddle = (lateral: number, depth: number, isPlayer: boolean, tiltAngle: number) => {
      const gs = gameStateRef.current;
      const { x, y } = worldToScreen(depth, lateral);
      const scale = 0.46 + depth * 0.88; // 3D scaling
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.rotate(tiltAngle);

      // Paddle Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(5, 22, 28, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wooden Handle with flared contours
      const handleGrad = ctx.createLinearGradient(-10, 10, 10, 52);
      handleGrad.addColorStop(0, '#8d5524');
      handleGrad.addColorStop(0.5, '#d49b6a');
      handleGrad.addColorStop(1, '#5c3317');
      ctx.fillStyle = handleGrad;
      ctx.beginPath();
      ctx.moveTo(-7, 8);
      ctx.lineTo(7, 8);
      ctx.lineTo(10, 48);
      ctx.lineTo(-10, 48);
      ctx.closePath();
      ctx.fill();

      // Grip Stripe on Handle
      ctx.strokeStyle = '#2b1708';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-1, 8);
      ctx.lineTo(-1, 48);
      ctx.stroke();

      // Multi-ply Wood Blade Edge (Subtle bevel ring around rubber)
      ctx.beginPath();
      ctx.ellipse(0, -12, 34, 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#edd2a4';
      ctx.fill();
      ctx.strokeStyle = '#8a5d3b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // High-friction Rubber Face
      const rubberGrad = ctx.createRadialGradient(-8, -20, 4, 0, -12, 32);
      if (isPlayer) {
        // Player's selected rubber color: blue, green, or purple
        const colorKey = gs.playerPaddleColor || 'blue';
        const colorCfg = PADDLE_COLOR_CONFIG[colorKey] || PADDLE_COLOR_CONFIG.blue;
        rubberGrad.addColorStop(0, colorCfg.light);
        rubberGrad.addColorStop(0.68, colorCfg.mid);
        rubberGrad.addColorStop(1, colorCfg.dark);
      } else {
        // Black high-tension rubber face for CPU
        rubberGrad.addColorStop(0, '#475569');
        rubberGrad.addColorStop(0.65, '#1e293b');
        rubberGrad.addColorStop(1, '#0f172a');
      }

      ctx.beginPath();
      ctx.ellipse(0, -12, 31, 27, 0, 0, Math.PI * 2);
      ctx.fillStyle = rubberGrad;
      ctx.fill();

      // Rubber Face Specular Gloss Arc Highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -14, 25, Math.PI * 1.05, Math.PI * 1.85);
      ctx.stroke();

      ctx.restore();
    };

    const drawBall = () => {
      const gs = gameStateRef.current;
      const ball = gs.ball;
      if (!ball) return;

      const { x: sx, y: sy } = worldToScreen(ball.depth, ball.lateral);
      const scale = 0.45 + ball.depth * 0.85;
      const baseR = 10 * scale;

      // 1. Dynamic Surface Shadow beneath ball
      // Shadow scales wider and fades as ball.z increases
      const shadowW = baseR * (1 + ball.z * 0.016);
      const shadowH = (baseR * 0.48) * (1 + ball.z * 0.016);
      const shadowAlpha = Math.max(0.08, 0.58 - ball.z * 0.007);

      const shadowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, shadowW);
      shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`);
      shadowGrad.addColorStop(0.6, `rgba(0, 0, 0, ${shadowAlpha * 0.45})`);
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Glossy Surface Inverted Reflection
      if (ball.z > 0 && ball.depth >= 0.02 && ball.depth <= 0.98) {
        const reflectY = sy + ball.z * 0.65;
        const reflectAlpha = Math.max(0, 0.22 * (1 - ball.z / 85));
        if (reflectAlpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = reflectAlpha;
          ctx.beginPath();
          ctx.ellipse(sx, reflectY, baseR * 0.9, baseR * 0.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffeedb';
          ctx.fill();
          ctx.restore();
        }
      }

      // 3. Motion Blur Trail
      if (gs.trail.length > 1) {
        ctx.save();
        for (let i = 0; i < gs.trail.length; i++) {
          const pt = gs.trail[i];
          const trAlpha = (pt.alpha * (1 - i / gs.trail.length)) * 0.6;
          const trR = pt.r * (1 - i * 0.04);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(2, trR), 0, Math.PI * 2);
          ctx.fillStyle = pt.smash
            ? `rgba(255, 87, 34, ${trAlpha})`
            : `rgba(255, 235, 140, ${trAlpha})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // 4. 3D Ball Sphere (Screen coordinates: sy - ball.z)
      const ballY = sy - ball.z;
      ctx.save();

      // Ball Outer Glow if power smash
      if (ball.smash) {
        ctx.shadowColor = '#ff5722';
        ctx.shadowBlur = 18;
      }

      // 3D Spherical Radial Gradient
      const lightOffsetX = sx - baseR * 0.32;
      const lightOffsetY = ballY - baseR * 0.35;
      const ballGrad = ctx.createRadialGradient(
        lightOffsetX,
        lightOffsetY,
        baseR * 0.1,
        sx,
        ballY,
        baseR
      );
      // Premium warm 3-star celluloid tournament ball
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.3, '#fff4cb');
      ballGrad.addColorStop(0.8, '#f59e0b');
      ballGrad.addColorStop(1, '#b45309');

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(sx, ballY, baseR, 0, Math.PI * 2);
      ctx.fill();

      // Spinning Ball Seam / ITTF 3-Star Mark rotating with ball rotation
      ctx.save();
      ctx.translate(sx, ballY);
      ctx.rotate(ball.rotation * 0.05);
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 0.68, 0, Math.PI * 1.1);
      ctx.stroke();

      // Subtle star imprint
      ctx.fillStyle = 'rgba(180, 83, 9, 0.45)';
      ctx.beginPath();
      ctx.arc(baseR * 0.25, 0, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    const drawParticles = () => {
      const gs = gameStateRef.current;
      for (const p of gs.sparks) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawFloatTexts = () => {
      const gs = gameStateRef.current;
      for (const ft of gs.floatTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `900 ${Math.round(20 * ft.scale)}px "Montserrat", "Arial Black", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    };

    const drawArenaLighting = () => {
      // Stadium Vignette & Ambient Radial Light
      const vigGrad = ctx.createRadialGradient(
        CANVAS_W / 2,
        CANVAS_H * 0.45,
        180,
        CANVAS_W / 2,
        CANVAS_H * 0.5,
        CANVAS_H * 0.95
      );
      vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vigGrad.addColorStop(0.7, 'rgba(3, 10, 22, 0.45)');
      vigGrad.addColorStop(1, 'rgba(1, 4, 10, 0.85)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    };

    // Render loop
    const render = () => {
      updateAI();
      updatePhysics();

      const gs = gameStateRef.current;
      ctx.save();

      // Apply camera shake if active
      if (gs.shakeMag > 0) {
        ctx.translate(gs.shakeX, gs.shakeY);
      }

      ctx.clearRect(-20, -20, CANVAS_W + 40, CANVAS_H + 40);

      // Draw World
      drawTable();

      // Draw CPU Paddle (Far, depth ~0.06)
      drawPaddle(gs.aiLateral, 0.05, false, gs.aiTilt);

      // Draw Ball & Player Paddle with 3D depth-sorting (paddle can be near net or baseline)
      if (gs.ball && gs.paddleDepth < gs.ball.depth) {
        drawPaddle(gs.paddleLateral, gs.paddleDepth, true, gs.paddleTilt);
        drawBall();
      } else {
        drawBall();
        drawPaddle(gs.paddleLateral, gs.paddleDepth, true, gs.paddleTilt);
      }

      // Draw Particle FX & Floats
      drawParticles();
      drawFloatTexts();

      // Arena Lighting / Atmospheric vignette
      drawArenaLighting();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [addCameraShake, addFloatText, handlePointScored, spawnHitSparks, tableEdgeAt, tableGeom.bottomY, tableGeom.cx, tableGeom.thickness, tableGeom.topY, worldToScreen]);

  return (
    <div
      id="pingpong-app"
      className="relative w-screen h-screen overflow-hidden select-none bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center font-sans"
    >
      {/* Background Arena Spotlight */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.25)_0%,transparent_70%)]" />

      {/* Top Glassmorphism HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl z-20 flex items-center justify-between px-6 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Player Side */}
        <div
          id="scoreboard-player-container"
          key={`player-score-container-${playerScore}`}
          className={`flex items-center gap-3 ${playerScore > 0 ? 'animate-container-shake' : ''}`}
        >
          <div className="relative">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-lg transition-all duration-300 ${PADDLE_COLOR_CONFIG[playerPaddleColor].avatarClass}`}>
              YOU
            </div>
            {server === 'player' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-900 animate-pulse" title="Serving" />
            )}
          </div>
          <div
            id="scoreboard-player-score-box"
            key={`player-score-box-${playerScore}`}
            className={`flex flex-col scoreboard-player-bloom ${
              playerScore > 0 ? 'animate-score-box-bloom' : ''
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">Player</span>
              <span className={`w-2 h-2 rounded-full shadow-sm ${PADDLE_COLOR_CONFIG[playerPaddleColor].dotColorClass}`} />
            </div>
            <span
              id="scoreboard-player-score"
              key={`player-score-${playerScore}`}
              className={`text-3xl font-black tabular-nums leading-none drop-shadow origin-left inline-block transition-colors ${
                playerScore > 0 ? 'animate-score-zoom-player text-amber-300' : 'text-white'
              }`}
            >
              {playerScore}
            </span>
          </div>
        </div>

        {/* Center Match Status & Rally Badge */}
        <div className="flex flex-col items-center gap-1">
          {/* Rally counter */}
          <div
            className={`flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ${
              rallyCount >= 10
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-rose-900/50 scale-110 animate-bounce'
                : rallyCount >= 5
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-white/5 text-slate-300 border border-white/10'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${rallyCount >= 10 ? 'text-white' : 'text-amber-400'}`} />
            <span>RALLY {rallyCount}</span>
          </div>

          <div className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">
            First to {WINNING_SCORE} • Win by 2
          </div>
        </div>

        {/* CPU Side */}
        <div
          id="scoreboard-cpu-container"
          key={`cpu-score-container-${cpuScore}`}
          className={`flex items-center gap-3 ${cpuScore > 0 ? 'animate-container-shake' : ''}`}
        >
          <div id="scoreboard-cpu-score-box" className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold">CPU</span>
            <span
              id="scoreboard-cpu-score"
              key={`cpu-score-${cpuScore}`}
              className={`text-3xl font-black tabular-nums leading-none drop-shadow origin-right inline-block transition-colors ${
                cpuScore > 0 ? 'animate-score-zoom-cpu text-rose-400' : 'text-white'
              }`}
            >
              {cpuScore}
            </span>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-red-800 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-900/40">
              CPU
            </div>
            {server === 'cpu' && (
              <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-900 animate-pulse" title="Serving" />
            )}
          </div>
        </div>

        {/* Control Tools */}
        <div className="flex items-center gap-2 pl-3 ml-2 border-l border-white/10">
          <button
            id="btn-sound-toggle"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            id="btn-restart-game"
            onClick={startNewMatch}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
            title="Restart Match (Rolls new random paddle color)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Chips (Difficulty & Random Match Paddle Color) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 text-xs shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 mr-1 font-medium">Difficulty:</span>
          {(['casual', 'pro', 'master'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyMode(d)}
              className={`px-2.5 py-0.5 rounded-lg capitalize font-medium transition ${
                difficulty === d
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="h-3.5 w-px bg-white/15" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            Bat Color:
          </span>
          {PADDLE_COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => {
                gameStateRef.current.playerPaddleColor = c;
                setPlayerPaddleColor(c);
              }}
              title={`Switch to ${PADDLE_COLOR_CONFIG[c].name}`}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg capitalize font-medium transition ${
                playerPaddleColor === c
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${PADDLE_COLOR_CONFIG[c].dotColorClass}`} />
              <span>{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div
        id="canvas-container"
        className={`relative w-full h-full max-w-6xl max-h-[88vh] flex items-center justify-center p-2 touch-none select-none ${
          screenShakeActive ? 'animate-screen-shake' : ''
        }`}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onPointerMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-full object-contain cursor-crosshair rounded-2xl shadow-2xl"
        />

        {/* Serve / In-game Notification Banner */}
        {serving && bannerMessage && !gameOver && (
          <div
            id="serve-prompt"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center text-center px-8 py-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="text-2xl font-black tracking-tight text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
              {bannerMessage.text}
            </div>
            <div className="text-sm font-medium text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <Play className="w-4 h-4 fill-emerald-400" />
              {bannerMessage.sub}
            </div>
          </div>
        )}

        {/* Match Over Modal */}
        {gameOver && (
          <div
            id="gameover-modal"
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300"
          >
            <div className="relative w-full max-w-md bg-slate-900/90 border border-white/15 rounded-3xl p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl ${
                  gameOver === 'player'
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-tr from-rose-600 to-red-400 text-white shadow-rose-600/30'
                }`}
              >
                {gameOver === 'player' ? <Trophy className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
              </div>

              <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                {gameOver === 'player' ? 'MATCH VICTORY!' : 'DEFEAT'}
              </h2>
              <p className="text-sm text-slate-300 mb-6">
                {gameOver === 'player'
                  ? 'Sensational table tennis mastery! You crushed the CPU.'
                  : 'The CPU took the match. Practice your curve spin and strike back!'}
              </p>

              {/* Match Stats Grid */}
              <div className="w-full grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 text-center">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Final</div>
                  <div className="text-lg font-black text-white">{playerScore} - {cpuScore}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Longest</div>
                  <div className="text-lg font-black text-amber-400">{bestRally} hits</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Smashes</div>
                  <div className="text-lg font-black text-rose-400">{totalSmashes}</div>
                </div>
              </div>

              <button
                id="btn-play-again"
                onClick={startNewMatch}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Play Next Match
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Info Banner */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-[12px] text-slate-400 pointer-events-none flex items-center gap-4 bg-slate-900/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
        <span>Random Match Paddle Colors (Blue, Green, Purple)</span>
        <span>•</span>
        <span>Free Bat Movement</span>
        <span>•</span>
        <span>Swipe Fast: Curve & Spin</span>
      </div>
    </div>
  );
}
