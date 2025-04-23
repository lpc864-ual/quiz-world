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

export default function GlobeView({ isQuizMode = false, highlightCountries = [], onCountryClick}: GlobeViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [countries, setCountries] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  // Add state to track hovered country
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [globeReady, setGlobeReady] = useState(false);

  // Cargar datos de países y necesarios para dibujar correctamente el globo
  useEffect(() => {
    // Carga datos básicos de un país
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error loading countries data:', error);
      }
    };
    // Carga datos geometricos o topologicos necesarios para dibujar claramente cada país en el globo (formato GeoJSON o TopoJSON)
    // En nuestro caso recibimos los datos en formato TopoJSON
    const fetchGeoJson = async () => {
      try {
        const response = await fetch('/data/countries-110m.json');
        const topoJsonData = await response.json();
        
        // Import topojson-client and convert immediately
        const topojson = await import('topojson-client');
        const geoJsonData = topojson.feature(topoJsonData, topoJsonData.objects.countries);
        
        // Store the already-converted GeoJSON
        setGeoJsonData(geoJsonData);
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
      }
    };

    //
    fetchCountries();
    fetchGeoJson();
  }, []);

  // Configurar el globo una vez que se haya cargado
  useEffect(() => {
    if (!globeRef.current || countries.length === 0 || !geoJsonData) return;

    // Configuración del globo
    const globe = globeRef.current;
    
    // Configuración básica del globo con textura y topografía
    globe
      .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.41.0/example/img/earth-blue-marble.jpg') // Fondo
      .backgroundColor('rgba(0,0,0,0)') // Fondo transparente
      .showAtmosphere(false);

    // Configurar los polígonos para países usando GeoJSON
    globe
      .polygonsData(geoJsonData.features || [])
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .polygonAltitude((d: any) => hoveredPolygonId === d ? 0.05 : 0.01) // Altura ligeramente elevada para mostrar los bordes
      .polygonStrokeColor(() => 'rgb(0, 0, 0)') // Color del borde
      .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)') // Color del lado del polígono
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .polygonCapColor((d: any) => {
        // Color para el área del polígono (puedes ajustar la transparencia)
        // Usamos un color con algo de opacidad para que sea "clickable"
        // Un poco más opaco cuando tiene hover
        return hoveredPolygonId === d ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'; 
      })
      // Añade una transición suave para la altura
      // Importante: esto hace que los eventos de hover y clic se detecten sobre toda el área
      .polygonsTransitionDuration(300) 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .onPolygonHover((d: any) => {
        document.body.style.cursor = d ? 'pointer' : 'default';
        setHoveredPolygonId(d ? d : null);
      })

    // Animación inicial
    //globe.controls().autoRotate = true;
    //globe.controls().autoRotateSpeed = 0.5;
    globe.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 2000);

    setGlobeReady(true);

    return () => {
      if (globe) {
        globe.controls().autoRotate = false;
      }
    };
  }, [countries, geoJsonData, hoveredPolygonId]);

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
        <GlobeDynamic ref={globeRef}/>
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