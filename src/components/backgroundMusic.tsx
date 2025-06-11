'use client';

import { useEffect, useRef } from "react";

// Constantes para controlar el volumen y la duración del fade
const MAX_VOLUME = 0.3; // Volumen máximo de la música (ajusta a tu gusto, entre 0 y 1)
const FADE_DURATION = 3000; // Duración del fade en milisegundos (3 segundos)
const FADE_INTERVAL = 50; // Intervalo para actualizar el volumen en milisegundos

export default function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const hasInteracted = useRef(false); // Para asegurar que la música solo intente reproducirse una vez tras la interacción inicial
    const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null); // Para almacenar el ID del intervalo de fade
    const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Para el temporizador de programación del próximo fade-out

    // Función para iniciar el fade-in (aumentar el volumen)
    const startFadeIn = () => {
        if (!audioRef.current) return;

        // Limpia cualquier intervalo de fade existente para evitar conflictos
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
        }

        audioRef.current.volume = 0; // Asegura que el volumen comience desde 0 para un fade-in suave
        // Calcula cuánto debe cambiar el volumen en cada paso
        const volumeStep = MAX_VOLUME / (FADE_DURATION / FADE_INTERVAL);
        let currentVolume = 0;

        fadeIntervalRef.current = setInterval(() => {
            if (!audioRef.current) { // Si el audio ya no existe en el DOM
                clearInterval(fadeIntervalRef.current!);
                return;
            }
            currentVolume += volumeStep; // Aumenta el volumen
            if (currentVolume >= MAX_VOLUME) {
                // Si el volumen alcanza el máximo, lo fija y detiene el fade
                audioRef.current.volume = MAX_VOLUME;
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
                // NOTA: La programación del próximo fade-out se hará justo después del play(),
                // no aquí, para asegurar que se haga cada vez que la canción empieza.
            } else {
                // Si no ha alcanzado el máximo, aplica el volumen actual
                audioRef.current.volume = currentVolume;
            }
        }, FADE_INTERVAL);
    };

    // Función para iniciar el fade-out (disminuir el volumen)
    const startFadeOut = () => {
        if (!audioRef.current) return;

        // Limpia cualquier temporizador de bucle pendiente antes de iniciar un nuevo fade-out
        if (loopTimeoutRef.current) {
            clearTimeout(loopTimeoutRef.current);
            loopTimeoutRef.current = null;
        }

        // Limpia cualquier intervalo de fade-in/out existente
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
        }

        // Calcula cuánto debe cambiar el volumen en cada paso
        const volumeStep = MAX_VOLUME / (FADE_DURATION / FADE_INTERVAL);
        let currentVolume = audioRef.current.volume; // Inicia el fade desde el volumen actual

        fadeIntervalRef.current = setInterval(() => {
            if (!audioRef.current) { // Si el audio ya no existe en el DOM
                clearInterval(fadeIntervalRef.current!);
                return;
            }
            currentVolume -= volumeStep; // Disminuye el volumen
            if (currentVolume <= 0) {
                // Si el volumen llega a 0, lo fija, detiene el fade
                audioRef.current.volume = 0;
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;

                // Cuando el audio se ha silenciado, lo reinicia y lo reproduce silenciosamente
                audioRef.current.currentTime = 0; // Reinicia la canción al principio
                audioRef.current.play().then(() => {
                    // Una vez que la canción ha comenzado a reproducirse (silenciosamente),
                    // programamos el fade-out para este nuevo ciclo
                    scheduleNextFadeOut(); // ¡IMPORTANTE! Programamos el fade-out para la *próxima* vez
                    startFadeIn(); // Inicia el fade-in para la nueva reproducción
                }).catch(error => {
                    console.error("Error al reproducir audio después del fade-out:", error);
                });
            } else {
                // Si no ha llegado a 0, aplica el volumen actual
                audioRef.current.volume = currentVolume;
            }
        }, FADE_INTERVAL);
    };

    // NUEVA FUNCIÓN: Encargada de programar el próximo fade-out
    const scheduleNextFadeOut = () => {
        if (!audioRef.current) {
            console.warn("No se puede programar el próximo fade-out: referencia de audio no disponible.");
            return;
        }

        // Comprobamos si la duración del audio es válida. FLAC puede tardar un poco.
        if (audioRef.current.duration === Infinity || isNaN(audioRef.current.duration) || audioRef.current.duration === 0) {
            console.warn("Duración del audio no disponible o inválida al programar el fade-out. Reintentando...");
            // Si la duración no está lista, reintenta después de un pequeño retraso
            setTimeout(scheduleNextFadeOut, 500);
            return;
        }

        // Calcula el tiempo en milisegundos antes del final para empezar el fade-out
        const fadeOutStartTime = (audioRef.current.duration * 1000) - FADE_DURATION;

        // Limpia cualquier temporizador de bucle existente antes de configurar uno nuevo
        if (loopTimeoutRef.current) {
            clearTimeout(loopTimeoutRef.current);
        }

        if (fadeOutStartTime > 0) {
            loopTimeoutRef.current = setTimeout(() => {
                console.log("Temporizador de fade-out disparado. Iniciando startFadeOut.");
                startFadeOut(); // Inicia el fade-out
            }, fadeOutStartTime);
            console.log("Próximo fade-out programado en:", fadeOutStartTime / 1000, "segundos.");
        } else {
            console.warn("La canción es muy corta o FADE_DURATION es demasiado largo. Iniciando fade-out de inmediato para el bucle.");
            startFadeOut(); // Si la canción es muy corta, hace el fade-out de inmediato
        }
    };

    // Esta función maneja la reproducción inicial cuando el usuario interactúa
    const tryPlayAudio = () => {
        if (audioRef.current && !hasInteracted.current) {
            audioRef.current.volume = 0; // Asegura que el volumen inicial sea 0 para el primer fade-in
            audioRef.current.play()
                .then(() => {
                    hasInteracted.current = true;
                    // Una vez que la reproducción inicial es exitosa, programamos el fade-out para esta primera reproducción.
                    scheduleNextFadeOut(); // ¡IMPORTANTE! Llamada inicial para programar el primer fade-out
                    startFadeIn(); // Inicia el fade-in de la música

                    // Remueve los listeners globales de interacción una vez que la música ha comenzado
                    document.removeEventListener('click', tryPlayAudio);
                    document.removeEventListener('keydown', tryPlayAudio);
                })
                .catch(error => {
                    console.log("Reproducción de audio bloqueada, esperando interacción del usuario:", error);
                    // Si la reproducción es bloqueada, no programamos nada todavía.
                });
        }
    };

    // useEffect para configurar los listeners de interacción global al montar el componente
    useEffect(() => {
        document.addEventListener('click', tryPlayAudio);
        document.addEventListener('keydown', tryPlayAudio);

        // Función de limpieza que se ejecuta cuando el componente se desmonta
        return () => {
            document.removeEventListener('click', tryPlayAudio);
            document.removeEventListener('keydown', tryPlayAudio);
            if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
            }
            if (loopTimeoutRef.current) {
                clearTimeout(loopTimeoutRef.current);
            }
        };
    }, []); 

    return (
        <audio
            ref={audioRef}
            src="/music/background-music.flac"
            preload="auto"
        />
    );
}