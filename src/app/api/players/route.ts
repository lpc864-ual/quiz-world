// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

interface PlayerRequest {
  username: string;
  password: string;
  country: string;
  score: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PlayerRequest = await request.json();
    const { username, password, country, score } = body;

    // Validaciones
    if (!username || !password || !country || score === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 10) {
      return NextResponse.json(
        { error: 'The username must be between 3 and 10 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'The password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (score < -500 || score > 250) {
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      );
    }

    try {
      // Verificar si el usuario ya existe
      const existingUser = await db.query(
        'SELECT id, password_hash, score FROM players WHERE LOWER(username) = LOWER($1)',
        [username]
      );

      if (existingUser.rows.length > 0) {
        // Usuario existe, verificar contraseña
        const user = existingUser.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'User already exists. Incorrect password' },
            { status: 401 }
          );
        }

        // Contraseña correcta, actualizar solo si el nuevo puntaje es mejor
        if (score > user.score) {
          await db.query(
            'UPDATE players SET score = $1, country = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [score, country, user.id]
          );
          
          return NextResponse.json({
            message: 'New personal best! Your score has been updated',
            updated: true,
            newScore: score
          });
        } else {
          return NextResponse.json({
            message: 'Your current score is better. It has not been updated',
            updated: false,
            currentScore: user.score
          });
        }
      } else {
        // Usuario nuevo, crear registro
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query(
          `INSERT INTO players (username, password_hash, score, country, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
           RETURNING id, username, score, country`,
          [username, hashedPassword, score, country]
        );

        const newPlayer = result.rows[0];

        return NextResponse.json({
          message: 'Welcome to the leaderboard!',
          player: {
            id: newPlayer.id,
            username: newPlayer.username,
            score: newPlayer.score,
            country: newPlayer.country
          },
          created: true
        });
      }
    } catch (dbError) {
      throw dbError;
    }

  } catch (error) {
    console.error('Error in players API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}