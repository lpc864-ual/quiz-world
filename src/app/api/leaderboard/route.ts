// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try { 
    // Obtener los mejores 50 puntajes ordenados de mayor a menor
    const query = `
      SELECT id, country, username, score, created_at
      FROM players 
      ORDER BY score DESC, created_at ASC
      LIMIT 50
    `;
    
    const result = await db.query(query);

    const players = result.rows.map(row => ({
      id: row.id,
      country: row.country,
      username: row.username,
      score: row.score,
      createdAt: row.created_at.toISOString()
    }));

    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}