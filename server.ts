import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface PlayerSession {
  ws: WebSocket;
  role: 'p1' | 'p2';
  paddleColor: string;
}

interface Room {
  id: string;
  p1: PlayerSession | null;
  p2: PlayerSession | null;
  p1Score: number;
  p2Score: number;
  serverRole: 'p1' | 'p2';
  serveCounter: number;
  rallyCount: number;
  bestRally: number;
}

const rooms = new Map<string, Room>();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', activeRooms: rooms.size });
  });

  // Create or verify room endpoint (optional HTTP helper)
  app.get('/api/room/:id', (req, res) => {
    const room = rooms.get(req.params.id);
    if (!room) {
      return res.json({ exists: false });
    }
    res.json({
      exists: true,
      hasP1: !!room.p1,
      hasP2: !!room.p2,
      isFull: !!room.p1 && !!room.p2,
    });
  });

  // WebSocket Server
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/ws' || url.pathname.startsWith('/ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      // Don't destroy if other protocols/Vite HMR
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomId: string | null = null;
    let currentRole: 'p1' | 'p2' | null = null;

    ws.on('message', (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());

        switch (msg.type) {
          case 'join': {
            const { roomId, paddleColor = '#10b981' } = msg;
            currentRoomId = roomId;

            let room = rooms.get(roomId);
            if (!room) {
              // First player creates the room as Player 1 (Host)
              currentRole = 'p1';
              room = {
                id: roomId,
                p1: { ws, role: 'p1', paddleColor },
                p2: null,
                p1Score: 0,
                p2Score: 0,
                serverRole: 'p1',
                serveCounter: 0,
                rallyCount: 0,
                bestRally: 0,
              };
              rooms.set(roomId, room);

              ws.send(JSON.stringify({
                type: 'joined',
                role: 'p1',
                roomId,
                waitingForOpponent: true,
              }));
            } else if (!room.p1) {
              currentRole = 'p1';
              room.p1 = { ws, role: 'p1', paddleColor };
              ws.send(JSON.stringify({
                type: 'joined',
                role: 'p1',
                roomId,
                opponentColor: room.p2?.paddleColor,
                waitingForOpponent: !room.p2,
              }));
              if (room.p2?.ws.readyState === WebSocket.OPEN) {
                room.p2.ws.send(JSON.stringify({
                  type: 'opponent_joined',
                  opponentColor: paddleColor,
                }));
                // Start match
                broadcastToRoom(room, {
                  type: 'match_ready',
                  p1Color: room.p1.paddleColor,
                  p2Color: room.p2.paddleColor,
                  serverRole: room.serverRole,
                });
              }
            } else if (!room.p2) {
              // Second player joins as Player 2 (Guest)
              currentRole = 'p2';
              room.p2 = { ws, role: 'p2', paddleColor };
              ws.send(JSON.stringify({
                type: 'joined',
                role: 'p2',
                roomId,
                opponentColor: room.p1.paddleColor,
                waitingForOpponent: false,
              }));

              if (room.p1.ws.readyState === WebSocket.OPEN) {
                room.p1.ws.send(JSON.stringify({
                  type: 'opponent_joined',
                  opponentColor: paddleColor,
                }));
              }

              // Ready to start!
              broadcastToRoom(room, {
                type: 'match_ready',
                p1Color: room.p1.paddleColor,
                p2Color: room.p2.paddleColor,
                serverRole: room.serverRole,
              });
            } else {
              // Room is full
              ws.send(JSON.stringify({
                type: 'room_full',
                message: 'This match room already has two players.',
              }));
            }
            break;
          }

          case 'paddle_move': {
            if (!currentRoomId || !currentRole) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const opponent = currentRole === 'p1' ? room.p2 : room.p1;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              // Transpose coordinates so both players have intuitive first-person perspective:
              // Lateral is mirrored (-lateral)
              // Depth is inverted (1 - depth)
              // Tilt is mirrored (-paddleTilt)
              opponent.ws.send(JSON.stringify({
                type: 'opponent_paddle',
                lateral: -msg.lateral,
                depth: 1 - msg.depth,
                paddleVx: -msg.paddleVx,
                paddleVy: -msg.paddleVy,
                paddleTilt: -msg.paddleTilt,
              }));
            }
            break;
          }

          case 'ball_hit': {
            if (!currentRoomId || !currentRole) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const opponent = currentRole === 'p1' ? room.p2 : room.p1;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              // Relay ball hit inverted to opponent's view frame
              opponent.ws.send(JSON.stringify({
                type: 'ball_hit',
                ball: {
                  depth: 1 - msg.ball.depth,
                  lateral: -msg.ball.lateral,
                  z: msg.ball.z,
                  vDepth: -msg.ball.vDepth,
                  vLateral: -msg.ball.vLateral,
                  vz: msg.ball.vz,
                  spinLateral: -msg.ball.spinLateral,
                  smash: msg.ball.smash,
                  strikeType: msg.ball.strikeType,
                },
              }));
            }
            break;
          }

          case 'serve': {
            if (!currentRoomId || !currentRole) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const opponent = currentRole === 'p1' ? room.p2 : room.p1;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'serve',
                ball: {
                  depth: 1 - msg.ball.depth,
                  lateral: -msg.ball.lateral,
                  z: msg.ball.z,
                  vDepth: -msg.ball.vDepth,
                  vLateral: -msg.ball.vLateral,
                  vz: msg.ball.vz,
                  spinLateral: -msg.ball.spinLateral,
                  smash: msg.ball.smash,
                },
              }));
            }
            break;
          }

          case 'point_scored': {
            if (!currentRoomId || !currentRole) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            // Determine who won point
            // msg.winnerRole is 'self' or 'opponent' from the reporting player
            const pointWinnerRole: 'p1' | 'p2' =
              msg.winnerRole === 'self'
                ? currentRole
                : (currentRole === 'p1' ? 'p2' : 'p1');

            if (pointWinnerRole === 'p1') {
              room.p1Score += 1;
            } else {
              room.p2Score += 1;
            }

            room.serveCounter += 1;
            // Standard table tennis rule: switch server every 2 points, or every 1 in deuce (10-10+)
            const isDeuce = room.p1Score >= 10 && room.p2Score >= 10;
            const switchInterval = isDeuce ? 1 : 2;
            if (room.serveCounter % switchInterval === 0) {
              room.serverRole = room.serverRole === 'p1' ? 'p2' : 'p1';
            }

            // Check game over (first to 11, must lead by 2)
            let matchWinner: 'p1' | 'p2' | null = null;
            if (room.p1Score >= 11 && room.p1Score - room.p2Score >= 2) {
              matchWinner = 'p1';
            } else if (room.p2Score >= 11 && room.p2Score - room.p1Score >= 2) {
              matchWinner = 'p2';
            }

            broadcastToRoom(room, {
              type: 'score_update',
              p1Score: room.p1Score,
              p2Score: room.p2Score,
              pointWinnerRole,
              serverRole: room.serverRole,
              matchWinner,
              reason: msg.reason,
            });
            break;
          }

          case 'restart_match': {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            room.p1Score = 0;
            room.p2Score = 0;
            room.serveCounter = 0;
            room.serverRole = 'p1';
            room.rallyCount = 0;

            broadcastToRoom(room, {
              type: 'match_restarted',
              serverRole: 'p1',
            });
            break;
          }

          case 'ping': {
            ws.send(JSON.stringify({ type: 'pong', clientTime: msg.time }));
            break;
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room) return;

      if (currentRole === 'p1') {
        room.p1 = null;
        if (room.p2 && room.p2.ws.readyState === WebSocket.OPEN) {
          room.p2.ws.send(JSON.stringify({
            type: 'opponent_disconnected',
            message: 'Your friend disconnected.',
          }));
        }
      } else if (currentRole === 'p2') {
        room.p2 = null;
        if (room.p1 && room.p1.ws.readyState === WebSocket.OPEN) {
          room.p1.ws.send(JSON.stringify({
            type: 'opponent_disconnected',
            message: 'Your friend disconnected.',
          }));
        }
      }

      // If both players left, destroy room
      if (!room.p1 && !room.p2) {
        rooms.delete(currentRoomId);
      }
    });
  });

  function broadcastToRoom(room: Room, payload: object) {
    const data = JSON.stringify(payload);
    if (room.p1 && room.p1.ws.readyState === WebSocket.OPEN) {
      room.p1.ws.send(data);
    }
    if (room.p2 && room.p2.ws.readyState === WebSocket.OPEN) {
      room.p2.ws.send(data);
    }
  }

  // Vite middleware in dev; static file serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
