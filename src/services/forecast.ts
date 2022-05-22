import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import { InternalError } from '@src/util/errors/internal-errors';

export enum BeachPosition {
  N = 'N',
  S = 'S',
  E = 'E',
  W = 'W',
}

export interface Beach {
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
  user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {
  rating: number;
}

export interface TimeForecast {
  time?: string;
  forecast: Omit<BeachForecast, 'time'>[];
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];

    forecast.forEach((forecast) => {
      const timePoint = forecastByTime.find(
        (obj) => obj.time === forecast.time
      );

      if (timePoint) {
        timePoint.forecast.push(forecast);
      } else {
        const time = forecast.time;

        delete forecast.time;

        forecastByTime.push({
          time: time,
          forecast: [forecast],
        });
      }
    });

    return forecastByTime;
  }

  private enricheData(beach: Beach, points: ForecastPoint[]): BeachForecast[] {
    return points.map((point) => ({
      ...point,
      lat: beach.lat,
      lng: beach.lng,
      name: beach.name,
      position: beach.position,
      rating: 1,
    }));
  }

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];

    try {
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);

        const enrichedBeachData = this.enricheData(beach, points);

        pointsWithCorrectSources.push(...enrichedBeachData);
      }
    } catch (error: unknown) {
      throw new ForecastProcessingInternalError((error as Error)?.message);
    }

    return this.mapForecastByTime(pointsWithCorrectSources);
  }
}
