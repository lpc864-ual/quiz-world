// Librerias nativas de Next.js utilizadas para manejar peticiones. Exclusiva del lado del servidor
// Por un lado, NextRequest permite acceso tipado a una solicitud entrante (acceso a la estructura de la peticion)
// Por otro lado, NextResponse permite generar tipidamente una solicitud saliente (genera la estructura tipica de una peticion)
import { NextResponse } from 'next/server';
// Librería para realizar peticiones tanto del lado del servidor como del cliente
// Permite realizar la petición, pero los datos recibidos tienen el formato de tipo, normalmente, JSON
// No viene formateado ni tipado de tal forma de tener un header, status code... La estructura tipica de una peticion 
import axios from 'axios';

import fs from 'fs';
import path from 'path';

// Cache de países para evitar demasiadas solicitudes a APIs externas
// Las almacenamos en cache durante una hora (medido en milisegundos)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let countriesCache: any[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 60 * 60 * 1000; 

export async function GET() {
  try {
    // Verificar si podemos usar la caché
    const now = Date.now();
    
    if (countriesCache.length > 0 && now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json(countriesCache);
    }

    // Si no hay caché válida, leer el archivo JSON local
    const filePath = path.join(process.cwd(), 'public/data/countries_data.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const countriesData = JSON.parse(fileContents);
    
    // Transformar los datos al formato que necesitamos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countries = countriesData.data.map((country: any) => ({
      common_name: country.common_name,
      official_name: country.official_name,
      capital: country.capital ? country.capital : "N/A",
      region: country.region, 
      population: country.population,
      area: country.area,
      souvenirs: country.souvenirs ? country.souvenirs : "N/A",
      traditional_cuisine: country.traditional_cuisine ? country.traditional_cuisine : "N/A",
      flag: country.flags.png
    }));
    
    // Actualizar caché
    countriesCache = countries;
    lastFetchTime = now;
    
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}