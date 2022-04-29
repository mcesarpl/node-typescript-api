import { StormGlass } from '@src/clients/stormGlass';
import { Forecast, Beach, BeachPosition } from '@src/services/forecast';
import stormGlassNormalizedResponseFixture from '@test/fixtures/stormGlassWeatherForecastNormalized.json';

jest.mock('@src/clients/stormGlass');

describe('Forecast Service', () => {
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

    StormGlass.prototype.fetchPoints = jest
      .fn()
      .mockResolvedValue(stormGlassNormalizedResponseFixture);

    const expectedResponse = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
        rating: 1,
        swellDirection: 179.4,
        swellHeight: 0.31,
        swellPeriod: 4.26,
        time: '2022-03-23T00:00:00+00:00',
        waveDirection: 196.46,
        waveHeight: 0.44,
        windDirection: 270.78,
        windSpeed: 5.16,
      },
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
        rating: 1,
        swellDirection: 179.77,
        swellHeight: 0.29,
        swellPeriod: 4.25,
        time: '2022-03-23T01:00:00+00:00',
        waveDirection: 215.76,
        waveHeight: 0.45,
        windDirection: 277.99,
        windSpeed: 5.37,
      },
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
        rating: 1,
        swellDirection: 180.15,
        swellHeight: 0.26,
        swellPeriod: 4.23,
        time: '2022-03-23T02:00:00+00:00',
        waveDirection: 235.06,
        waveHeight: 0.47,
        windDirection: 285.19,
        windSpeed: 5.59,
      },
    ];

    const forecast = new Forecast(new StormGlass());

    const beachesWithRating = await forecast.processForecastForBeaches(beaches);

    expect(beachesWithRating).toEqual(expectedResponse);
  });
});
