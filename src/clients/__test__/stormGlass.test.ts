import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeatherForecast from '@test/fixtures/stormGlassWeatherForecast.json';
import stormGlassWeatherForecastNormalized from '@test/fixtures/stormGlassWeatherForecastNormalized.json';
import * as HTTPUtil from '@src/util/request';

jest.mock('@src/util/request');

describe('StormGlass Client', () => {

  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>;

  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

  it('should return the normalized forescast from the StormGlass service', async () => {
    const lat = -33.7992726;
    const lgn = 151.289824;

    mockedRequest.get.mockResolvedValue({ data: stormGlassWeatherForecast } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);

    const response = await stormGlass.fetchPoints(lat, lgn);

    expect(response).toEqual(stormGlassWeatherForecastNormalized);
  });

  it('should exclude incomplete data points', async () => {
    const lat = -33.7992726;
    const lng = 151.289824;

    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2022-04-26T00:00:00+00:00',
        },
      ],
    };

    mockedRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);

    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.7992726;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.7992726;
    const lng = 151.289824;

    MockedRequestClass.isRequestError.mockReturnValue(true);

    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: {
          errors: ['Rate Limit reached'],
        },
      },
    });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
