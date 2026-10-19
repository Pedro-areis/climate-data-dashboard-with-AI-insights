import { useEffect, useState } from "react";
import NavBar from "../components/nav";
import { downloadCSV } from "../services/export/exportService";
import { getUser } from "../services/user/userService";
import {
  getAllWeather,
  getInsightWeather,
} from "../services/weather/weatherService";

function HomePage() {
  interface WeatherData {
    id: string;
    localization: string;
    temp: number;
    humidity: number;
    windSpeed: number;
    conditionSky: string;
    probabilityRain: number;
    insightsAI: string;
    measuredAt: string;
    createdAt: string;
  }

  interface User {
    name: string;
    email: string;
  }

  const [instight, setInsight] = useState("");
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
  });

  const [data, setData] = useState<WeatherData>({
    id: "",
    localization: "",
    temp: 0,
    humidity: 0,
    windSpeed: 0,
    conditionSky: "",
    probabilityRain: 0,
    insightsAI: "",
    measuredAt: "",
    createdAt: "",
  });

  const [secondData, setSecondData] = useState<WeatherData>({
    id: "",
    localization: "",
    temp: 0,
    humidity: 0,
    windSpeed: 0,
    conditionSky: "",
    probabilityRain: 0,
    insightsAI: "",
    measuredAt: "",
    createdAt: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const newUser = await getUser();
        setUser(newUser);

        return user;
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };

    const getInsight = async (id: string) => {
      try {
        const instight: string = await getInsightWeather(id);
        setInsight(instight);
      } catch (error) {
        console.error("Erro ao buscar insight da IA:", error);
      }
    };

    const fetchFirstData = async () => {
      try {
        const weatherData = await getAllWeather();
        const firstData = weatherData[0];
        if (firstData.measuredAt == null) {
          setData(data);
        }
        getInsight(firstData.id);
        setData(firstData);
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      }
    };

    const fetchSecondData = async () => {
      try {
        const weatherData = await getAllWeather();
        const secondData = weatherData[1];
        if (secondData.measuredAt == null) {
          setSecondData(data);
        }
        setSecondData(secondData);
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      }
    };

    const runReload = async () => {
      await fetchUser();
      await fetchFirstData();
      await fetchSecondData();
    };

    fetchUser();
    fetchSecondData();
    fetchFirstData();

    const intervalId = setInterval(runReload, 300000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="flex flex-row h-screen bg-neutral-500 flex-wrap">
      <NavBar />
      <div className="flex flex-col h-screen w-4/5">
        <section className="p-8 h-3/6 m-4 rounded-2xl bg-neutral-700">
          <div className="flex flex-row">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Bem-vindo ao dashboard, {user.name}!
            </h2>
            <p className="flex text-xl ml-auto text-white">
              <strong className="mr-2">Última atualização: </strong>
              {new Date(data.measuredAt).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="flex flex-row">
            <p className="text-xl mb-4 text-white">
              Dashboard com dados climaticos da cidade com localização:{" "}
              {data.localization}
            </p>
            <button
              className="ml-auto cursor-pointer text-white border border-white rounded-2xl p-2 hover:bg-neutral-600"
              onClick={() => {
                downloadCSV();
              }}
            >
              Exportar CSV
            </button>
          </div>
          <div
            className="flex flex-col bg-neutral-600 w-full h-2/3 
                    rounded-2xl mt-8 p-1 justify-center flex-wrap"
          >
            <p className="text-2xl mb-4 text-white m-4">
              <strong>Temperatura: </strong> {data.temp} °C
            </p>
            <p className="text-2xl mb-4 text-white m-4">
              <strong>Umidade: </strong> {data.humidity}%
            </p>
            <p className="text-2xl mb-4 text-white m-4">
              <strong>Velocidade do vento: </strong> {data.windSpeed} km/h
            </p>
            <p className="text-2xl mb-4 text-white m-4">
              <strong>Condição do céu: </strong> {data.conditionSky}
            </p>
            <p className="text-2xl mb-4 text-white m-4">
              <strong>Probabilidade de chuva: </strong> {data.probabilityRain}%
            </p>
          </div>
        </section>
        <div className="flex flex-row">
          <article className="flex flex-col p-8 m-4 w-1/2 h-96 rounded-2xl bg-neutral-700 items-center justify-center">
            <h2 className="text-3xl font-bold text-white flex mr-auto mb-10">
              Insight IA
            </h2>
            <div
              className="flex flex-col bg-neutral-600 w-full h-3/4 
                        rounded-2xl items-center"
            >
              <p className="text-xl mb-4 text-white m-7">{instight}</p>
            </div>
          </article>
          <article className="flex flex-col p-8 m-4 w-1/2 h-96 rounded-2xl bg-neutral-700 items-center justify-center">
            <div className="flex flex-row w-full h-1/4">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Coleta de dados anterior
              </h2>
              <p className="flex text-xl ml-auto text-white">
                <strong className="mr-2">Data: </strong>
                {new Date(secondData.measuredAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <div
              className="flex flex-col bg-neutral-600 w-full h-3/4 
                        rounded-2xl flex-wrap"
            >
              <p className="flex text-xl m-4 text-white">
                <strong className="mr-2">Temperatura: </strong>
                {secondData.temp} °C
              </p>
              <p className="flex text-xl m-4 text-white">
                <strong className="mr-2">Umidade: </strong>
                {secondData.humidity}%
              </p>
              <p className="flex text-xl m-4 text-white">
                <strong className="mr-2">Velocidade do vento: </strong>
                {secondData.windSpeed} km/h
              </p>
              <p className="flex text-xl m-4 text-white">
                <strong className="mr-2">Condição do céu: </strong>
                {secondData.conditionSky}
              </p>
              <p className="flex text-xl m-4 text-white">
                <strong className="mr-2">Prob. de chuva: </strong>
                {secondData.probabilityRain}%
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
