'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic'; 
import { motion } from 'framer-motion';
import CountryInfo from './countryInfo';

// Importar Globe.gl dinámicamente para evitar problemas de SSR
const GlobeDynamic = dynamic(() => import('./globeWrapper'), { 
  // ssr: false proporciona una capa adicional de seguridad para asegurarnos que este componente se ejecute del lado cliente para
  // acceder a las APIs del navegador para interactividad
  ssr: false,
  // 
  loading: () => (
    <div className="flex items-center justify-center h-[600px]">
      <div className="text-white text-xl">Loading interactive globe...</div>
    </div>
  )
});

interface Country {
  id: string;
  name: string;
  latlng: [number, number];
  capital: string;
  flag: string;
  population: number;
  area: number;
  region: string;
}

interface GlobeViewProps {
  isQuizMode?: boolean;
  highlightCountries?: string[];
  onCountryClick?: (country: Country) => void;
}

export default function GlobeView({ 
  isQuizMode = false,
  highlightCountries = [],
  onCountryClick
}: GlobeViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [globeReady, setGlobeReady] = useState(false);

  // Cargar datos de países
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // Usar nuestra API interna que combina datos de APIs externas y scraping
        const response = await fetch('/api/countries');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error loading countries data:', error);
      }
    };

    fetchCountries();
  }, []);

  // Configurar el globo una vez que se haya cargado
  useEffect(() => {
    if (!globeRef.current || countries.length === 0) return;

    // Configuración del globo
    const globe = globeRef.current;
    
    // Añadir polígonos de países
    globe
      .hexPolygonsData(countries)
      .hexPolygonResolution(3) // Nivel de detalle de los polígonos
      .hexPolygonMargin(0.3)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .hexPolygonColor((d: any)=> {
        // Si estamos en modo quiz y este país está en la lista de resaltados
        if (isQuizMode && highlightCountries.includes(d.id)) {
          return 'rgba(255, 215, 0, 0.7)'; // Color dorado para países destacados
        }
        return 'rgba(255, 255, 255, 0.3)'; // Color normal
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .onHexPolygonHover((d: any) => {
        // Cambiar cursor al hacer hover
        document.body.style.cursor = d ? 'pointer' : 'default';
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .onHexPolygonClick((d: any) => {
        if (!d) return;
        
        // Obtener información detallada del país
        const countryDetails = {
          id: d.id,
          name: d.properties.NAME || d.id,
          latlng: d.properties.LATLNG || [0, 0],
          capital: d.properties.CAPITAL || 'Unknown',
          flag: d.properties.FLAG || '',
          population: d.properties.POP_EST || 0,
          area: d.properties.AREA || 0,
          region: d.properties.REGION || 'Unknown'
        };
        
        if (isQuizMode && onCountryClick) {
          onCountryClick(countryDetails);
        } else {
          setSelectedCountry(countryDetails);
        }
      });
    
    // Establecer controles y ajustar la cámara
    globe
      .globeImageUrl('/images/earth-blue-marble.jpg')
      .backgroundColor('#000011')
      .atmosphereColor('lightskyblue')
      .atmosphereAltitude(0.1)
      .showGraticules(true)
      .showAtmosphere(true);
    
    // Animación inicial
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 2000);

    setGlobeReady(true);

    return () => {
      if (globe) {
        globe.controls().autoRotate = false;
      }
    };
  }, [countries, isQuizMode, highlightCountries, onCountryClick]);

  // Cerrar el popup de información
  const closeCountryInfo = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Contenedor del globo */}
      <motion.div
        className="w-full h-[calc(100vh-100px)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: globeReady ? 1 : 0 }}
        transition={{ duration: 1.5 }}
      >
        {typeof window !== 'undefined' && (
          <GlobeDynamic 
            ref={globeRef}
          />
        )}
      </motion.div>

      {/* Popup de información de país */}
      {selectedCountry && !isQuizMode && (
        <CountryInfo 
          country={selectedCountry} 
          onClose={closeCountryInfo} 
        />
      )}
    </div>
  );
}