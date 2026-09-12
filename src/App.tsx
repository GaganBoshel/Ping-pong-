/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Award,
  Bot,
  Check,
  Copy,
  Flame,
  Link2,
  Palette,
  Play,
  RotateCcw,
  Share2,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from 'lucide-react';
import jungleCourtBg from './assets/images/jungle_court_bg_1789000821397.jpg';

// ==========================================
// PROCEDURAL SOUND SYNTHESIZER (Web Audio API)
// ==========================================
class SoundSynth {
  private ctx: AudioContext | null = null;
  public muted = false;

  public init(): void {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ??
        (window as Window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }

    if (this.ctx?.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined);
    }
  }

  public paddleHit(power = 1.0): void {
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

  public tableBounce(power = 1.0): void {
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

  public netHit(): void {
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

  public pointScore(isPlayer: boolean): void {
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

  public matchPoint(): void {
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

  public victory(): void {
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

  public defeat(): void {
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

  public whoosh(): void {
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
    name: 'Jungle Emerald',
    light: '#86efac',
    mid: '#22c55e',
    dark: '#15803d',
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

export const createInitialBall = (servedBy: 'player' | 'cpu' = 'player'): BallState => {
  const startDepth = servedBy === 'player' ? 0.92 : 0.06;
  const dir = servedBy === 'player' ? -1 : 1;
  return {
    depth: startDepth,
    lateral: 0,
    vDepth: dir * 0.011,
    vLateral: 0,
    z: 26,
    vz: 3.6,
    spinLateral: 0,
    rotation: 0,
    tableBounces: 0,
    lastHitter: servedBy,
    smash: false,
  };
};

export default function App() {
  const totalSmashes = 0;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Default to vibrant Jungle Emerald paddle color as seen in the reference image
  const [playerPaddleColor, setPlayerPaddleColor] = useState<PaddleColor>('green');

  // Game Mode & Multiplayer State
  const [gameMode, setGameMode] = useState<'cpu' | 'friend'>('cpu');
  const [friendRoomId, setFriendRoomId] = useState<string | null>(null);
  const [multiplayerStatus, setMultiplayerStatus] = useState<
    'idle' | 'connecting' | 'waiting' | 'connected' | 'disconnected'
  >('idle');
  const [multiplayerRole, setMultiplayerRole] = useState<'p1' | 'p2' | null>(null);
  const [opponentPaddleColor, setOpponentPaddleColor] = useState<PaddleColor>('blue');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const lastPaddleSendTime = useRef<number>(0);

  // Game UI State
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [serving, setServing] = useState(true);
  const [server, setServer] = useState<'player' | 'cpu'>('player');
  const [rallyCount, setRallyCount] = useState(0);
  const [bestRally, setBestRally] = useState(0);
  const [totalFastHits, setTotalFastHits] = useState(0);
  const [muted, setMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('pro');
  const [bannerMessage, setBannerMessage] = useState<{ text: string; sub: string } | null>({
    text: 'Ping Pong 3D',
    sub: 'Click or Tap to Serve (Move bat for Fast Serve ⚡)',
  });
  const [gameOver, setGameOver] = useState<'player' | 'cpu' | null>(null);
  const [screenShakeActive, setScreenShakeActive] = useState(false);
  const shakeTimerRef = useRef<number | null>(null);
  const cpuServeTimerRef = useRef<number | null>(null);

  // Game logic refs to avoid frame tearing
  const gameStateRef = useRef({
    gameMode: 'cpu' as 'cpu' | 'friend',
    multiplayerRole: null as 'p1' | 'p2' | null,
    aiDepth: 0.05,
    opponentPaddleColor: 'blue' as PaddleColor,
    playerScore: 0,
    cpuScore: 0,
    playerPaddleColor,
    serving: true,
    server: 'player' as 'player' | 'cpu',
    rallyCount: 0,
    bestRally: 0,
    totalFastHits: 0,
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
    swingVx: 0,

    // Fast strike & stroke speed tracking
    recentStrikeSpeed: 0,
    strokeDistance: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerTime: 0,

    // Tilt angles for 3D realism
    paddleTilt: 0,
    aiTilt: 0,

    // Ball initialized immediately so user doesn't have to restart match
    ball: createInitialBall('player') as BallState | null,
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
    const halfW = Math.max(20, tableGeom.topHalfW + (tableGeom.bottomHalfW - tableGeom.topHalfW) * depth);
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

  // CPU Serve execution: both player and CPU can perform fast serves
  const triggerCpuServe = useCallback(() => {
    if (cpuServeTimerRef.current) {
      window.clearTimeout(cpuServeTimerRef.current);
    }
    cpuServeTimerRef.current = window.setTimeout(() => {
      const gs = gameStateRef.current;
      if (gs.serving && gs.server === 'cpu' && !gs.gameOver && gs.ball) {
        gs.serving = false;
        setServing(false);
        setBannerMessage(null);

        // Fast serve capability for CPU (~45% chance)
        const isCpuFastServe = Math.random() < 0.45;
        const cpuServeSpeed = isCpuFastServe
          ? 0.023 + Math.random() * 0.005 // 0.023 - 0.028 fast serve
          : 0.011 + Math.random() * 0.002; // standard serve

        gs.ball.vDepth = cpuServeSpeed;
        gs.ball.vLateral = (Math.random() - 0.5) * (isCpuFastServe ? 0.012 : 0.006);
        gs.ball.vz = isCpuFastServe ? 2.5 : 3.6;
        gs.ball.tableBounces = 0;
        gs.ball.lastHitter = 'cpu';
        gs.ball.smash = isCpuFastServe;

        sound.paddleHit(isCpuFastServe ? 1.6 : 1.0);
        const pos = worldToScreen(gs.ball.depth, gs.ball.lateral);
        spawnHitSparks(pos.x, pos.y - gs.ball.z, isCpuFastServe ? 24 : 14, 'warm');

        if (isCpuFastServe) {
          sound.whoosh();
          addCameraShake(3);
          addFloatText('CPU FAST SERVE! ⚡', pos.x, pos.y - gs.ball.z - 25, '#fb923c');
        }
      }
      cpuServeTimerRef.current = null;
    }, 1100);
  }, [addCameraShake, addFloatText, spawnHitSparks, worldToScreen]);

  // Reset for next serve
  const resetServe = useCallback((nextServer: 'player' | 'cpu', msg?: string, subMsg = 'Click or Tap to Serve') => {
    if (cpuServeTimerRef.current) {
      window.clearTimeout(cpuServeTimerRef.current);
      cpuServeTimerRef.current = null;
    }
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

    // Auto-launch CPU serve if CPU is serving
    if (nextServer === 'cpu' && gs.gameMode === 'cpu') {
      triggerCpuServe();
    }
  }, [createBall, triggerCpuServe]);

  // Scoring logic with Match Point & Deuce Detection
  const handlePointScored = useCallback((winner: 'player' | 'cpu') => {
    const gs = gameStateRef.current;
    if (gs.gameOver) return;

    // In Friend Multiplayer mode, report to server for authoritative scoring
    if (gs.gameMode === 'friend' && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'point_scored',
          winnerRole: winner === 'player' ? 'self' : 'opponent',
          reason: winner === 'player' ? 'Player scored' : 'Opponent scored',
        })
      );
      gs.ball = null;
      return;
    }

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

    resetServe(
      nextServer,
      banner,
      nextServer === 'player'
        ? 'Your Serve — Click / Tap (Move bat for Fast Serve ⚡)'
        : 'CPU Serve Incoming...'
    );
  }, [addCameraShake, resetServe]);

  // Restart complete match
  const startNewMatch = useCallback(() => {
    const gs = gameStateRef.current;

    // In Friend multiplayer, signal rematch to the room
    if (gs.gameMode === 'friend' && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'restart_match' }));
      return;
    }

    gs.playerScore = 0;
    gs.cpuScore = 0;
    gs.rallyCount = 0;
    gs.bestRally = 0;
    gs.totalFastHits = 0;
    gs.gameOver = null;
    gs.serveCounter = 0;

    if (shakeTimerRef.current) {
      window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
    if (cpuServeTimerRef.current) {
      window.clearTimeout(cpuServeTimerRef.current);
      cpuServeTimerRef.current = null;
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
    setTotalFastHits(0);
    setGameOver(null);

    resetServe('player', 'Ping Pong 3D', 'Click or Tap to Serve (Move bat for Fast Serve ⚡)');
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
    const deltaLateral = gs.paddleLateral - gs.prevPaddleLateral;
    gs.paddleVx = deltaLateral;

    // Track active swing direction (Swing Left = negative, Swing Right = positive)
    if (Math.abs(deltaLateral) > 0.001) {
      gs.swingVx = deltaLateral * 0.75 + (gs.swingVx || 0) * 0.25;
    }

    // Track stroke velocity and stroke travel distance
    const latSpeed = Math.abs(gs.paddleVx);
    const depthSpeed = Math.abs(gs.paddleVy || 0);
    // Forward drive bonus: pushing paddle forward towards net (paddleVy < 0) adds strong forward momentum
    const forwardDriveBonus = (gs.paddleVy || 0) < 0 ? Math.abs(gs.paddleVy || 0) * 2.2 : 0;
    const instantStrike = Math.hypot(latSpeed * 1.25, (depthSpeed + forwardDriveBonus) * 1.5);
    gs.recentStrikeSpeed = Math.max((gs.recentStrikeSpeed || 0) * 0.85, instantStrike);

    // Track stroke travel distance (wind-up & swing sweep distance)
    const moveDist = Math.hypot(
      gs.paddleVx * 1.6,
      (gs.paddleVy || 0) * 2.8
    );
    gs.strokeDistance = Math.min(2.5, (gs.strokeDistance || 0) + moveDist);

    // Broadcast paddle position in friend multiplayer
    if (gs.gameMode === 'friend' && wsRef.current?.readyState === WebSocket.OPEN) {
      const now = performance.now();
      if (now - lastPaddleSendTime.current >= 16) {
        lastPaddleSendTime.current = now;
        wsRef.current.send(
          JSON.stringify({
            type: 'paddle_move',
            lateral: gs.paddleLateral,
            depth: gs.paddleDepth,
            paddleVx: gs.paddleVx,
            paddleVy: gs.paddleVy,
            paddleTilt: gs.paddleTilt,
          })
        );
      }
    }
  }, [tableEdgeAt, tableGeom.bottomY, tableGeom.cx, tableGeom.topY]);

  const handlePointerDown = useCallback(() => {
    sound.init();
    const gs = gameStateRef.current;
    if (gs.gameOver) return;

    // In friend mode, only the designated server can serve
    if (gs.gameMode === 'friend' && gs.server !== 'player') {
      return;
    }

    if (gs.serving || !gs.ball) {
      if (!gs.ball) {
        gs.ball = createBall(gs.server || 'player');
      }
      gs.serving = false;
      setServing(false);
      setBannerMessage(null);
      sound.paddleHit(1.2);

      // Fast serve detection based on current paddle stroke velocity & swing distance
      const strikeSpeed = Math.max(
        Math.hypot(gs.paddleVx, gs.paddleVy || 0),
        gs.recentStrikeSpeed || 0
      );
      const strokeDist = gs.strokeDistance || 0;
      const forwardDrive = Math.max(0, -(gs.paddleVy || 0));
      const isFastServe = strikeSpeed > 0.009 || strokeDist > 0.15 || forwardDrive > 0.003 || gs.paddleDepth > 0.96;
      const serveSpeed = isFastServe
        ? Math.max(0.024, Math.min(0.032, 0.022 + strikeSpeed * 0.38 + strokeDist * 0.015))
        : 0.0125;

      gs.ball.vDepth = -serveSpeed;

      // Active serve swing direction: Swing Left -> ball serves Left, Swing Right -> ball serves Right
      const activeServeSwing = Math.abs(gs.paddleVx) > Math.abs(gs.swingVx || 0)
        ? gs.paddleVx
        : (gs.swingVx || 0);

      if (Math.abs(activeServeSwing) > 0.002) {
        const serveSign = Math.sign(activeServeSwing);
        gs.ball.vLateral = serveSign * Math.min(0.020, Math.max(0.006, Math.abs(activeServeSwing) * 1.15));
        gs.ball.spinLateral = Math.max(-2.5, Math.min(2.5, activeServeSwing * 60));
      } else {
        gs.ball.vLateral = (gs.paddleLateral || 0) * -0.004;
        gs.ball.spinLateral = 0;
      }

      gs.ball.vz = isFastServe ? 2.5 : 3.6;
      gs.ball.tableBounces = 0;
      gs.ball.lastHitter = 'player';
      gs.ball.smash = isFastServe;

      sound.paddleHit(isFastServe ? 1.6 : 1.2);
      const pos = worldToScreen(gs.ball.depth, gs.ball.lateral);
      spawnHitSparks(pos.x, pos.y - gs.ball.z, isFastServe ? 26 : 14, gs.playerPaddleColor);
      if (isFastServe) {
        sound.whoosh();
        addCameraShake(3);
        addFloatText('FAST SERVE! ⚡', pos.x, pos.y - gs.ball.z - 25, '#38bdf8');
        gs.totalFastHits = (gs.totalFastHits || 0) + 1;
        setTotalFastHits(gs.totalFastHits);
      }

      // Transmit serve to opponent in friend multiplayer mode
      if (gs.gameMode === 'friend' && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'serve',
            ball: {
              depth: gs.ball.depth,
              lateral: gs.ball.lateral,
              z: gs.ball.z,
              vDepth: gs.ball.vDepth,
              vLateral: gs.ball.vLateral,
              vz: gs.ball.vz,
              spinLateral: gs.ball.spinLateral,
              smash: gs.ball.smash,
            },
          })
        );
      }
    }
  }, [addCameraShake, addFloatText, createBall, spawnHitSparks, worldToScreen]);

  // ==========================================
  // REAL-TIME MULTIPLAYER WEBSOCKET CONNECTION
  // ==========================================
  const connectMultiplayer = useCallback(
    (roomId: string, paddleColor: PaddleColor) => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (_) {}
        wsRef.current = null;
      }

      setMultiplayerStatus('connecting');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'join',
            roomId,
            paddleColor,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const gs = gameStateRef.current;

          switch (msg.type) {
            case 'joined': {
              setMultiplayerRole(msg.role);
              gs.multiplayerRole = msg.role;
              if (msg.waitingForOpponent) {
                setMultiplayerStatus('waiting');
                setBannerMessage({
                  text: 'Waiting for Friend...',
                  sub: 'Share invite link! Once opened, they join as your opponent.',
                });
              } else {
                setMultiplayerStatus('connected');
                if (msg.opponentColor) {
                  setOpponentPaddleColor(msg.opponentColor);
                  gs.opponentPaddleColor = msg.opponentColor;
                }
              }
              break;
            }

            case 'opponent_joined': {
              setMultiplayerStatus('connected');
              if (msg.opponentColor) {
                setOpponentPaddleColor(msg.opponentColor);
                gs.opponentPaddleColor = msg.opponentColor;
              }
              sound.victory();
              addFloatText('OPPONENT JOINED! 🏓', CANVAS_W / 2, 280, '#4ade80');
              break;
            }

            case 'match_ready': {
              setMultiplayerStatus('connected');
              if (msg.p1Color && msg.p2Color) {
                const oppColor = gs.multiplayerRole === 'p1' ? msg.p2Color : msg.p1Color;
                setOpponentPaddleColor(oppColor);
                gs.opponentPaddleColor = oppColor;
              }

              const isMyServe =
                (gs.multiplayerRole === 'p1' && msg.serverRole === 'p1') ||
                (gs.multiplayerRole === 'p2' && msg.serverRole === 'p2');
              const nextServer = isMyServe ? 'player' : 'cpu';

              gs.playerScore = 0;
              gs.cpuScore = 0;
              gs.rallyCount = 0;
              gs.gameOver = null;
              setPlayerScore(0);
              setCpuScore(0);
              setRallyCount(0);
              setGameOver(null);

              resetServe(
                nextServer,
                'Match Ready! 🏓',
                isMyServe ? 'Your Serve! Click or Tap to Serve' : 'Waiting for Friend to Serve...'
              );
              break;
            }

            case 'opponent_paddle': {
              gs.aiLateral = msg.lateral;
              gs.aiDepth = msg.depth;
              gs.aiVx = msg.paddleVx;
              gs.aiTilt = msg.paddleTilt;
              break;
            }

            case 'ball_hit': {
              const incomingBall = msg.ball;
              if (!gs.ball) {
                gs.ball = createBall('cpu');
              }
              gs.ball.depth = incomingBall.depth;
              gs.ball.lateral = incomingBall.lateral;
              gs.ball.z = incomingBall.z;
              gs.ball.vDepth = incomingBall.vDepth;
              gs.ball.vLateral = incomingBall.vLateral;
              gs.ball.vz = incomingBall.vz;
              gs.ball.spinLateral = incomingBall.spinLateral;
              gs.ball.smash = incomingBall.smash;
              gs.ball.tableBounces = 0;
              gs.ball.lastHitter = 'cpu';

              sound.paddleHit(incomingBall.smash ? 1.6 : 1.2);
              const pos = worldToScreen(gs.ball.depth, gs.ball.lateral);
              spawnHitSparks(
                pos.x,
                pos.y - gs.ball.z,
                incomingBall.smash ? 24 : 14,
                PADDLE_COLOR_CONFIG[gs.opponentPaddleColor]?.mid || '#38bdf8'
              );
              if (incomingBall.smash) {
                sound.whoosh();
                addCameraShake(3);
                addFloatText('OPPONENT DRIVE! ⚡', pos.x, pos.y - gs.ball.z - 25, '#fb923c');
              }

              gs.rallyCount++;
              setRallyCount(gs.rallyCount);
              if (gs.rallyCount > gs.bestRally) {
                gs.bestRally = gs.rallyCount;
                setBestRally(gs.bestRally);
              }
              break;
            }

            case 'serve': {
              const incomingBall = msg.ball;
              if (!gs.ball) {
                gs.ball = createBall('cpu');
              }
              gs.ball.depth = incomingBall.depth;
              gs.ball.lateral = incomingBall.lateral;
              gs.ball.z = incomingBall.z;
              gs.ball.vDepth = incomingBall.vDepth;
              gs.ball.vLateral = incomingBall.vLateral;
              gs.ball.vz = incomingBall.vz;
              gs.ball.spinLateral = incomingBall.spinLateral;
              gs.ball.smash = incomingBall.smash;
              gs.ball.tableBounces = 0;
              gs.ball.lastHitter = 'cpu';
              gs.serving = false;
              setServing(false);
              setBannerMessage(null);

              sound.paddleHit(incomingBall.smash ? 1.6 : 1.2);
              const pos = worldToScreen(gs.ball.depth, gs.ball.lateral);
              spawnHitSparks(
                pos.x,
                pos.y - gs.ball.z,
                incomingBall.smash ? 24 : 14,
                PADDLE_COLOR_CONFIG[gs.opponentPaddleColor]?.mid || '#38bdf8'
              );
              if (incomingBall.smash) {
                sound.whoosh();
                addCameraShake(3);
                addFloatText('FAST SERVE! ⚡', pos.x, pos.y - gs.ball.z - 25, '#38bdf8');
              }
              break;
            }

            case 'score_update': {
              const isP1 = gs.multiplayerRole === 'p1';
              const newPlayerScore = isP1 ? msg.p1Score : msg.p2Score;
              const newCpuScore = isP1 ? msg.p2Score : msg.p1Score;

              gs.playerScore = newPlayerScore;
              gs.cpuScore = newCpuScore;
              setPlayerScore(newPlayerScore);
              setCpuScore(newCpuScore);

              const isPlayerPoint = isP1 ? msg.pointWinnerRole === 'p1' : msg.pointWinnerRole === 'p2';
              sound.pointScore(isPlayerPoint);
              addCameraShake(8);

              const nextServerIsPlayer = isP1 ? msg.serverRole === 'p1' : msg.serverRole === 'p2';
              const nextServer = nextServerIsPlayer ? 'player' : 'cpu';
              gs.server = nextServer;
              setServer(nextServer);

              if (msg.matchWinner) {
                const isPlayerWin = isP1 ? msg.matchWinner === 'p1' : msg.matchWinner === 'p2';
                gs.gameOver = isPlayerWin ? 'player' : 'cpu';
                setGameOver(gs.gameOver);
                if (isPlayerWin) sound.victory();
                else sound.defeat();
              } else {
                resetServe(
                  nextServer,
                  isPlayerPoint ? 'Point for You! 🏓' : 'Friend Scored! 🏓',
                  nextServer === 'player' ? 'Your Serve! Click or Tap to Serve' : 'Waiting for Friend to Serve...'
                );
              }
              break;
            }

            case 'match_restarted': {
              const isP1 = gs.multiplayerRole === 'p1';
              const nextServerIsPlayer = isP1 ? msg.serverRole === 'p1' : msg.serverRole === 'p2';
              const nextServer = nextServerIsPlayer ? 'player' : 'cpu';

              gs.playerScore = 0;
              gs.cpuScore = 0;
              gs.rallyCount = 0;
              gs.gameOver = null;
              setPlayerScore(0);
              setCpuScore(0);
              setRallyCount(0);
              setGameOver(null);

              resetServe(
                nextServer,
                'Match Restarted! 🏓',
                nextServer === 'player' ? 'Your Serve! Click or Tap to Serve' : 'Waiting for Friend to Serve...'
              );
              break;
            }

            case 'opponent_disconnected': {
              setMultiplayerStatus('disconnected');
              setBannerMessage({
                text: 'Friend Disconnected',
                sub: 'Waiting for opponent to reconnect or share link again',
              });
              break;
            }

            case 'room_full': {
              setMultiplayerStatus('disconnected');
              setBannerMessage({
                text: 'Room is Full',
                sub: 'This match room already has two active players.',
              });
              break;
            }
          }
        } catch (e) {
          console.error('Error handling WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        setMultiplayerStatus((prev) => (prev === 'connected' ? 'disconnected' : prev));
      };
    },
    [addCameraShake, addFloatText, createBall, resetServe, spawnHitSparks, worldToScreen]
  );

  // Switch between Solo vs CPU and Play with Friend
  const switchToFriendMode = useCallback(
    (customRoomId?: string) => {
      const gs = gameStateRef.current;
      gs.gameMode = 'friend';
      setGameMode('friend');

      const roomId = customRoomId || `pong-${Math.random().toString(36).substring(2, 8)}`;
      setFriendRoomId(roomId);

      // Update URL search query without full reload
      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?room=${roomId}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }

      connectMultiplayer(roomId, gs.playerPaddleColor);
    },
    [connectMultiplayer]
  );

  const switchToCpuMode = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }

    const gs = gameStateRef.current;
    gs.gameMode = 'cpu';
    gs.multiplayerRole = null;
    setGameMode('cpu');
    setFriendRoomId(null);
    setMultiplayerStatus('idle');
    setMultiplayerRole(null);

    // Clean URL query
    if (typeof window !== 'undefined') {
      window.history.replaceState({ path: window.location.pathname }, '', window.location.pathname);
    }

    gs.playerScore = 0;
    gs.cpuScore = 0;
    gs.rallyCount = 0;
    gs.gameOver = null;
    setPlayerScore(0);
    setCpuScore(0);
    setRallyCount(0);
    setGameOver(null);

    resetServe('player', 'Ping Pong 3D', 'Click or Tap to Serve (Move bat for Fast Serve ⚡)');
  }, [resetServe]);

  // Copy Invite Link to Clipboard
  const copyInviteLink = useCallback(() => {
    if (!friendRoomId) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${friendRoomId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2400);
      }).catch(() => {
        // Fallback prompt
        window.prompt('Copy invite link:', url);
      });
    } else {
      window.prompt('Copy invite link:', url);
    }
  }, [friendRoomId]);

  // Web Share API support
  const shareInviteLink = useCallback(() => {
    if (!friendRoomId) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${friendRoomId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Play Ping Pong 3D with me!',
        text: 'Join my 3D Ping Pong match! Click to play right in your browser:',
        url,
      }).catch(() => {});
    } else {
      copyInviteLink();
    }
  }, [copyInviteLink, friendRoomId]);

  // On initial mount: check if opening via invite link (?room=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        switchToFriendMode(roomParam);
        return;
      }
    }
    // Default solo serve
    resetServe('player', 'Ping Pong 3D', 'Click or Tap to Serve (Move bat for Fast Serve ⚡)');
  }, [resetServe, switchToFriendMode]);

  // Spacebar and Enter to serve or hit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        handlePointerDown();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePointerDown]);

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
      if (gs.gameMode !== 'cpu') return;
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
      gs.paddleVx *= 0.80;
      gs.swingVx = (gs.swingVx || 0) * 0.92;
      gs.paddleVy = (gs.paddleVy || 0) * 0.80;
      gs.recentStrikeSpeed = (gs.recentStrikeSpeed || 0) * 0.90;
      gs.strokeDistance = (gs.strokeDistance || 0) * 0.88;

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

      // Motion Trail Recording with dynamic length based on speed
      const curScr = worldToScreen(ball.depth, ball.lateral);
      const isUltraFast = ball.smash || Math.abs(ball.vDepth) > 0.022;
      gs.trail.unshift({
        x: curScr.x,
        y: curScr.y - ball.z,
        r: Math.max(2, 9 * (0.45 + ball.depth * 0.85)),
        alpha: isUltraFast ? 0.9 : 0.45,
        smash: isUltraFast,
      });
      if (gs.trail.length > (isUltraFast ? 18 : 8)) {
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
            // Compute strike hardness and speed
            const strikeSpeed = Math.max(
              Math.hypot(gs.paddleVx, gs.paddleVy || 0),
              gs.recentStrikeSpeed || 0
            );
            // Forward drive bonus: pushing paddle forward towards net adds direct offensive force
            const forwardDrive = Math.max(0, -(gs.paddleVy || 0) * 2.2);
            const totalStrikeForce = strikeSpeed + forwardDrive;

            // 1. "on little fasteing the bat make also increase ball speed":
            // Responsive continuous speed boost even for small/subtle bat motions
            const batSpeedBoost = Math.min(0.018, Math.max(0, totalStrikeForce - 0.0025) * 0.65);

            // 2. "using longer distance to shot harder the ball":
            // A. Longer stroke travel distance (wind-up & swing sweep distance)
            const strokeDist = gs.strokeDistance || 0;
            const strokeDistanceBonus = Math.min(0.012, strokeDist * 0.016);
            // B. Longer court distance (hitting from deeper back near the baseline provides greater runway/momentum)
            const courtDepth = gs.paddleDepth || 0.94;
            const courtDistanceBonus = Math.max(0, (courtDepth - 0.72) * 0.016);
            const totalDistanceBonus = strokeDistanceBonus + courtDistanceBonus;

            // 3. "make it happen sometimes":
            // Sweet-spot contact / Crisp lucky strike (~30% chance, or hitting sweet spot center of bat)
            const offsetFromCenter = Math.abs(offset);
            const isSweetSpotZone = offsetFromCenter < paddleHalfW * 0.42;
            const randomSurgeRoll = Math.random() < 0.30;
            const isSweetSpotSurge = isSweetSpotZone || randomSurgeRoll;
            const surgeBonus = isSweetSpotSurge ? (0.0045 + Math.random() * 0.004) : 0;

            // Calculate final shot speed
            // Baseline relaxed rally speed is ~0.0125
            let targetSpeed = 0.0125 + batSpeedBoost + totalDistanceBonus + surgeBonus;

            // Shot classification & speed scaling (Clean fast drives & long shots, no power smash)
            const isLongDistanceDrive = totalDistanceBonus > 0.009;
            const isHardHit = totalStrikeForce > 0.016 || targetSpeed > 0.020;

            if (totalStrikeForce > 0.036) {
              const extraForce = Math.min(0.014, (totalStrikeForce - 0.036) * 0.35);
              targetSpeed = Math.max(targetSpeed, 0.028 + extraForce);
            }

            // Cap at a crisp, exhilarating maximum
            targetSpeed = Math.min(0.038, targetSpeed);

            ball.vDepth = -targetSpeed;

            // Directional swing control: Ball faithfully goes to the side you swing the bat!
            // Swing Left (< 0) -> Ball goes to Left side of table
            // Swing Right (> 0) -> Ball goes to Right side of table
            const activeSwing = Math.abs(gs.paddleVx) > Math.abs(gs.swingVx || 0)
              ? gs.paddleVx
              : (gs.swingVx || 0);

            let swingDirLateral = 0;
            if (Math.abs(activeSwing) > 0.0018) {
              const swingSign = Math.sign(activeSwing);
              const swingPower = Math.min(0.024, Math.abs(activeSwing) * 1.25);
              // Base directional force directly matching the swing direction
              swingDirLateral = swingSign * Math.max(0.006, swingPower);
              // Subtle contact offset nuance (aiming with outer bat edge widens the angle)
              swingDirLateral += offset * 0.010;
              // Guarantee the ball strictly travels toward the side the bat was swung
              if (Math.abs(activeSwing) > 0.004) {
                swingDirLateral = swingSign * Math.max(0.008, Math.abs(swingDirLateral));
              }
            } else {
              // Stationary bat / gentle block hit: direct based on contact point offset
              swingDirLateral = offset * 0.035;
            }

            // Keep within table boundaries to ensure thrilling, playable rallies
            ball.vLateral = Math.max(-0.026, Math.min(0.026, swingDirLateral));

            // Impart Magnus curve spin in the direction of the swing
            const spinAmount = Math.abs(activeSwing) > 0.0018
              ? activeSwing * 75
              : offset * 1.5;
            ball.spinLateral = Math.max(-3.0, Math.min(3.0, spinAmount));

            ball.tableBounces = 0;
            ball.lastHitter = 'player';

            // Relay hit in Friend multiplayer mode
            if (gs.gameMode === 'friend' && wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'ball_hit',
                  ball: {
                    depth: ball.depth,
                    lateral: ball.lateral,
                    z: ball.z,
                    vDepth: ball.vDepth,
                    vLateral: ball.vLateral,
                    vz: ball.vz,
                    spinLateral: ball.spinLateral,
                    smash: ball.smash,
                  },
                })
              );
            }

            const pos = worldToScreen(ball.depth, ball.lateral);
            const isHighSpeed = targetSpeed > 0.020;
            ball.smash = isHighSpeed;

            if (isHighSpeed) {
              gs.totalFastHits = (gs.totalFastHits || 0) + 1;
              setTotalFastHits(gs.totalFastHits);
            }

            if (isLongDistanceDrive) {
              ball.vz = 2.4;
              sound.whoosh();
              sound.paddleHit(1.6);
              addCameraShake(4);
              addFloatText('LONG DRIVE! 🎯', pos.x, pos.y - ball.z - 30, '#a855f7');
              spawnHitSparks(pos.x, pos.y - ball.z, 26, gs.playerPaddleColor);
            } else if (isSweetSpotSurge && (batSpeedBoost > 0.003 || totalStrikeForce > 0.008)) {
              ball.vz = 2.5;
              sound.whoosh();
              sound.paddleHit(1.5);
              addCameraShake(3);
              addFloatText('SWEET SPOT! ✨', pos.x, pos.y - ball.z - 30, '#facc15');
              spawnHitSparks(pos.x, pos.y - ball.z, 24, '#fef08a');
            } else if (isHardHit) {
              ball.vz = 2.5; // Low, penetrating fast drive
              sound.whoosh();
              sound.paddleHit(1.5);
              addCameraShake(4);
              addFloatText('FAST DRIVE! ⚡', pos.x, pos.y - ball.z - 30, '#38bdf8');
              spawnHitSparks(pos.x, pos.y - ball.z, 22, gs.playerPaddleColor);
            } else {
              // Standard hit: even gentle hits now scale subtly with bat motion
              ball.vz = 3.5;
              sound.paddleHit(1.0 + batSpeedBoost * 25);
              spawnHitSparks(pos.x, pos.y - ball.z, 14, gs.playerPaddleColor);
              if (batSpeedBoost > 0.003) {
                addFloatText('QUICK HIT! ⚡', pos.x, pos.y - ball.z - 25, '#67e8f9');
              }
            }

            // Rally Increment
            gs.rallyCount++;
            setRallyCount(gs.rallyCount);
            if (gs.rallyCount > gs.bestRally) {
              gs.bestRally = gs.rallyCount;
              setBestRally(gs.bestRally);
            }

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

      // 4. CPU Hit Zone Collision (Only in Solo vs CPU mode)
      if (gs.gameMode === 'cpu' && ball.vDepth < 0 && ball.depth <= AI_HIT_DEPTH) {
        const offset = ball.lateral - gs.aiLateral;
        if (Math.abs(offset) < paddleHalfW + 0.09 && ball.z < 65) {
          // Successful CPU Return with relaxed, controllable speed
          const isAiCounter = ball.z > 35 && Math.random() < 0.30;
          ball.vDepth = Math.max(0.0095, Math.min(0.019, Math.abs(ball.vDepth) * (isAiCounter ? 1.15 : 1.02)));
          ball.vLateral = offset * 0.03 + (Math.random() - 0.5) * 0.008;
          ball.spinLateral = (Math.random() - 0.5) * 1.4;
          ball.vz = isAiCounter ? 2.4 : 3.6;
          ball.tableBounces = 0;
          ball.lastHitter = 'cpu';
          ball.smash = isAiCounter;

          gs.rallyCount++;
          setRallyCount(gs.rallyCount);
          if (gs.rallyCount > gs.bestRally) {
            gs.bestRally = gs.rallyCount;
            setBestRally(gs.bestRally);
          }

          sound.paddleHit(isAiCounter ? 1.4 : 0.9);
          const pos = worldToScreen(ball.depth, ball.lateral);
          spawnHitSparks(pos.x, pos.y - ball.z, isAiCounter ? 22 : 14, 'warm');
          if (isAiCounter) {
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
      const floorR0 = Math.max(10, 100);
      const floorR1 = Math.max(floorR0 + 20, near.halfW * 1.25);
      const floorShadowGrad = ctx.createRadialGradient(
        tableGeom.cx,
        near.y + 35,
        floorR0,
        tableGeom.cx,
        near.y + 45,
        floorR1
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
      // Front face: brushed steel metallic chassis as in reference image!
      const frontGrad = ctx.createLinearGradient(0, near.y, 0, near.y + thick);
      frontGrad.addColorStop(0, '#e2e8f0'); // Crisp light metallic silver top highlight
      frontGrad.addColorStop(0.18, '#94a3b8'); // Brushed steel
      frontGrad.addColorStop(0.55, '#64748b');
      frontGrad.addColorStop(0.9, '#334155');
      frontGrad.addColorStop(1, '#1e293b'); // Dark bottom chassis
      ctx.fillStyle = frontGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - near.halfW, near.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y + thick);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y + thick);
      ctx.closePath();
      ctx.fill();

      // Brushed horizontal metallic streaks/lines across front face (as seen in image.png)
      ctx.save();
      ctx.beginPath();
      ctx.rect(tableGeom.cx - near.halfW, near.y, near.halfW * 2, thick);
      ctx.clip();
      const streaks = [
        { offset: 0.22, color: 'rgba(255, 255, 255, 0.55)', width: 1.2 },
        { offset: 0.38, color: 'rgba(15, 23, 42, 0.35)', width: 1.5 },
        { offset: 0.54, color: 'rgba(255, 255, 255, 0.45)', width: 1.2 },
        { offset: 0.72, color: 'rgba(15, 23, 42, 0.4)', width: 1.5 },
      ];
      for (const s of streaks) {
        const sy = near.y + thick * s.offset;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(tableGeom.cx - near.halfW + 10, sy);
        ctx.lineTo(tableGeom.cx + near.halfW - 10, sy);
        ctx.stroke();
      }
      ctx.restore();

      // Solid outline for front apron
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(tableGeom.cx - near.halfW, near.y, near.halfW * 2, thick);

      // Left side apron in perspective
      const leftApronGrad = ctx.createLinearGradient(
        tableGeom.cx - near.halfW,
        near.y,
        tableGeom.cx - far.halfW,
        far.y
      );
      leftApronGrad.addColorStop(0, '#64748b');
      leftApronGrad.addColorStop(0.5, '#334155');
      leftApronGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = leftApronGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - near.halfW, near.y);
      ctx.lineTo(tableGeom.cx - far.halfW, far.y);
      ctx.lineTo(tableGeom.cx - far.halfW, far.y + thick * 0.65);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y + thick);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Right side apron in perspective
      const rightApronGrad = ctx.createLinearGradient(
        tableGeom.cx + near.halfW,
        near.y,
        tableGeom.cx + far.halfW,
        far.y
      );
      rightApronGrad.addColorStop(0, '#64748b');
      rightApronGrad.addColorStop(0.5, '#334155');
      rightApronGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = rightApronGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y + thick * 0.65);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y + thick);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Vibrant Cerulean / Electric Cyan Table Playing Surface (from reference image!)
      const tableSurfGrad = ctx.createLinearGradient(0, tableGeom.topY, 0, tableGeom.bottomY);
      tableSurfGrad.addColorStop(0, '#00d4ff'); // Vivid electric sky cyan at CPU end
      tableSurfGrad.addColorStop(0.32, '#00aaff');
      tableSurfGrad.addColorStop(0.72, '#0284c7');
      tableSurfGrad.addColorStop(1, '#0369a1'); // Deep cerulean azure at player end
      ctx.fillStyle = tableSurfGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y);
      ctx.closePath();
      ctx.fill();

      // Smooth diagonal gloss reflection sheen
      const sheenGrad = ctx.createLinearGradient(
        tableGeom.cx - 240,
        far.y,
        tableGeom.cx + 280,
        near.y
      );
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
      sheenGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.14)');
      sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.26)');
      sheenGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.1)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y);
      ctx.closePath();
      ctx.fill();

      // 5. Crisp White Regulation Court Lines (from reference image)
      // Perimeter boundary line (clean solid white)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + far.halfW, far.y);
      ctx.lineTo(tableGeom.cx + near.halfW, near.y);
      ctx.lineTo(tableGeom.cx - near.halfW, near.y);
      ctx.closePath();
      ctx.stroke();

      // Center lengthwise dividing stripe
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx, far.y);
      ctx.lineTo(tableGeom.cx, near.y);
      ctx.stroke();

      // 6. Sleek Modern Net (with dark emerald mesh and crisp white top tape, matching image.png)
      const netEdge = tableEdgeAt(0.5);
      const netH = 34; // height in screen pixels
      const postOverhang = 22;

      // Net shadow cast on table
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - netEdge.halfW, netEdge.y);
      ctx.lineTo(tableGeom.cx + netEdge.halfW, netEdge.y);
      ctx.lineTo(tableGeom.cx + netEdge.halfW + 4, netEdge.y + 10);
      ctx.lineTo(tableGeom.cx - netEdge.halfW - 4, netEdge.y + 10);
      ctx.closePath();
      ctx.fill();

      // Net Posts on sides
      const postLeftX = tableGeom.cx - netEdge.halfW - postOverhang;
      const postRightX = tableGeom.cx + netEdge.halfW + postOverhang;
      const postW = 8;

      // Left post bracket
      const postGrad = ctx.createLinearGradient(postLeftX - postW / 2, 0, postLeftX + postW / 2, 0);
      postGrad.addColorStop(0, '#1e293b');
      postGrad.addColorStop(0.4, '#94a3b8');
      postGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = postGrad;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(postLeftX - postW / 2, netEdge.y - netH - 5, postW, netH + 18, 3);
      } else {
        ctx.rect(postLeftX - postW / 2, netEdge.y - netH - 5, postW, netH + 18);
      }
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Right post bracket
      ctx.fillStyle = postGrad;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(postRightX - postW / 2, netEdge.y - netH - 5, postW, netH + 18, 3);
      } else {
        ctx.rect(postRightX - postW / 2, netEdge.y - netH - 5, postW, netH + 18);
      }
      ctx.fill();
      ctx.stroke();

      // Net Body Mesh (Semi-transparent dark emerald/charcoal green mesh as seen in image)
      const netMeshGrad = ctx.createLinearGradient(0, netEdge.y - netH, 0, netEdge.y);
      netMeshGrad.addColorStop(0, 'rgba(15, 45, 28, 0.7)');
      netMeshGrad.addColorStop(0.8, 'rgba(10, 32, 20, 0.65)');
      netMeshGrad.addColorStop(1, 'rgba(6, 20, 12, 0.78)');
      ctx.fillStyle = netMeshGrad;
      ctx.beginPath();
      ctx.moveTo(postLeftX, netEdge.y - netH);
      ctx.lineTo(postRightX, netEdge.y - netH);
      ctx.lineTo(tableGeom.cx + netEdge.halfW, netEdge.y);
      ctx.lineTo(tableGeom.cx - netEdge.halfW, netEdge.y);
      ctx.closePath();
      ctx.fill();

      // Net grid vertical mesh cords
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      const meshColumns = 42;
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
      const meshRows = 6;
      for (let j = 1; j <= meshRows; j++) {
        const frac = j / (meshRows + 1);
        const curY = (netEdge.y - netH) + netH * frac;
        ctx.beginPath();
        ctx.moveTo(postLeftX, curY);
        ctx.lineTo(postRightX, curY);
        ctx.stroke();
      }

      // Bottom tape of net resting on table
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tableGeom.cx - netEdge.halfW, netEdge.y);
      ctx.lineTo(tableGeom.cx + netEdge.halfW, netEdge.y);
      ctx.stroke();

      // Crisp White Reinforced Net Top Tape (Bold white band as seen in reference image)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(postLeftX, netEdge.y - netH);
      ctx.lineTo(postRightX, netEdge.y - netH);
      ctx.stroke();
      ctx.lineCap = 'butt';
    };

    const drawPaddle = (lateral: number, depth: number, isPlayer: boolean, tiltAngle: number) => {
      const gs = gameStateRef.current;
      const { x, y } = worldToScreen(depth, lateral);
      const scale = Math.max(0.2, 0.48 + depth * 0.92); // 3D scaling
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.rotate(tiltAngle);

      // 1. Paddle Dynamic Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.ellipse(4, 26, 32, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Natural Flared Wooden Handle (Amber beech wood tone as in reference image)
      // Ergonomic flared handle contour
      const handleGrad = ctx.createLinearGradient(-10, 8, 10, 52);
      handleGrad.addColorStop(0, '#f59e0b'); // Warm honey maple
      handleGrad.addColorStop(0.3, '#d97706');
      handleGrad.addColorStop(0.7, '#b45309');
      handleGrad.addColorStop(1, '#78350f'); // Deep wood core
      ctx.fillStyle = handleGrad;
      ctx.beginPath();
      // Flared handle curve
      ctx.moveTo(-7.5, 8);
      ctx.quadraticCurveTo(-6, 28, -10.5, 50);
      ctx.quadraticCurveTo(0, 55, 10.5, 50);
      ctx.quadraticCurveTo(6, 28, 7.5, 8);
      ctx.closePath();
      ctx.fill();

      // Ergonomic handle bevel & side wood highlight
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, 12);
      ctx.quadraticCurveTo(-4.8, 28, -8.5, 48);
      ctx.stroke();

      // Center Grip Dark Wood Inlay Stripe
      const inlayGrad = ctx.createLinearGradient(-2.5, 10, 2.5, 50);
      inlayGrad.addColorStop(0, '#78350f');
      inlayGrad.addColorStop(0.5, '#451a03');
      inlayGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = inlayGrad;
      ctx.beginPath();
      ctx.moveTo(-2.5, 11);
      ctx.lineTo(2.5, 11);
      ctx.lineTo(3.2, 49);
      ctx.lineTo(-3.2, 49);
      ctx.closePath();
      ctx.fill();

      // Handle dark contour stroke
      ctx.strokeStyle = '#291807';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7.5, 8);
      ctx.quadraticCurveTo(-6, 28, -10.5, 50);
      ctx.quadraticCurveTo(0, 55, 10.5, 50);
      ctx.quadraticCurveTo(6, 28, 7.5, 8);
      ctx.stroke();

      // Handle bottom butt rounded cap
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(0, 50.5, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wooden blade neck wings (connecting handle seamlessly to blade base)
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.quadraticCurveTo(0, 2, 10, 8);
      ctx.lineTo(8, -4);
      ctx.quadraticCurveTo(0, -6, -8, -4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#291807';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 3. Multi-ply Wood Blade Edge (Subtle outer wooden perimeter)
      ctx.beginPath();
      ctx.ellipse(0, -14, 38, 33, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#edd2a4'; // Natural 5-ply Koto/Ayous wood core
      ctx.fill();
      ctx.strokeStyle = '#291807';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 4. THE ICONIC WHITE / LIGHT CONTRASTING INNER RIM (As featured in the reference image!)
      ctx.beginPath();
      ctx.ellipse(0, -14, 35, 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; // Bright solid white border band
      ctx.fill();
      ctx.strokeStyle = '#18110b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 5. High-Tension Colored Rubber Face
      const rubberGrad = ctx.createRadialGradient(-8, -24, 4, 0, -14, 32);
      if (isPlayer) {
        const colorKey = gs.playerPaddleColor || 'green';
        const colorCfg = PADDLE_COLOR_CONFIG[colorKey] || PADDLE_COLOR_CONFIG.green;
        rubberGrad.addColorStop(0, colorCfg.light);
        rubberGrad.addColorStop(0.55, colorCfg.mid);
        rubberGrad.addColorStop(1, colorCfg.dark);
      } else if (gs.gameMode === 'friend') {
        const colorKey = gs.opponentPaddleColor || opponentPaddleColor || 'blue';
        const colorCfg = PADDLE_COLOR_CONFIG[colorKey] || PADDLE_COLOR_CONFIG.blue;
        rubberGrad.addColorStop(0, colorCfg.light);
        rubberGrad.addColorStop(0.55, colorCfg.mid);
        rubberGrad.addColorStop(1, colorCfg.dark);
      } else {
        // In reference image, CPU paddle has attractive vibrant sky-blue rubber!
        rubberGrad.addColorStop(0, '#38bdf8');
        rubberGrad.addColorStop(0.58, '#0284c7');
        rubberGrad.addColorStop(1, '#0369a1');
      }

      ctx.beginPath();
      ctx.ellipse(0, -14, 31, 26, 0, 0, Math.PI * 2);
      ctx.fillStyle = rubberGrad;
      ctx.fill();

      // 6. ARTISTIC EMBOSSED LEAF / FEATHER CHEVRON TEXTURE (From reference image!)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, -14, 30, 25, 0, 0, Math.PI * 2);
      ctx.clip();

      // Center stem vein
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 9);
      ctx.lineTo(0, -35);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0.8, 9);
      ctx.lineTo(0.8, -35);
      ctx.stroke();

      // Symmetrical curved leaf veins / chevron arches fanning upward and outward
      const leafVeins = [
        { y: 3, w: 18, curve: 11 },
        { y: -5, w: 23, curve: 13 },
        { y: -13, w: 25, curve: 14 },
        { y: -21, w: 21, curve: 12 },
        { y: -29, w: 14, curve: 8 },
      ];

      for (const lv of leafVeins) {
        // Shadow pass
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, lv.y);
        ctx.quadraticCurveTo(-lv.w * 0.45, lv.y + 2, -lv.w, lv.y - lv.curve);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, lv.y);
        ctx.quadraticCurveTo(lv.w * 0.45, lv.y + 2, lv.w, lv.y - lv.curve);
        ctx.stroke();

        // Highlight pass (gives authentic embossed 3D tactile rubber look)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, lv.y - 0.8);
        ctx.quadraticCurveTo(-lv.w * 0.45, lv.y + 1.2, -lv.w, lv.y - lv.curve - 0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, lv.y - 0.8);
        ctx.quadraticCurveTo(lv.w * 0.45, lv.y + 1.2, lv.w, lv.y - lv.curve - 0.8);
        ctx.stroke();
      }

      ctx.restore();

      // 7. Rubber Face Specular Gloss Arc Highlight (Curved light sheen on high-tension polymer)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.52)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, -16, 24, Math.PI * 1.08, Math.PI * 1.82);
      ctx.stroke();

      // Subtle sweet-spot center highlight
      const sweetGrad = ctx.createRadialGradient(-3, -16, 1, -3, -16, 12);
      sweetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      sweetGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sweetGrad;
      ctx.beginPath();
      ctx.arc(-3, -16, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawBall = () => {
      const gs = gameStateRef.current;
      const ball = gs.ball;
      if (!ball) return;

      const { x: sx, y: sy } = worldToScreen(ball.depth, ball.lateral);
      const scale = Math.max(0.2, 0.45 + ball.depth * 0.85);
      const baseR = Math.max(2.5, 10 * scale);
      const safeZ = Math.max(0, ball.z);

      // 1. Dynamic Surface Shadow beneath ball
      // Shadow scales wider and fades as ball.z increases
      const shadowW = Math.max(2, baseR * (1 + safeZ * 0.016));
      const shadowH = Math.max(1, (baseR * 0.48) * (1 + safeZ * 0.016));
      const shadowAlpha = Math.max(0.08, 0.58 - safeZ * 0.007);

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
          ctx.ellipse(sx, reflectY, Math.max(1, baseR * 0.9), Math.max(0.5, baseR * 0.5), 0, 0, Math.PI * 2);
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
          const trR = Math.max(1, pt.r * (1 - i * 0.04));
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(1.5, trR), 0, Math.PI * 2);
          ctx.fillStyle = pt.smash
            ? `rgba(56, 189, 248, ${trAlpha})`
            : `rgba(255, 235, 140, ${trAlpha})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // 4. 3D Ball Sphere (Screen coordinates: sy - ball.z)
      const ballY = sy - ball.z;
      ctx.save();

      // Ball Outer Glow for fast drive / fast serve
      if (ball.smash) {
        ctx.shadowColor = ball.lastHitter === 'player' ? '#38bdf8' : '#fb923c';
        ctx.shadowBlur = 18;
      }

      // 3D Spherical Radial Gradient
      const lightOffsetX = sx - baseR * 0.32;
      const lightOffsetY = ballY - baseR * 0.35;
      const r0 = Math.max(0.1, baseR * 0.1);
      const r1 = Math.max(r0 + 0.5, baseR);
      const ballGrad = ctx.createRadialGradient(
        lightOffsetX,
        lightOffsetY,
        r0,
        sx,
        ballY,
        r1
      );
      // Radiant tournament ball (bright optic gold as in reference image)
      ballGrad.addColorStop(0, '#ffffff'); // Specular glint
      ballGrad.addColorStop(0.2, '#fef9c3'); // Bright light yellow
      ballGrad.addColorStop(0.55, '#facc15'); // Optic tournament gold
      ballGrad.addColorStop(0.85, '#eab308'); // Warm body
      ballGrad.addColorStop(1, '#ca8a04'); // Deep spherical 3D shading

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(sx, ballY, Math.max(1.5, baseR), 0, Math.PI * 2);
      ctx.fill();

      // Spinning Ball Seam / ITTF 3-Star Mark rotating with ball rotation
      ctx.save();
      ctx.translate(sx, ballY);
      ctx.rotate(ball.rotation * 0.05);
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, baseR * 0.68), 0, Math.PI * 1.1);
      ctx.stroke();

      // Subtle star imprint
      ctx.fillStyle = 'rgba(180, 83, 9, 0.45)';
      ctx.beginPath();
      ctx.arc(baseR * 0.25, 0, Math.max(0.5, 1.2 * scale), 0, Math.PI * 2);
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
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
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
      // Atmospheric jungle lighting and soft framing vignette
      const vigGrad = ctx.createRadialGradient(
        CANVAS_W / 2,
        CANVAS_H * 0.48,
        220,
        CANVAS_W / 2,
        CANVAS_H * 0.5,
        CANVAS_H * 0.98
      );
      vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vigGrad.addColorStop(0.7, 'rgba(6, 20, 14, 0.12)');
      vigGrad.addColorStop(1, 'rgba(2, 8, 6, 0.52)');
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

      // Draw CPU or Friend Paddle (Far, depth ~0.06)
      drawPaddle(gs.aiLateral, gs.aiDepth || 0.05, false, gs.aiTilt);

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
      className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 flex items-center justify-center font-sans"
      onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
        // If clicking on UI buttons or settings chips, let those click handlers work
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('#gameover-modal')) return;
        handlePointerDown();
      }}
    >
      {/* Tropical Jungle Background Environment (from reference image) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={jungleCourtBg}
          alt="Jungle Table Tennis Court"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 filter brightness-95 contrast-105"
        />
        {/* Soft tropical sunbeam & vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(74,222,128,0.12)_0%,rgba(6,20,12,0.65)_100%)]" />
      </div>

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
            key={`player-score-box-${playerScore}-${gameOver === 'player' ? 'winner' : 'normal'}`}
            className={`relative flex flex-col px-3.5 py-1.5 rounded-xl border transition-all duration-300 ${
              gameOver === 'player'
                ? 'animate-gold-match-win-flash border-amber-300 text-amber-950 z-20'
                : `scoreboard-player-bloom border-transparent ${
                    playerScore > 0 ? 'animate-score-box-bloom' : ''
                  }`
            }`}
          >
            {/* Distinct Gold Flash Pulse & Light Sweep across the entire container on Match Victory */}
            {gameOver === 'player' && (
              <>
                <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/80 to-transparent -translate-x-full animate-gold-wave-sweep" />
                </div>
                <div className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-[9px] font-black text-slate-950 uppercase tracking-wider shadow-md animate-bounce z-30">
                  MATCH WON!
                </div>
              </>
            )}

            <div className="flex items-center gap-1.5 relative z-10">
              <span className={`text-xs uppercase tracking-wider font-semibold transition-colors ${gameOver === 'player' ? 'text-amber-950 font-black' : 'text-slate-300'}`}>
                Player
              </span>
              <span className={`w-2 h-2 rounded-full shadow-sm ${PADDLE_COLOR_CONFIG[playerPaddleColor].dotColorClass}`} />
            </div>
            <span
              id="scoreboard-player-score"
              key={`player-score-${playerScore}`}
              className={`text-3xl font-black tabular-nums leading-none drop-shadow origin-left inline-block transition-colors relative z-10 ${
                gameOver === 'player'
                  ? 'text-amber-950 drop-shadow-[0_2px_4px_rgba(255,255,255,0.7)]'
                  : playerScore > 0
                  ? 'animate-score-zoom-player text-amber-300'
                  : 'text-white'
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

        {/* CPU or Friend Opponent Side */}
        <div
          id="scoreboard-cpu-container"
          key={`cpu-score-container-${cpuScore}`}
          className={`flex items-center gap-3 ${cpuScore > 0 ? 'animate-container-shake' : ''}`}
        >
          <div id="scoreboard-cpu-score-box" className="flex flex-col items-end">
            <span
              className={`text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
                gameMode === 'friend' ? 'text-sky-300' : 'text-rose-400'
              }`}
            >
              <span>{gameMode === 'friend' ? 'Friend' : 'CPU'}</span>
              {gameMode === 'friend' && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    multiplayerStatus === 'connected'
                      ? 'bg-emerald-400 animate-pulse'
                      : multiplayerStatus === 'connecting'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-amber-400'
                  }`}
                  title={multiplayerStatus === 'connected' ? 'Friend Connected' : 'Waiting for Opponent'}
                />
              )}
            </span>
            <span
              id="scoreboard-cpu-score"
              key={`cpu-score-${cpuScore}`}
              className={`text-3xl font-black tabular-nums leading-none drop-shadow origin-right inline-block transition-colors ${
                cpuScore > 0
                  ? gameMode === 'friend'
                    ? 'animate-score-zoom-cpu text-sky-400'
                    : 'animate-score-zoom-cpu text-rose-400'
                  : 'text-white'
              }`}
            >
              {cpuScore}
            </span>
          </div>
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                gameMode === 'friend'
                  ? PADDLE_COLOR_CONFIG[opponentPaddleColor]?.avatarClass ||
                    'bg-gradient-to-br from-sky-500 to-blue-800 shadow-sky-900/40'
                  : 'bg-gradient-to-br from-rose-500 to-red-800 shadow-rose-900/40'
              }`}
            >
              {gameMode === 'friend' ? 'OPP' : 'CPU'}
            </div>
            {server === 'cpu' && (
              <span
                className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-900 animate-pulse"
                title="Serving"
              />
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
            title={gameMode === 'friend' ? 'Restart / Rematch' : 'Restart Match (Rolls new random paddle color)'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode & Settings Bar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-xs shadow-xl max-w-[95vw]">
        {/* Game Mode Selector: Solo vs CPU / Play with Friend */}
        <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10">
          <button
            id="btn-mode-cpu"
            onClick={switchToCpuMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              gameMode === 'cpu'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>vs CPU</span>
          </button>
          <button
            id="btn-mode-friend"
            onClick={() => switchToFriendMode()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              gameMode === 'friend'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>With Friend</span>
            {gameMode === 'friend' && multiplayerStatus === 'connected' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        <div className="h-4 w-px bg-white/15" />

        {/* Difficulty (Solo Mode only) */}
        {gameMode === 'cpu' && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 mr-0.5 font-medium">Difficulty:</span>
            {(['casual', 'pro', 'master'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyMode(d)}
                className={`px-2 py-0.5 rounded-lg capitalize font-medium transition ${
                  difficulty === d
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Multiplayer Controls (Friend Mode) */}
        {gameMode === 'friend' && (
          <div className="flex items-center gap-2">
            <button
              id="btn-copy-link-chip"
              onClick={copyInviteLink}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-semibold transition ${
                copiedLink
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15'
              }`}
              title="Copy friend invite link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>

            <button
              id="btn-share-link-chip"
              onClick={shareInviteLink}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition border border-white/15"
              title="Share Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowInviteModal((v) => !v)}
              className="text-xs text-indigo-300 hover:text-indigo-200 underline decoration-indigo-400/40"
            >
              {showInviteModal ? 'Hide Link' : 'Show Link'}
            </button>
          </div>
        )}

        <div className="h-4 w-px bg-white/15" />

        {/* Bat Color Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            Bat:
          </span>
          {PADDLE_COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => {
                gameStateRef.current.playerPaddleColor = c;
                setPlayerPaddleColor(c);
              }}
              title={`Switch to ${PADDLE_COLOR_CONFIG[c].name}`}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg capitalize font-medium transition ${
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

      {/* Floating Invite Card in Friend Mode (when waiting or when user clicks 'Show Link') */}
      {gameMode === 'friend' && (multiplayerStatus !== 'connected' || showInviteModal) && (
        <div
          id="friend-invite-card"
          className="absolute top-32 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-md p-5 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white">Play with Friend (1v1)</h3>
                <span className="text-[11px] text-slate-400">Real-time online multiplayer</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  multiplayerStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : multiplayerStatus === 'connecting'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    multiplayerStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                />
                {multiplayerStatus === 'connected' ? 'Opponent Ready' : 'Waiting for Opponent...'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
            Send this invite link to your friend. Whoever opens the link will instantly join this match as your opponent!
          </p>

          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 mb-3.5">
            <div className="flex-1 px-3 py-1 text-xs text-slate-300 font-mono truncate select-all">
              {typeof window !== 'undefined'
                ? `${window.location.origin}${window.location.pathname}?room=${friendRoomId || ''}`
                : ''}
            </div>
            <button
              id="btn-copy-link-modal"
              onClick={copyInviteLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                copiedLink
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={shareInviteLink}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition"
              title="Share Link via Apps"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
            <span className="flex items-center gap-1 font-mono">
              <span>Room:</span>
              <strong className="text-white">{friendRoomId}</strong>
            </span>
            <div className="flex items-center gap-3">
              {multiplayerStatus === 'connected' && (
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Resume Match
                </button>
              )}
              <button
                onClick={switchToCpuMode}
                className="text-slate-400 hover:text-white underline decoration-slate-600 transition"
              >
                Switch to Solo vs CPU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Stage */}
      <div
        id="canvas-container"
        className={`relative w-full h-full max-w-6xl max-h-[88vh] flex items-center justify-center p-2 touch-none select-none ${
          screenShakeActive ? 'animate-screen-shake' : ''
        }`}
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => handlePointerMove(e.clientX, e.clientY)}
        onTouchMove={(e: React.TouchEvent<HTMLDivElement>) => {
          if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onPointerMove={(e: React.PointerEvent<HTMLDivElement>) => handlePointerMove(e.clientX, e.clientY)}
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
                  ? gameMode === 'friend'
                    ? 'Sensational table tennis mastery! You defeated your friend in 3D Ping Pong!'
                    : 'Sensational table tennis mastery! You crushed the CPU.'
                  : gameMode === 'friend'
                  ? 'Your friend took the match! Demand a rematch and claim victory!'
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
                  <div className="text-xs text-slate-400 font-semibold uppercase">Fast Hits</div>
                  <div className="text-lg font-black text-sky-400">{totalFastHits}</div>
                </div>
              </div>

              <button
                id="btn-play-again"
                onClick={startNewMatch}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                {gameMode === 'friend' ? 'Rematch Friend' : 'Play Next Match'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Info Banner */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-[12px] text-slate-400 pointer-events-none flex items-center gap-4 bg-slate-900/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
        <span>{gameMode === 'friend' ? '👥 Friend Online Match' : '🤖 Solo vs CPU'}</span>
        <span>•</span>
        <span>Free Bat Movement</span>
        <span>•</span>
        <span>Swipe Fast: Directional Curve & Spin</span>
      </div>
    </div>
  );
}
