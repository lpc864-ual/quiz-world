import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Obtener los IDs de preguntas ya vistas desde el cuerpo de la solicitud
    const body = await request.json();
    const seenQuestionIds = body.seenIds || [];
    
    // Construir la consulta SQL para excluir las preguntas ya vistas
    let query = 'SELECT id, question_text FROM questions';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let params: any[] = [];
    
    // 
    if (seenQuestionIds.length > 0) {
      query += ' WHERE id NOT IN (';
      
      // Crear los placeholders para cada ID ($1, $2, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const placeholders = seenQuestionIds.map((_: any, index: any) => `$${index + 1}`).join(', ');
      
      query += placeholders + ')';
      params = seenQuestionIds;
    }
    
    // Añadir ORDER BY RANDOM() LIMIT 1 para obtener una pregunta aleatoria
    query += ' ORDER BY RANDOM() LIMIT 1';
    
    //
    const result = await db.query(query, params);

    // Si no tenemos respuesta, entonces pregunta vacia. Caso contrario devolvemos la pregunta
    const question = result.rows.length === 0 ? "" : { id: result.rows[0].id, questionText: result.rows[0].question_text}
    
    return NextResponse.json({ question }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener pregunta aleatoria:', error);
    return NextResponse.json(
      { error: 'Error al obtener pregunta aleatoria' },
      { status: 500 }
    );
  }
}