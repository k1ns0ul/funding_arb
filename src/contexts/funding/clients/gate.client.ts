import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IExchangeClient } from '../domain/interfaces/exchange-client.interface';
import { IFundingRateData } from '../domain/interfaces/funding-rate-data.interface';
import { IGateTickerResponse } from './interfaces/gate-api.interface';

@Injectable()
export class GateClient implements IExchangeClient {
  private readonly baseUrl = 'https://fx-api.gateio.ws/api/v4';

  async getFundingRates(): Promise<IFundingRateData[]> {
    try {
      const response = await axios.get<IGateTickerResponse[]>(
        `${this.baseUrl}/futures/usdt/tickers`,
        {
          timeout: 10000,
          headers: { Accept: 'application/json' },
        },
      );

      return response.data.map((ticker) => ({
        symbol: ticker.contract,
        rate: parseFloat(ticker.funding_rate) * 100,
        price: parseFloat(ticker.last),
        nextFundingTime: Date.now() + 3600000,
      }));
    } catch (error) {
      console.error('gate client error:', error.message);
      return [];
    }
  }
}
