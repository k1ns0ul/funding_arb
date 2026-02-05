import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IExchangeClient } from '../domain/interfaces/exchange-client.interface';
import { IFundingRateData } from '../domain/interfaces/funding-rate-data.interface';
import { IMexcApiResponse } from './interfaces/mexc-api.interface';

@Injectable()
export class MexcClient implements IExchangeClient {
  private readonly baseUrl = 'https://contract.mexc.com';

  async getFundingRates(): Promise<IFundingRateData[]> {
    try {
      const response = await axios.get<IMexcApiResponse>(`${this.baseUrl}/api/v1/contract/ticker`, {
        timeout: 10000,
      });

      const { success, code, data } = response.data;

      if (!success || code !== 0 || !data?.length) {
        return [];
      }

      return data.map((ticker) => ({
        symbol: ticker.symbol,
        rate: ticker.fundingRate * 100,
        price: ticker.lastPrice,
        nextFundingTime: this.calculateNextFundingTime(),
      }));
    } catch (error) {
      console.error('mexc client error:', error.message);
      return [];
    }
  }

  private calculateNextFundingTime(): number {
    const now = new Date();
    const currentHour = now.getUTCHours();

    let nextHour: number;
    if (currentHour < 8) {
      nextHour = 8;
    } else if (currentHour < 16) {
      nextHour = 16;
    } else {
      nextHour = 0;
    }

    const nextFunding = new Date(now);
    nextFunding.setUTCHours(nextHour, 0, 0, 0);

    if (nextHour === 0) {
      nextFunding.setUTCDate(nextFunding.getUTCDate() + 1);
    }

    return nextFunding.getTime();
  }
}
