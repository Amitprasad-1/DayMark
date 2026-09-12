import { NextResponse } from 'next/server';

// Server-side in-memory room store (preserved across warm serverless requests)
declare global {
  // eslint-disable-next-line no-var
  var __daymarkSyncRooms: Map<string, { payload: any; updatedAt: number }> | undefined;
}

const syncRooms = globalThis.__daymarkSyncRooms ?? new Map<string, { payload: any; updatedAt: number }>();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__daymarkSyncRooms = syncRooms;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = (searchParams.get('room') || 'default').trim().toUpperCase();

  const room = syncRooms.get(roomId);
  if (!room) {
    return NextResponse.json({
      success: true,
      found: false,
      roomId,
      message: 'No cloud payload found for this room yet.',
    });
  }

  return NextResponse.json({
    success: true,
    found: true,
    roomId,
    updatedAt: room.updatedAt,
    payload: room.payload,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const roomId = (body.roomId || 'default').trim().toUpperCase();
    const payload = body.payload;

    if (!payload) {
      return NextResponse.json({ success: false, error: 'Missing sync payload' }, { status: 400 });
    }

    const updatedAt = Date.now();
    syncRooms.set(roomId, { payload, updatedAt });

    // Clean up rooms older than 30 days if map grows large
    if (syncRooms.size > 500) {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      for (const [key, value] of syncRooms.entries()) {
        if (value.updatedAt < thirtyDaysAgo) {
          syncRooms.delete(key);
        }
      }
    }

    return NextResponse.json({
      success: true,
      roomId,
      updatedAt,
      message: 'Synchronized successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal sync error' },
      { status: 500 }
    );
  }
}
