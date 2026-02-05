export class OpportunityResponseDto {
  id: string;
  normalizedSymbol: string;
  spread: number;
  maxRate: number;
  minRate: number;
  exchangesData: Array<{
    exchange: string;
    symbol: string;
    rate: number;
    price: number;
  }>;
  createdAt: Date;
}
