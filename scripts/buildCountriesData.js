// Utilizamos la sintaxis CommomJS en lugar de ESM ya que el script se ejecutará como un script de Node.js independiente
// Se podría utilizar la sintaxis ESM, pero requiere configuracion adicional para funcionar 
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path'); // Librería para trabajar con rutas
const fs = require('fs'); // Libreria para interactuar con el sistema de archivos
const axios = require('axios'); // Librería utilizada para realizar peticiones HTTP externas
//const cheerio = require('cheerio'); // Libreria para hacer scrapping y buscar elementos por selectores css (web estatica)
const puppeteer = require('puppeteer'); // Libreria para hacer scrapping y buscar elementos por selectores css (web dinamica) 

// process.cwd(): obtiene la ruta raíz
// Define la ruta donde guardaremos el archivo
const OUTPUT_PATH = path.join(process.cwd(), 'public/data/countries_data.json');

// Obtener datos de países básicos desde API
async function fetchBasicCountriesData() {
  try {
    console.log('Fetching basic countries data from API...');
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca3,capital,population,area,flags,latlng,region');

    return response.data.map(country => ({
      common_name: country.name.common ? country.name.common : "N/A",
      official_name: country.name.official ? country.name.official : "N/A",
      capital: country.capital ? country.capital : "N/A",
      region: country.region ? country.region : "N/A",
      population: country.population ? ountry.population : "N/A",
      area: country.area ? country.area : "N/A",
      souvenirs: "N/A",
      traditional_cuisine: "N/A",
      flag: country.flags.png ? country.flags.png : "N/A"
    }));
  } catch (error) {
    console.error('Error fetching countries data:', error);
    return [];
  }
}

// Función para normalizar nombre de país para la URL
const normalizeCountryName = (name) => {
  // Convertimos el texto en minuscula, reemplazamos los espacios por guiones (-) necesarios para las rutas de un pais 
  // en la página de scrapping que usaremos y, por si acaso, eliminamos cualquier carácter especial 
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
};

// Obtener datos adicionales mediante scraping
async function fetchTravelFactsData(countryName) {
  try {
    // Definimos la URL de la web que scrappearemos
    const normalizedName = normalizeCountryName(countryName);
    console.log(`Scraping travel facts for ${normalizedName}...`);
    const url = `https://www.cia.gov/the-world-factbook/countries/${normalizedName}/travel-facts/`;

    // Iniciamos el navegador 
    browser = await puppeteer.launch({ headless: false});
    
    // Abrimos una pagina
    const page = await browser.newPage();

    // Navegar a la página
    await page.goto(url, { waitUntil: 'networkidle2'});
    
    // Esperar un momento para asegurar que la página está completamente cargada
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extraer los datos directamente del DOM
    const travelData = await page.evaluate(() => {
      const getSectionContent = (sectionName) => {
        // Encontrar todos los encabezados h3.mt30
        const headers = Array.from(document.querySelectorAll('h3.mt30'));
        
        // Buscar el encabezado específico
        const header = headers.find(h => h.textContent.includes(sectionName));
        if (!header) return null;
        
        // Encontrar el elemento p siguiente
        var nextElement = header.nextElementSibling;
        if (!nextElement) return null;
        return nextElement.textContent.trim();
      };
      
      return {souvenirs: getSectionContent('Souvenirs') || "N/A", traditionalCuisine: getSectionContent('Traditional Cuisine') || "N/A"};
    });

    
    console.log(`Found Souvenirs: ${travelData.souvenirs}`);
    console.log(`Found Traditional Cuisine: ${travelData.traditionalCuisine}`);

    // Devolvemos los datos
    return {souvenirs: travelData.souvenirs || "N/A", traditional_cuisine: travelData.traditionalCuisine || "N/A"};
  } catch (error) {
    console.error(`Error scraping travel facts for ${countryName}:`, error);
    return {souvenirs: "N/A", traditional_cuisine: "N/A"};
  } finally {
    // Cerramos el navegador
    await browser.close();
  }
}

// Función principal que ejecuta todo el proceso
async function buildCountriesData() {
  // Verificar si el archivo ya existe
  if (fs.existsSync(OUTPUT_PATH)) {
    console.log('Countries data file already exists. Delete it to rebuild.');
    return;
  }

  // Crear directorio si no existe
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Obtener datos básicos
  const countries = await fetchBasicCountriesData();

  if (countries.length === 0) {
    console.error('Failed to fetch basic countries data. Aborting.');
    return;
  }

  console.log(`Fetched basic data for ${countries.length} countries.`);

  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    try {
      // Añadir retraso para evitar ser bloqueado por demasiadas solicitudes
      await new Promise(resolve => setTimeout(resolve, 1000));

      const travelData = await fetchTravelFactsData(country.common_name);
      countries[i].souvenirs = travelData.souvenirs;
      countries[i].traditional_cuisine = travelData.traditional_cuisine;

      console.log(`Added travel data for ${country.common_name}`);
    } catch (error) {
      console.error(`Error processing ${country.common_name}:`, error);
    }
  }

  // Guardar datos en archivo JSON
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(countries, null, 2));
  console.log(`Countries data written to ${OUTPUT_PATH}`);
}

// Ejecutar el script
buildCountriesData();