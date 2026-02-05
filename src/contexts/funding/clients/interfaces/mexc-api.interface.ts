export interface IMexcTickerResponse {
  symbol: string;
  lastPrice: number;
  fundingRate: number;
}

export interface IMexcApiResponse {
  success: boolean;
  code: number;
  data: IMexcTickerResponse[];
}
