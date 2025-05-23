"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import GlobeView from "@/components/globe/globeView";
import Timer from "@/components/ui/timer";
import ScoreCounter from "@/components/ui/scoreCounter";

interface Question {
  id: number;
  questionText: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lee el parámetro de la URL
  const isQuizMode = searchParams.get("isQuizMode") === "true";

  // Función que se ejecuta cuando finaliza el tiempo
  const handleTimeEnd = () => {
    if (!isQuizMode) {
      // Redirigir a la página de introducción del quiz
      router.push("/quiz-intro");
    } else {
      // Redirigir a la página de resultados
      router.push("/results");
    }
  };

  const [score, setScore] = useState(0);
  const [lastScoreChange, setLastScoreChange] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [seenQuestionIds, setSeenQuestionIds] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Cargar una nueva pregunta aleatoria que no se haya visto antes
  const fetchQuestion = useCallback(async () => {
    try {
      // Prevenir múltiples llamadas mientras se está cargando
      if (isLoading) return;

      setIsLoading(true);
      const response = await fetch("/api/questions/random", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seenIds: seenQuestionIds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.question != "") {
          setCurrentQuestion(data.question);
          // Añadir esta pregunta a la lista de vistas
          setSeenQuestionIds((prev) => [...prev, data.question.id]);
        } else {
          // Redirijimos a la pestaña de puntuacion
          handleTimeEnd();
        }
      }
    } catch (error) {
      console.error("Error al cargar pregunta:", error);
    } finally {
      setIsLoading(false);
    }
  }, [seenQuestionIds, isLoading]);

  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const onHoverCountry = useCallback((countryName: string) => {
    setHoveredCountry(countryName);
  }, []);

  // Verificar la respuesta del usuario
  const checkAnswer = useCallback(
    async (countryName: string) => {
      if (!currentQuestion || isLoading) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/questions/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            userAnswer: countryName.trim(),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.isCorrect) {
            setScore((prev) => prev + 5);
            setLastScoreChange(5);
          } else {
            setScore((prev) => prev - 10);
            setLastScoreChange(-10);
          }

          // Programar la carga automática de la siguiente pregunta después de un breve retraso
          setTimeout(() => {
            fetchQuestion();
          }, 2000);
        }
      } catch (error) {
        console.error("Error al verificar respuesta:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentQuestion, fetchQuestion, isLoading]
  );

  // Efecto que maneja la primera carga de pregunta
  useEffect(() => {
    if (isQuizMode) {
      // Solo cargar la primera pregunta
      const loadInitialQuestion = async () => {
        await fetchQuestion();
      };

      loadInitialQuestion();
    }
  }, [isQuizMode]);

  return (
    // Cielo nocturno estrellado
    <div className="relative min-w-full min-h-screen bg-[url('/images/night-sky.png')] bg-cover flex flex-col items-center justify-center overflow-hidden">
      {/* Encabezado con el temporizador */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="w-full flex items-center justify-between p-4"
      >
        <h2 className="text-white text-xl md:text-2xl font-semibold">
          QuizWorld
        </h2>

        {isQuizMode && (
          <ScoreCounter score={score} lastScoreChange={lastScoreChange} />
        )}

        <Timer
          initialTime={300} // 5 minutos en segundos
          onTimeEnd={handleTimeEnd}
        />
      </motion.div>

      {/* Instrucciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className={`absolute top-14 left-1/2 transform -translate-x-1/2 p-4 text-center ${
          !isQuizMode ? "max-w-md" : "w-3/4"
        }`}
      >
        {!isQuizMode ? (
          <>
            <p className="text-white text-sm md:text-sm font-semibold mt-4">
              Click on any country to learn about it.
              <br />
              Explore as many as you can before the timer ends!
            </p>

            <p className="text-gray-300 text-sm italic">
              {hoveredCountry || ""}
            </p>
          </>
        ) : (
          <>
            <p className="text-white text-sm md:text-sm font-semibold mt-4">
              {currentQuestion?.questionText || "Loading question..."}
            </p>
            <p className="text-gray-300 text-sm italic">
              Click on the globe to select the correct country
            </p>
            <p className="text-gray-300 text-sm italic">
              {hoveredCountry || ""}
            </p>
          </>
        )}
      </motion.div>

      {/* Globo interactivo */}
      <GlobeView
        isQuizMode={isQuizMode}
        onHoverCountry={onHoverCountry}
        onCountryClick={isQuizMode ? checkAnswer : undefined}
      />
    </div>
  );
}
