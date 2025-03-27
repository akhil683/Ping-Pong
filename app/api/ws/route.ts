import { WebSocketServer } from 'ws';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { rooms, players, gameRounds, guesses } from '@/db/schema';

export const dynamic = 'force-dynamic';

// Store WebSocket server in global scope (for development, in production you'd use a proper store)
const wss = new WebSocketServer({ noServer: true });

// Room management
const roomsMap = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case 'joinRoom':
          await handleJoinRoom(ws, data);
          break;
        case 'startGame':
          await handleStartGame(ws, data);
          break;
        case 'draw':
          handleDraw(ws, data);
          break;
        case 'guess':
          await handleGuess(ws, data);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Invalid message format' }
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Clean up room connections
    roomsMap.forEach((clients, roomCode) => {
      if (clients.has(ws)) {
        clients.delete(ws);
        broadcastToRoom(roomCode, {
          type: 'playerDisconnected',
          data: { playerId: ws.id }
        });
      }
    });
  });
});

function broadcastToRoom(roomCode: string, message: any) {
  const clients = roomsMap.get(roomCode);
  if (!clients) return;

  const messageString = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}

async function handleJoinRoom(ws: WebSocket, data: any) {
  const { roomCode, playerName } = data;

  try {
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.code, roomCode),
    });

    if (!room) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Room not found' }
      }));
      return;
    }

    const player = await db.insert(players).values({
      roomId: room.id,
      name: playerName,
    }).returning();

    // Add to rooms map
    if (!roomsMap.has(roomCode)) {
      roomsMap.set(roomCode, new Set());
    }
    roomsMap.get(roomCode)?.add(ws);
    (ws as any).id = player[0].id;
    (ws as any).roomCode = roomCode;

    // Get updated player list
    const roomPlayers = await db.query.players.findMany({
      where: eq(players.roomId, room.id),
    });

    broadcastToRoom(roomCode, {
      type: 'playerJoined',
      data: { playerId: player[0].id, playerName }
    });

    broadcastToRoom(roomCode, {
      type: 'updatePlayers',
      data: roomPlayers
    });
  } catch (error) {
    console.error('Join room error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Failed to join room' }
    }));
  }
}
async function handleStartGame(ws: WebSocket, data: any) {
  const { roomCode } = data;

  try {
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.code, roomCode),
      with: { players: true },
    });

    if (!room) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Room not found' }
      }));
      return;
    }

    const words = ['apple', 'banana', 'car', 'house', 'tree'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomPlayer = room.players[Math.floor(Math.random() * room.players.length)];

    await db.update(rooms).set({
      currentWord: randomWord,
      currentDrawerId: randomPlayer.id,
    }).where(eq(rooms.id, room.id));

    const round = await db.insert(gameRounds).values({
      roomId: room.id,
      drawerId: randomPlayer.id,
      word: randomWord,
    }).returning();

    broadcastToRoom(roomCode, {
      type: 'gameStarted',
      data: {
        drawerId: randomPlayer.id,
        drawerName: randomPlayer.name,
        roundTime: room.roundTime,
      }
    });

    // Send word only to the drawer
    const drawerWs = [...roomsMap.get(roomCode)!].find(
      client => client.id === randomPlayer.id
    );
    if (drawerWs) {
      drawerWs.send(JSON.stringify({
        type: 'wordToDraw',
        data: randomWord
      }));
    }
  } catch (error) {
    console.error('Start game error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Failed to start game' }
    }));
  }
}

function handleDraw(ws: WebSocket, data: any) {
  const { roomCode, path } = data;
  broadcastToRoom(roomCode, {
    type: 'drawing',
    data: { path }
  });
}

async function handleGuess(ws: WebSocket, data: any) {
  const { roomCode, guess, playerId } = data;

  try {
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.code, roomCode),
    });

    if (!room || !room.currentWord) return;

    const isCorrect = guess.toLowerCase() === room.currentWord.toLowerCase();

    await db.insert(guesses).values({
      roundId: room.currentRoundId,
      playerId,
      guess,
      isCorrect,
    });

    broadcastToRoom(roomCode, {
      type: 'newGuess',
      data: { playerId, guess, isCorrect }
    });

    if (isCorrect) {
      await db.update(players)
        .set({ score: sql`${players.score} + 10` })
        .where(eq(players.id, playerId));

      const player = await db.query.players.findFirst({
        where: eq(players.id, playerId),
      });

      broadcastToRoom(roomCode, {
        type: 'correctGuess',
        data: { playerId, playerName: player?.name }
      });
    }
  } catch (error) {
    console.error('Guess error:', error);
  }
}

return wss;
}
// Other handler functions (startGame, draw, guess) would go here...

export async function GET(request: NextRequest) {
  try {
    if (request.headers.get('upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 426 });
    }

    const { nextUrl } = request;
    const responseHeaders = new Headers();

    // This is a workaround for the current Next.js WebSocket implementation
    return new Response(null, {
      status: 101,
      headers: responseHeaders,
      // @ts-ignore - This is a hack to make WebSockets work in Next.js
      webSocket: {
        // The WebSocket will be handled by our wss server
        getter: () => {
          return new Promise((resolve) => {
            wss.once('connection', (ws) => {
              resolve(ws);
            });
          });
        }
      }
    });
  } catch (err) {
    console.error('WebSocket error:', err);
    return new Response('WebSocket connection failed', { status: 500 });
  }
}
