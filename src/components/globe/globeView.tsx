"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";

interface Country {
  common_name: string;
  official_name: string;
  capital: string;
  region: string;
  population: number;
  area: number;
  souvenirs: string;
  traditional_cuisine: string;
  flag: string;
}

// Importar Globe.gl dinámicamente para evitar problemas de SSR
const GlobeDynamic = dynamic(() => import("./globeWrapper"), {
  // ssr: false proporciona una capa adicional de seguridad para asegurarnos que este componente se ejecute del lado cliente para
  // acceder a las APIs del navegador para interactividad
  ssr: false
});

export default function GlobeView({ isQuizMode = false, onHoverCountry, onCountryClick }: { isQuizMode?: boolean, onHoverCountry: (countryName: string) => void; onCountryClick?: (countryName: string) => void; }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [countries, setCountries] = useState<Country[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  // Add state to track hovered country
  const [hoveredPolygon, setHoveredPolygon] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  // Handle explicit globe ready signal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGlobeReady = useCallback((globeInstance: any) => {
    console.log("Globe is ready:", globeInstance);
    setGlobeReady(true);
  }, []);

  // Cargar datos de países y necesarios para dibujar correctamente el globo
  useEffect(() => {
    // Carga datos básicos de un país
    const fetchCountries = async () => {
      try {
        const response = await fetch("/data/countries_data.json");
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error("Error loading countries data:", error);
      }
    };
    
    // Carga datos geometricos o topologicos necesarios para dibujar claramente cada país en el globo (formato GeoJSON o TopoJSON)
    // En nuestro caso recibimos los datos en formato TopoJSON
    const fetchGeoJson = async () => {
      try {
        const response = await fetch("/data/countries-110m.json");
        const topoJsonData = await response.json();

        // Import topojson-client and convert immediately
        const topojson = await import("topojson-client");
        const geoJsonData = topojson.feature(
          topoJsonData,
          topoJsonData.objects.countries
        );

        // Store the already-converted GeoJSON
        setGeoJsonData(geoJsonData);
      } catch (error) {
        console.error("Error loading GeoJSON data:", error);
      }
    };

    //
    fetchCountries();
    fetchGeoJson();
  }, []);

  // Configurar el globo una vez que se haya cargado
  useEffect(() => {
    if (!globeReady || countries === null || geoJsonData === null) return;

    // Configuración del globo
    const globe = globeRef.current;

    // Configuración básica del globo con textura y topografía
    globe
      .globeImageUrl("/images/earth-blue-marble.jpg") // Fondo
      .backgroundColor("rgba(0,0,0,0)") // Fondo transparente
      .showAtmosphere(false);

    // Configurar los polígonos para países usando GeoJSON
    globe
      .polygonsData(geoJsonData.features || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .polygonAltitude((polygon: any) => (hoveredPolygon === polygon ? 0.05 : 0.01)) // Altura ligeramente elevada para mostrar los bordes
      .polygonStrokeColor(() => "rgb(0, 0, 0)") // Color del borde
      .polygonSideColor(() => "rgba(0, 100, 0, 0.15)") // Color del lado del polígono
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .polygonCapColor((polygon: any) => {
        // Color para el área del polígono (puedes ajustar la transparencia)
        // Usamos un color con algo de opacidad para que sea "clickable"
        // Un poco más opaco cuando tiene hover
        return hoveredPolygon === polygon
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(255, 255, 255, 0.1)";
      })
      // Añade una transición suave para la altura
      // Importante: esto hace que los eventos de hover y clic se detecten sobre toda el área
      .polygonsTransitionDuration(300)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .onPolygonHover((polygon: any) => {
        document.body.style.cursor = polygon ? "pointer" : "default";
        if (polygon) {
          setHoveredPolygon(polygon);
          onHoverCountry(polygon.properties.name);
        } else {
          setHoveredPolygon(null);
          onHoverCountry("")
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .onPolygonClick((polygon: any) => {
        if (!polygon) return;
        const countrySelected = countries.find((c) => c.common_name === polygon.properties.name || c.official_name === polygon.properties.name);
        if (countrySelected && !isQuizMode) {
          setSelectedCountry(countrySelected);
        }
        if (countrySelected && onCountryClick) {
          onCountryClick(polygon.properties.name);
        }  
      });

    // Animación inicial
    const FIXED_ZOOM_DISTANCE = 300; // Ajusta este valor según tu preferencia
  
    globe.controls().minDistance = FIXED_ZOOM_DISTANCE;  
    globe.controls().maxDistance = FIXED_ZOOM_DISTANCE;  
    globe.controls().enableZoom = false; // Deshabilitar zoom
    globe.controls().autoRotate = false;
    //globe.controls().autoRotateSpeed = 0.5;
    if (!globeReady) {
      globe.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 2000);
    }

    setGlobeReady(true);

    return () => {
      if (globe) {
        globe.controls().autoRotate = false;
      }
    };
  }, [globeReady, countries, geoJsonData, hoveredPolygon, isQuizMode, onHoverCountry, onCountryClick]);

  // Cerrar el popup de información
  const closeCountryInfo = useCallback(() => {
    setSelectedCountry(null);
    setActiveTab("info");
  }, []);

  // Handler to close popup when clicking outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeCountryInfo();
      }
    },
    [closeCountryInfo]
  );

  return (
    <div className="relative w-full h-full">
      {/* Contenedor del globo */}
      <div className="w-full h-[calc(100vh-100px)]">
        <GlobeDynamic ref={globeRef} onGlobeReady={handleGlobeReady} />
      </div>

      {/* Popup de información de país */}
      {selectedCountry && !isQuizMode && (
        <>
          <div
            className="fixed z-50 inset-0 flex items-center justify-center cursor-default"
            onClick={handleBackdropClick}
          >
            <div className="max-w-md w-full bg-white rounded-lg p-6 mx-4 relative">
              {/* Header with flag and name */}
              <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  src={selectedCountry.flag}
                  alt={`Flag of ${selectedCountry.common_name}`}
                  className="h-8 mr-3"
                />
                <h2 className="text-xl font-bold flex-1 text-gray-800 dark:text-white">
                  {selectedCountry.common_name}
                </h2>
                <button
                  onClick={closeCountryInfo}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`px-4 py-2 font-medium cursor-pointer ${
                    activeTab === "info"
                      ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  onClick={() => setActiveTab("info")}
                >
                  Basic Info
                </button>
                <button
                  className={`px-4 py-2 font-medium cursor-pointer ${
                    activeTab === "souvenirs"
                      ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  onClick={() => setActiveTab("souvenirs")}
                >
                  Souvenirs
                </button>
                <button
                  className={`px-4 py-2 font-medium cursor-pointer ${
                    activeTab === "cuisine"
                      ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  onClick={() => setActiveTab("cuisine")}
                >
                  Traditional Cuisine
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTab === "info" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Capital
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {Array.isArray(selectedCountry.capital)
                          ? selectedCountry.capital.length > 0
                            ? selectedCountry.capital.join(", ")
                            : "N/A"
                          : selectedCountry.capital}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Region</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {selectedCountry.region}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Population
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {selectedCountry.population.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Area</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {selectedCountry.area.toLocaleString()} km²
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        Official Name
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {selectedCountry.official_name}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "souvenirs" && (
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-justify">
                      {selectedCountry.souvenirs}
                    </p>
                  </div>
                )}

                {activeTab === "cuisine" && (
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-justify">
                      {selectedCountry.traditional_cuisine}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
