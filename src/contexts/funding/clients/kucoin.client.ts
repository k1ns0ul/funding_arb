import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IExchangeClient } from '../domain/interfaces/exchange-client.interface';
import { IFundingRateData } from '../domain/interfaces/funding-rate-data.interface';
import { IKucoinApiResponse } from './interfaces/kucoin-api.interface';

@Injectable()
export class KucoinClient implements IExchangeClient {
  private readonly baseUrl = 'https://api-futures.kucoin.com';

  async getFundingRates(): Promise<IFundingRateData[]> {
    try {
      const response = await axios.get<IKucoinApiResponse>(
        `${this.baseUrl}/api/v1/contracts/active`,
        { timeout: 10000 },
      );

      if (response.data.code !== '200000' || !response.data.data) {
        return [];
      }

      return response.data.data.map((contract) => ({
        symbol: contract.symbol,
        rate: contract.fundingFeeRate * 100,
        price: contract.lastTradePrice,
        nextFundingTime: contract.nextFundingRateTime,
      }));
    } catch (error) {
      console.error('kucoin client error:', error.message);
      return [];
    }
  }
}
