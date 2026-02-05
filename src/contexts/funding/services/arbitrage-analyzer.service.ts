import { Injectable } from '@nestjs/common';
import { FundingRateEntity } from '../entities/funding-rate.entity';
import { ArbitrageOpportunityEntity } from '../entities/arbitrage-opportunity.entity';

interface ExchangeData {
  exchange: string;
  symbol: string;
  rate: number;
  price: number;
}

@Injectable()
export class ArbitrageAnalyzerService {
  normalizeSymbol(symbol: string, exchange: string): string {
    let normalized = symbol.replace(/_/g, '').replace(/-/g, '').toUpperCase();

    if (exchange === 'MEXC' || exchange === 'GATE') {
      normalized = normalized.replace('USDT', '').replace('USD', '');
    }

    if (exchange === 'BYBIT') {
      normalized = normalized.replace('USDT', '').replace('PERP', '');
    }

    if (exchange === 'KUCOIN') {
      normalized = normalized.replace('USDTM', '').replace('USDT', '').replace('M', '');
    }

    return normalized;
  }

  analyzeOpportunities(fundingRates: FundingRateEntity[]): ArbitrageOpportunityEntity[] {
    const symbolMap = new Map<string, ExchangeData[]>();

    for (const rate of fundingRates) {
      if (!symbolMap.has(rate.normalizedSymbol)) {
        symbolMap.set(rate.normalizedSymbol, []);
      }

      symbolMap.get(rate.normalizedSymbol).push({
        exchange: rate.exchange,
        symbol: rate.symbol,
        rate: rate.hourlyRate,
        price: rate.price,
      });
    }

    const opportunities: ArbitrageOpportunityEntity[] = [];

    for (const [normalizedSymbol, exchanges] of symbolMap) {
      if (exchanges.length < 2) continue;

      const rates = exchanges.map((e) => e.rate);
      const maxRate = Math.max(...rates);
      const minRate = Math.min(...rates);
      const spread = Math.abs(maxRate - minRate);

      const sortedExchanges = exchanges.sort((a, b) => b.rate - a.rate);

      const opportunity = new ArbitrageOpportunityEntity();
      opportunity.normalizedSymbol = normalizedSymbol;
      opportunity.spread = spread;
      opportunity.maxRate = maxRate;
      opportunity.minRate = minRate;
      opportunity.exchangesData = sortedExchanges;

      opportunities.push(opportunity);
    }

    return opportunities.sort((a, b) => b.spread - a.spread).slice(0, 10);
  }
}
