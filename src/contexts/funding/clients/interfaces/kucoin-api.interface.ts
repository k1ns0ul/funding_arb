export interface IKucoinContractResponse {
  symbol: string;
  fundingFeeRate: number;
  lastTradePrice: number;
  nextFundingRateTime: number;
}

export interface IKucoinApiResponse {
  code: string;
  data: IKucoinContractResponse[];
}
