// Librerias nativas de Next.js utilizadas para manejar peticiones. Exclusiva del lado del servidor
// Por un lado, NextRequest permite acceso tipado a una solicitud entrante (acceso a la estructura de la peticion)
// Por otro lado, NextResponse permite generar tipidamente una solicitud saliente (genera la estructura tipica de una peticion)
import { NextResponse } from 'next/server';
// Librería para realizar peticiones tanto del lado del servidor como del cliente
// Permite realizar la petición, pero los datos recibidos tienen el formato de tipo, normalmente, JSON
// No viene formateado ni tipado de tal forma de tener un header, status code... La estructura tipica de una peticion 
import axios from 'axios';

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

    // Si no hay caché válida, obtener datos de países de la API RestCountries
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca3,capital,population,area,flags,latlng,region');

    // Transformar los datos al formato que necesitamos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countries = response.data.map((country: any) => ({
      id: country.cca3,
      properties: {
        NAME: country.name.common,
        CAPITAL: country.capital ? country.capital[0] : '',
        POP_EST: country.population,
        AREA: country.area,
        FLAG: country.flags.png,
        LATLNG: country.latlng,
        REGION: country.region
      },
      type: 'Feature'
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