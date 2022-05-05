import { StormGlass } from '@src/clients/stormGlass';
import { Forecast, Beach, BeachPosition } from '@src/services/forecast';
import stormGlassNormalizedResponseFixture from '@test/fixtures/stormGlassWeatherForecastNormalized.json';

jest.mock('@src/clients/stormGlass');

describe('Forecast Service', () => {

  const mockedStormGlassService = new StormGlass as jest.Mocked<StormGlass>;

  it('should return the forecast for a list of beaches', async () => {
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'some-id',
      },
    ];

    mockedStormGlassService.fetchPoints.mockResolvedValue(stormGlassNormalizedResponseFixture);

    const expectedResponse = [
      {
        time: '2022-03-23T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 179.4,
            swellHeight: 0.31,
            swellPeriod: 4.26,
            waveDirection: 196.46,
            waveHeight: 0.44,
            windDirection: 270.78,
            windSpeed: 5.16,
          },
        ],
      },
      {
        time: '2022-03-23T01:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 179.77,
            swellHeight: 0.29,
            swellPeriod: 4.25,
            waveDirection: 215.76,
            waveHeight: 0.45,
            windDirection: 277.99,
            windSpeed: 5.37,
          },
        ],
      },
      {
        time: '2022-03-23T02:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 180.15,
            swellHeight: 0.26,
            swellPeriod: 4.23,
            waveDirection: 235.06,
            waveHeight: 0.47,
            windDirection: 285.19,
            windSpeed: 5.59,
          },
        ],
      },
    ];

    const forecast = new Forecast(mockedStormGlassService);

    const beachesWithRating = await forecast.processForecastForBeaches(beaches);

    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('should return a empty list when the beaches array is empty', async () => {
    const forecast = new Forecast();

    const response = await forecast.processForecastForBeaches([]);

    expect(response).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong during the rating process', async () => {
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'some-id',
      },
    ];

    mockedStormGlassService.fetchPoints.mockRejectedValue('Error when fetching data');

    const forecast = new Forecast(mockedStormGlassService);

    await expect(forecast.processForecastForBeaches(beaches)).rejects.toThrow(Error);
  })
});
