import express, { Response, Request } from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "./data-source";
import { routes } from "./routes";
import pino from "pino";
import pinoHttp from "pino-http";
import axios from "axios";

const PORT = process.env.PORT || 9001;

export const app = express();

type Flight = {
  departureTime: string;
  arrivalTime: string;
  carrier: string;
  origin: string;
  destination: string;
  score?: number;
};

type FlightQuery = {
  startDate?: string;
  endDate?: string;
  duration?: string;
  carrier?: string;
};

const API_URL =
  "https://gist.githubusercontent.com/bgdavidx/132a9e3b9c70897bc07cfa5ca25747be/raw/8dbbe1db38087fad4a8c8ade48e741d6fad8c872/gistfile1.txt";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      singleLine: true,
      translateTime: true,
    },
  },
});

AppDataSource.initialize()
  .then(async () => {
    const router = routes();

    app.use(bodyParser.json());
    app.use(pinoHttp({ logger }));

    app.get("/search", async (req: Request, res: Response) => {
      const { query } = req;
      const requestResponse = await axios.get<Flight[]>(API_URL);
      let flights = requestResponse.data;

      flights = filterByDuration(flights, query);
      flights = filterByMaximumDuration(flights, query);
      flights = filterByCarrier(flights, query);
      const flightsWithScores = await calculateFlightScore(flights, query);
      const sortedFlights = sortTheFlightsByScore(flightsWithScores);

      return res.json(sortedFlights);
    });

    app.listen(PORT);
    console.log(`Express server has started on port ${PORT}`);
  })
  .catch((error) => console.log(error));

const filterByDuration = (flights: Flight[], query: FlightQuery) => {
  if (!(query.endDate && query.startDate)) {
    return flights;
  }

  return flights.filter((flight) => {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const flightDepartureDate = new Date(flight.departureTime);

    return flightDepartureDate >= startDate && flightDepartureDate <= endDate;
  });
};

const filterByMaximumDuration = (flights: Flight[], query: FlightQuery) => {
  if (!query.duration) {
    return flights;
  }

  return flights.filter((flight) => {
    const arrivalTime = new Date(flight.arrivalTime);
    const depearturTime = new Date(flight.departureTime);

    // @ts-ignore
    const flightDurationInMilliseconds = arrivalTime - depearturTime;
    const duration = flightDurationInMilliseconds / (1000 * 60 * 60);
    const queryDuration = Number(query.duration);
    return duration <= queryDuration;
  });
};

const filterByCarrier = (flights: Flight[], query: FlightQuery) => {
  if (!query.carrier) {
    return flights;
  }

  return flights.filter((flight) => {
    return flight.carrier === query.carrier;
  });
};

const getDistanceBetweenAirports = (code1: string, code2: string) => {
  return Promise.resolve(1000);
};

const calculateFlightScore = (flights: Flight[], query: FlightQuery) => {
  const flightsMaps = flights.map(async (flight) => {
    const arrivalTime = new Date(flight.arrivalTime);
    const depearturTime = new Date(flight.departureTime);

    // @ts-ignore
    const flightDurationInHours = (arrivalTime - depearturTime) / (1000 * 3600);
    const disanceBetweenAirports = await getDistanceBetweenAirports(
      flight.origin,
      flight.destination
    );

    const carrierPreferenceScore = getCarrierPreference(flight, query);
    const score =
      flightDurationInHours * carrierPreferenceScore + disanceBetweenAirports;

    return {
      ...flight,
      score,
    };
  });

  return Promise.all(flightsMaps);
};

const getCarrierPreference = (flight: Flight, query: FlightQuery) => {
  if (flight.carrier === query.carrier) {
    return 0.9;
  }

  return 1.0;
};

const sortTheFlightsByScore = (flights: Flight[]) => {
  return flights.sort((flightA, flightB) => {
    return flightA.score - flightB.score;
  });
};
