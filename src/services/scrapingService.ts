// Usado para scrapping y manipulacion de DOM
import * as cheerio from 'cheerio';
// Usado para peticiones
import axios from 'axios';

interface ScrapedCultureData {
  overview: string;
  languages: string[];
  festivals: string[];
}

interface ScrapedCountryData {
  culture: ScrapedCultureData;
  funFacts: string[];
}

/**
 * Servicio para web scraping de información cultural y curiosidades sobre países
 */
export const scrapingService = {
  /**
   * Realiza scraping de Wikipedia para obtener información cultural sobre un país
   * @param countryName Nombre del país
   */
  async getCountryCultureData(countryName: string): Promise<ScrapedCountryData> {
    try {
      // URL de Wikipedia del país
      const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`;
      
      // Realizar solicitud HTTP
      const response = await axios.get(wikipediaUrl);
      const $ = cheerio.load(response.data);
      
      // Extraer información cultural
      let cultureParagraph = '';
      
      // Intentar encontrar secciones de cultura
      const cultureSection = $('span#Culture').parent().nextUntil('h2');
      if (cultureSection.length > 0) {
        cultureParagraph = cultureSection.first().text().trim();
      } else {
        // Si no hay sección específica de cultura, usar el primer párrafo general
        cultureParagraph = $('div.mw-parser-output > p').eq(1).text().trim();
      }
      
      // Buscar festivales o eventos culturales
      const festivals: string[] = [];
      $('div.mw-parser-output h3, div.mw-parser-output h4').each((i, elem) => {
        const headerText = $(elem).text().toLowerCase();
        if (headerText.includes('festival') || headerText.includes('celebration') || headerText.includes('holiday')) {
          const festivalInfo = $(elem).nextUntil('h3, h4').first().text().trim();
          if (festivalInfo) {
            festivals.push(festivalInfo);
          }
        }
      });
      
      // Extraer datos curiosos
      const funFacts: string[] = [];
      $('div.mw-parser-output ul li').each((i, elem) => {
        const text = $(elem).text().trim();
        if (
          text.length > 20 && 
          text.length < 200 && 
          !text.includes('ISBN') && 
          !text.includes('http')
        ) {
          funFacts.push(text);
        }
        
        // Limitar a 5 hechos curiosos
        if (funFacts.length >= 5) return false;
      });
      
      // Extraer idiomas
      const languages: string[] = [];
      $('th:contains("Official language")').each((i, el) => {
        const languageCell = $(el).next('td');
        if (languageCell.length > 0) {
          const languageText = languageCell.text().trim();
          languageText.split(',').forEach(lang => {
            const cleanLang = lang.trim().replace(/\[.*?\]/g, '');
            if (cleanLang) languages.push(cleanLang);
          });
        }
      });
      
      return {
        culture: {
          overview: cultureParagraph || `Information about ${countryName}'s culture.`,
          languages: languages,
          festivals: festivals.slice(0, 3)
        },
        funFacts: funFacts.slice(0, 5)
      };
    } catch (error) {
      console.error(`Error scraping cultural data for ${countryName}:`, error);
      
      // Devolver datos por defecto en caso de error
      return {
        culture: {
          overview: `Information about ${countryName}'s culture is not available.`,
          languages: [],
          festivals: []
        },
        funFacts: [`${countryName} is a country with its own unique culture and history.`]
      };
    }
  },
  
  /**
   * Realiza scraping de datos turísticos
   * @param countryName Nombre del país
   */
  async getTourismData(countryName: string): Promise<string[]> {
    try {
      // URL de Wikitravel o sitio similar
      const travelUrl = `https://wikitravel.org/en/${encodeURIComponent(countryName)}`;
      
      const response = await axios.get(travelUrl);
      const $ = cheerio.load(response.data);
      
      const attractions: string[] = [];
      
      // Buscar atracciones turísticas
      $('h2:contains("See"), h2:contains("Attractions")').each((i, header) => {
        $(header).nextUntil('h2').find('li').each((j, item) => {
          const text = $(item).text().trim();
          if (text.length > 20 && text.length < 200) {
            attractions.push(text);
          }
        });
      });
      
      return attractions.slice(0, 5);
    } catch (error) {
      console.error(`Error scraping tourism data for ${countryName}:`, error);
      return [];
    }
  }
};