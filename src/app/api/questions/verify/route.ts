import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, userAnswer } = body;
    
    if (!questionId || userAnswer === undefined) {
      return NextResponse.json(
        { error: 'Se requiere questionId y userAnswer' },
        { status: 400 }
      );
    }
    
    // Obtener la respuesta correcta de la base de datos
    const result = await db.query(
      'SELECT answer FROM questions WHERE id = $1',
      [questionId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      );
    }
    
    const correctAnswer = result.rows[0].answer;
    
    // Comparar respuestas (case insensitive)
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    // Solo informamos si es correcto o no, sin revelar la respuesta correcta
    return NextResponse.json({ isCorrect }, { status: 200 });
  } catch (error) {
    console.error('Error al verificar respuesta:', error);
    return NextResponse.json(
      { error: 'Error al verificar respuesta' },
      { status: 500 }
    );
  }
}