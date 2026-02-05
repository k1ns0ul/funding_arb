import { IFundingRateData } from './funding-rate-data.interface';

export interface ICoinMarginedFundingData {
  symbol: string;
  rate: number;
  price: number;
  nextFundingTime: number;
  contractType: 'coin-margined' | 'usdt-margined';
}

export interface IExchangeClient {
  getFundingRates(): Promise<IFundingRateData[]>;
  getCoinMarginedFundingRates?(): Promise<ICoinMarginedFundingData[]>;
  getUsdtMarginedFundingRates?(): Promise<ICoinMarginedFundingData[]>;
}
