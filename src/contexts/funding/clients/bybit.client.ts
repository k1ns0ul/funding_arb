import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  IExchangeClient,
  ICoinMarginedFundingData,
} from '../domain/interfaces/exchange-client.interface';
import { IFundingRateData } from '../domain/interfaces/funding-rate-data.interface';
import { IBybitApiResponse } from './interfaces/bybit-api.interface';

@Injectable()
export class BybitClient implements IExchangeClient {
  private readonly baseUrl = 'https://api.bybit.com';

  async getFundingRates(): Promise<IFundingRateData[]> {
    try {
      const response = await axios.get<IBybitApiResponse>(`${this.baseUrl}/v5/market/tickers`, {
        params: { category: 'linear' },
        timeout: 10000,
      });

      if (response.data.retCode !== 0 || !response.data.result?.list) {
        return [];
      }

      return response.data.result.list.map((ticker) => ({
        symbol: ticker.symbol,
        rate: parseFloat(ticker.fundingRate) * 100,
        price: parseFloat(ticker.lastPrice),
        nextFundingTime: parseInt(ticker.nextFundingTime),
      }));
    } catch (error) {
      console.error('bybit client error:', error.message);
      return [];
    }
  }

  async getUsdtMarginedFundingRates(): Promise<ICoinMarginedFundingData[]> {
    try {
      const response = await axios.get<IBybitApiResponse>(`${this.baseUrl}/v5/market/tickers`, {
        params: { category: 'linear' },
        timeout: 10000,
      });

      if (response.data.retCode !== 0 || !response.data.result?.list) {
        return [];
      }

      return response.data.result.list.map((ticker) => ({
        symbol: ticker.symbol,
        rate: parseFloat(ticker.fundingRate) * 100,
        price: parseFloat(ticker.lastPrice),
        nextFundingTime: parseInt(ticker.nextFundingTime),
        contractType: 'usdt-margined' as const,
      }));
    } catch (error) {
      console.error('bybit usdt margined client error:', error.message);
      return [];
    }
  }

  async getCoinMarginedFundingRates(): Promise<ICoinMarginedFundingData[]> {
    try {
      const response = await axios.get<IBybitApiResponse>(`${this.baseUrl}/v5/market/tickers`, {
        params: { category: 'inverse' },
        timeout: 10000,
      });

      if (response.data.retCode !== 0 || !response.data.result?.list) {
        return [];
      }

      return response.data.result.list.map((ticker) => ({
        symbol: ticker.symbol,
        rate: parseFloat(ticker.fundingRate) * 100,
        price: parseFloat(ticker.lastPrice),
        nextFundingTime: parseInt(ticker.nextFundingTime),
        contractType: 'coin-margined' as const,
      }));
    } catch (error) {
      console.error('bybit coin margined client error:', error.message);
      return [];
    }
  }
}
