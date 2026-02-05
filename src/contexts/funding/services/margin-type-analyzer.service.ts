import { Injectable } from '@nestjs/common';
import { ICoinMarginedFundingData } from '../domain/interfaces/exchange-client.interface';
import { MarginTypeOpportunityEntity } from '../entities/margin-type-opportunity.entity';

@Injectable()
export class MarginTypeAnalyzerService {
  private readonly MIN_SPREAD_THRESHOLD = 0.02;

  extractBaseAsset(symbol: string, contractType: 'coin-margined' | 'usdt-margined'): string {
    if (contractType === 'usdt-margined') {
      return symbol.replace('USDT', '').replace('PERP', '');
    }
    return symbol.replace('USD', '').replace('_PERP', '').replace('PERP', '');
  }

  analyzeMarginTypeOpportunities(
    exchange: string,
    usdtContracts: ICoinMarginedFundingData[],
    coinContracts: ICoinMarginedFundingData[],
  ): MarginTypeOpportunityEntity[] {
    const opportunities: MarginTypeOpportunityEntity[] = [];

    const usdtMap = new Map<string, ICoinMarginedFundingData>();
    for (const contract of usdtContracts) {
      const asset = this.extractBaseAsset(contract.symbol, 'usdt-margined');
      usdtMap.set(asset, contract);
    }

    const coinMap = new Map<string, ICoinMarginedFundingData>();
    for (const contract of coinContracts) {
      const asset = this.extractBaseAsset(contract.symbol, 'coin-margined');
      coinMap.set(asset, contract);
    }

    for (const [asset, usdtContract] of usdtMap) {
      const coinContract = coinMap.get(asset);
      if (!coinContract) continue;

      const grossSpread = Math.abs(usdtContract.rate - coinContract.rate);

      if (grossSpread < this.MIN_SPREAD_THRESHOLD) continue;

      const opportunity = new MarginTypeOpportunityEntity();
      opportunity.exchange = exchange;
      opportunity.asset = asset;
      opportunity.usdtMarginedContract = usdtContract.symbol;
      opportunity.usdtFundingRate = usdtContract.rate;
      opportunity.usdtPrice = usdtContract.price;
      opportunity.coinMarginedContract = coinContract.symbol;
      opportunity.coinFundingRate = coinContract.rate;
      opportunity.coinPrice = coinContract.price;
      opportunity.grossSpread = grossSpread;

      if (usdtContract.rate > coinContract.rate) {
        opportunity.recommendedPosition = `Long ${coinContract.symbol} / Short ${usdtContract.symbol}`;
      } else {
        opportunity.recommendedPosition = `Long ${usdtContract.symbol} / Short ${coinContract.symbol}`;
      }

      opportunity.action = 'OPPORTUNITY';

      opportunities.push(opportunity);
    }

    return opportunities.sort((a, b) => b.grossSpread - a.grossSpread);
  }
}
