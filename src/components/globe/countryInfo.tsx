'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Country {
  id: string;
  name: string;
  capital: string;
  flag: string;
  population: number;
  area: number;
  region: string;
}

interface CountryInfoProps {
  country: Country;
  onClose: () => void;
}

export default function CountryInfo({ country, onClose }: CountryInfoProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [countryDetails, setCountryDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener información adicional mediante scraping y APIs externas
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/countries/${country.id}`);
        const data = await response.json();
        setCountryDetails(data);
      } catch (error) {
        console.error('Error fetching country details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [country.id]);

  // Cerrar el popup al hacer clic fuera de él
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 text-white border border-gray-700"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading country information...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{country.name}</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Flag */}
            {country.flag && (
              <div className="mb-4 flex justify-center">
                <Image 
                  src={country.flag} 
                  alt={`Flag of ${country.name}`} 
                  width={200} 
                  height={120} 
                  className="rounded shadow-md"
                />
              </div>
            )}

            {/* Basic Info */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-400 text-sm">Capital</p>
                <p>{country.capital || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Region</p>
                <p>{country.region || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Population</p>
                <p>{country.population.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Area</p>
                <p>{country.area.toLocaleString()} km²</p>
              </div>
            </div>

            {/* Additional info from scraping and external APIs */}
            {countryDetails && (
              <div className="border-t border-gray-700 pt-4 mt-4">
                {/* Weather */}
                {countryDetails.weather && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Climate</h3>
                    <div className="flex items-center">
                      <div>
                        <p>Average temperature: {countryDetails.weather.avgTemp}°C</p>
                        <p>Climate: {countryDetails.weather.climate}</p>
                      </div>
                      {countryDetails.weather.icon && (
                        <Image 
                          src={countryDetails.weather.icon} 
                          alt="Weather" 
                          width={50} 
                          height={50} 
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Culture */}
                {countryDetails.culture && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Culture</h3>
                    <p>{countryDetails.culture.overview}</p>
                    
                    {countryDetails.culture.languages && (
                      <div className="mt-2">
                        <p className="text-gray-400 text-sm">Languages</p>
                        <p>{countryDetails.culture.languages.join(', ')}</p>
                      </div>
                    )}
                    
                    {countryDetails.culture.festivals && countryDetails.culture.festivals.length > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-400 text-sm">Famous Festivals</p>
                        <p>{countryDetails.culture.festivals[0]}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Fun facts */}
                {countryDetails.funFacts && countryDetails.funFacts.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Did You Know?</h3>
                    <p>{countryDetails.funFacts[0]}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}