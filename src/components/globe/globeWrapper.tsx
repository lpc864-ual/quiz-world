'use client';

// forwardRef: usado para recibir ref de un componente padre
import { useEffect, useRef, forwardRef } from 'react';
// ForwardedRef: usado para el tipado del ref recibidas de un componente padre
import type { ForwardedRef } from 'react';

// Componente wrapper/adapter para transformar la instancia del globo en un componente react para renderizar
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GlobeWrapper = forwardRef((props: any, ref: ForwardedRef<any>) => {
  // Referencia al div que contendra el glob
  const containerRef = useRef<HTMLDivElement>(null);
  // Referencia para almacenar la instancia del globo
  // Usada para la limpieza del componente ya que trabajamos con referencias
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeInstanceRef = useRef<any>(null);
  // Efecto ejecutado al montar el componente o algun cambio en el array de dependencia (en nuestro caso, la referencia)
  useEffect(() => {
    // Si esta ejecutandose la vista en el navegador y existe la referencia al div
    if (typeof window !== 'undefined' && containerRef.current) {
      // Capturar el valor actual en una variable
      const currentContainer = containerRef.current;
      // Importacion dinamica (proceso asincrono)
      import('globe.gl').then(({ default: Globe }) => {
        // Al ser asincrono el proceso anterior puede hacerse null la referencia al div
        if (!currentContainer) return;
        
        // Si hay intancia del globo, entonces la eliminamos (p.e. entre renderizado por cambio de ref)
        if (globeInstanceRef.current) {
          currentContainer.removeChild(globeInstanceRef.current._canvas);
          globeInstanceRef.current = null;
        }
        
        // Instancia al globo (pasamos un ref para usar el canvas)
        const globeInstance = new Globe(currentContainer);
        // Guardamos la referencia para limpieza
        globeInstanceRef.current = globeInstance;
        
        // Asociamos la instancia al ref
        if (typeof ref === 'function') {
          ref(globeInstance);
        } else if (ref) {
          ref.current = globeInstance;
        }
      });
      
      // Funcion de limpieza
      return () => {
        if (globeInstanceRef.current) {
          try {
            currentContainer.removeChild(globeInstanceRef.current._canvas);
          } catch (e) {
            console.warn('Error cleaning up Globe instance:', e);
          }
          globeInstanceRef.current = null;
        }
      };
    }
    
    return undefined;
  }, [ref]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});

// Para el debugging
GlobeWrapper.displayName = 'GlobeWrapper';

export default GlobeWrapper;