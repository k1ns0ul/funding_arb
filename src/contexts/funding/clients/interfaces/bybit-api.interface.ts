export interface IBybitTickerResponse {
  symbol: string;
  lastPrice: string;
  fundingRate: string;
  nextFundingTime: string;
}

export interface IBybitApiResponse {
  retCode: number;
  result: {
    list: IBybitTickerResponse[];
  };
}
