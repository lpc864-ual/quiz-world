"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizStore } from '@/store/useQuizStore';

interface Player {
  id: number;
  username: string;
  score: number;
  country: string;
  createdAt: string;
}

interface Country {
  common_name: string;
  official_name: string;
  capital: string[];
  region: string;
  population: number;
  area: number;
  souvenirs: string;
  traditional_cuisine: string;
  flag: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const isValid = useQuizStore((state) => state.isValid);
  const score = useQuizStore((state) => state.score);
  const clear = useQuizStore((state) => state.clear);
  const [countries, setCountries] = useState<Country[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({username: "", password: "", country: ""});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isValid) {
      router.back();
      return;
    }
  }, []);

  const playAgain = () => {
    router.replace("/explore");
    setTimeout(() => {clear()}, 2000);
  }

  const [isFirstRender, setIsFirstRender] = useState(true);

  // Cargar países y leaderboard al montar el componente
  useEffect(() => {
    fetchCountries();
    fetchLeaderboard();
    setTimeout(() => {setIsFirstRender(false)}, 3000);
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch("/data/countries_data.json");
      if (response.ok) {
        const data = await response.json();
        // Ordenar países por nombre para el selector
        setCountries(
          data.sort((a: Country, b: Country) =>
            a.common_name.localeCompare(b.common_name)
          )
        );
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  // Función para obtener el mensaje según el puntaje
  const getScoreMessage = (score: number): string => {
    if (score >= 200)
      return "🌟 Yo! You're absolutely crushing it! World domination level achieved!";
    if (score >= 150)
      return "🗺️ Dude, you're on fire! Globe-trotting genius right here!";
    if (score >= 100)
      return "✈️ Nice work, explorer! Your world knowledge is solid!";
    if (score >= 50)
      return "🧭 Hey, not bad at all! You're getting the hang of this!";
    if (score >= 0)
      return "🌍 Alright, decent start! Time to level up your geography game!";
    if (score >= -100)
      return "📚 Whoops! Hit the books and come back swinging!";
    if (score >= -300)
      return "🗺️ Oof! Don't sweat it - everyone starts somewhere!";
    return "🌎 Yikes! Time for a world tour... on Google Maps maybe?";
  };

  // Función para obtener la bandera del país desde el JSON
  const getCountryFlag = (countryCode: string): string => {
    const country = countries.find((c) => {
      // Buscar por código ISO (extraer de la URL de la bandera)
      const flagCode = c.flag.match(/\/([a-z]{2})\.png$/)?.[1]?.toUpperCase();
      return flagCode === countryCode.toUpperCase();
    });

    if (country) {
      return country.flag;
    }

    // Fallback para algunos países específicos si no se encuentra
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  };

  // Función para obtener el nombre del país
  const getCountryName = (countryCode: string): string => {
    const country = countries.find((c) => {
      const flagCode = c.flag.match(/\/([a-z]{2})\.png$/)?.[1]?.toUpperCase();
      return flagCode === countryCode.toUpperCase();
    });

    return country?.common_name || countryCode;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          score,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Registration successful! Your score has been saved");
        setShowRegistration(false);
        setFormData({ username: "", password: "", country: "" });
        fetchLeaderboard(); // Recargar la tabla
      } else {
        setMessage(result.error || "Error registering");
      }
    } catch (error) {
      console.error("Error: ", error);
      setMessage("Connection error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animación de estrellas fugaces
  const ShootingStars = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 1200),
            y: -10,
            scale: 0,
          }}
          animate={{
            y: (typeof window !== "undefined" ? window.innerHeight : 800) + 10,
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[url('/images/night-sky.png')] bg-cover flex flex-col items-center justify-center overflow-hidden relative cursor-default">
      <ShootingStars />

      <div className="max-w-7xl w-full flex flex-row gap-8 px-4 mx-auto">
        {/* Panel izquierdo - Puntaje y mensaje */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
            {/* Puntaje */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mb-6"
            >
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-2">
                {score}
              </h1>
              <p className="text-xl text-blue-300">points</p>
            </motion.div>

            {/* Mensaje según puntaje */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <p className="text-lg md:text-xl text-white leading-relaxed">
                {getScoreMessage(score)}
              </p>
            </motion.div>

            {/* Botón para volver a jugar */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="mt-8"
            >
                <motion.button
                  onClick={playAgain}
                  className="px-8 py-3 rounded-full border-2 border-white bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white text-lg font-bold">
                    🚀 Play again
                  </span>
                </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Panel derecho - Leaderboard */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex-1 max-w-md"
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 h-full">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              🏆 Best scores
            </h2>

            {/* Lista de mejores jugadores */}
            <div className="max-h-64 overflow-y-auto mb-6 scrollbar-thin scrollbar-thumb-white/20">
              {players.slice(0, 50).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
                    index < 3 ? "bg-yellow-500/20" : "bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold w-6">
                      {index + 1}
                    </span>
                    <img
                      src={getCountryFlag(player.country)}
                      alt={`${getCountryName(player.country)} flag`}
                      className="w-6 h-4 object-cover rounded-sm"
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        e.currentTarget.src = `https://flagcdn.com/w40/${player.country.toLowerCase()}.png`;
                      }}
                    />
                    <span
                      className="text-white truncate max-w-20"
                      title={player.username}
                    >
                      {player.username}
                    </span>
                  </div>
                  <span className="text-white font-bold">{player.score}</span>
                </motion.div>
              ))}
            </div>

            {/* Botón para mostrar formulario de registro */}
            {!showRegistration && (
              <motion.button
                initial={isFirstRender ? { y: 20, opacity: 0 } : false}
                animate={isFirstRender ? { y: 0, opacity: 1 } : false}
                transition={isFirstRender ? { delay: 2.5 } : {}}
                onClick={() => setShowRegistration(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
              >
                💫 Save my score
              </motion.button>
            )}

            {/* Formulario de registro */}
            {showRegistration && (
              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full rounded-lg bg-white/10 p-3 placeholder-white/60 border border-white/20 text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-lg bg-white/10 p-3 placeholder-white/60 border border-white/20 text-white"
                  required
                />

                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full p-3 pr-10 rounded-lg bg-white/10 text-white border border-white/20 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundSize: "1.5em 1.5em",
                    backgroundPosition: "right 0.75rem center",
                    backgroundRepeat: "no-repeat"
                  }}
                  required
                >
                  <option
                    value=""
                    disabled
                    className="bg-gray-800 text-gray-400"
                  >
                    Select your country
                  </option>
                  {countries.slice(0, 250).map((country) => {
                    // Extraer código de país de la URL de la bandera
                    const countryCode = country.flag
                      .match(/\/([a-z]{2})\.png$/)?.[1]
                      ?.toUpperCase();
                    return countryCode ? (
                      <option
                        key={countryCode}
                        value={countryCode}
                        className="bg-gray-800 text-white"
                      >
                        {country.common_name}
                      </option>
                    ) : null;
                  })}
                </select>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    {isSubmitting ? "⏳ Saving..." : "✅ Sign up"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegistration(false)}
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    ꓫ
                  </button>
                </div>

                {message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center text-sm ${message.includes("successful") ? "text-green-400" : "text-red-400"}`}>
                    {message}
                  </motion.p>
                )}
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
