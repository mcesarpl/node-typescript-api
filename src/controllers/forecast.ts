import { Controller, Get } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';

const forecast = new Forecast();
@Controller('forecast')
export class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(
    _: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({});

      const forecasData = await forecast.processForecastForBeaches(beaches);

      res.status(200).send(forecasData);
    } catch (error) {
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
