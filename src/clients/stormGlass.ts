import { AxiosError } from 'axios';
import { InternalError } from '@src/util/errors/internal-errors';
import config, { IConfig } from 'config';
import * as HTTPUtil from '@src/util/request';

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly waveHeight: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

export interface ForecastPoint {
  time?: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  constructor(private readonly request = new HTTPUtil.Request()) {}

  readonly apiBaseUrl = `${stormGlassResourceConfig.get(
    'apiUrl'
  )}/weather/point`;

  readonly apiParams =
    'swellDirection,swellHeight,waveDirection,waveHeight,windDirection,windSpeed';

  readonly apiSource = 'noaa';

  readonly utcTimestamp = 1647719925;

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      time: point.time,
      waveHeight: point.waveHeight[this.apiSource],
      waveDirection: point.waveDirection[this.apiSource],
      swellDirection: point.swellDirection[this.apiSource],
      swellHeight: point.swellHeight[this.apiSource],
      swellPeriod: point.swellPeriod[this.apiSource],
      windDirection: point.windDirection[this.apiSource],
      windSpeed: point.windSpeed[this.apiSource],
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.waveHeight?.[this.apiSource] &&
      point.waveDirection?.[this.apiSource] &&
      point.swellDirection?.[this.apiSource] &&
      point.swellHeight?.[this.apiSource] &&
      point.swellPeriod?.[this.apiSource] &&
      point.windDirection?.[this.apiSource] &&
      point.windSpeed?.[this.apiSource]
    );
  }

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const { data } = await this.request.get<StormGlassForecastResponse>(
        `${this.apiBaseUrl}?params=${this.apiParams}&source=${this.apiSource}&end=${this.utcTimestamp}&lat=${lat}&lng=${lng}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get('apitToken'),
          },
        }
      );

      return this.normalizeResponse(data);
    } catch (error: unknown) {
      if (HTTPUtil.Request.isRequestError(error as AxiosError)) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(
            (error as AxiosError).response?.data
          )} Code: ${(error as AxiosError).response?.status}`
        );
      }
      throw new ClientRequestError((error as Error).message);
    }
  }
}
