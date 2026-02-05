import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnalyzeMarginTypeCommand } from './analyze-margin-type.command';
import { MarginTypeOpportunityRepository } from '../repositories/margin-type-opportunity.repository';
import { MarginTypeAnalyzerService } from '../services/margin-type-analyzer.service';
import { BybitClient } from '../clients/bybit.client';

@CommandHandler(AnalyzeMarginTypeCommand)
export class AnalyzeMarginTypeHandler implements ICommandHandler<AnalyzeMarginTypeCommand> {
  constructor(
    private readonly marginTypeOpportunityRepository: MarginTypeOpportunityRepository,
    private readonly marginTypeAnalyzer: MarginTypeAnalyzerService,
    private readonly bybitClient: BybitClient,
  ) {}

  async execute(): Promise<void> {
    console.log('starting margin type arbitrage analysis (Bybit only)');

    const [bybitUsdt, bybitCoin] = await Promise.all([
      this.bybitClient.getUsdtMarginedFundingRates(),
      this.bybitClient.getCoinMarginedFundingRates(),
    ]);

    const opportunities = this.marginTypeAnalyzer.analyzeMarginTypeOpportunities(
      'BYBIT',
      bybitUsdt,
      bybitCoin,
    );

    if (opportunities.length > 0) {
      await this.marginTypeOpportunityRepository.deleteOld();
      await this.marginTypeOpportunityRepository.save(opportunities);
      console.log(`found and saved ${opportunities.length} margin type opportunities`);

      this.logOpportunities(opportunities);
    } else {
      console.log('no margin type opportunities found');
    }
  }

  private logOpportunities(opportunities: any[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('margin type arbitrage opportunities (Bybit)');
    console.log('='.repeat(80) + '\n');

    opportunities.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.asset} | spread: ${this.formatPercent(opp.grossSpread)}`);
      console.log('-'.repeat(80));
      console.log(
        `  USDT: ${opp.usdtMarginedContract} | rate: ${this.formatPercent(opp.usdtFundingRate)}`,
      );
      console.log(
        `  COIN: ${opp.coinMarginedContract} | rate: ${this.formatPercent(opp.coinFundingRate)}`,
      );
      console.log(`  position: ${opp.recommendedPosition}`);
      console.log('');
    });

    console.log('='.repeat(80) + '\n');
  }

  private formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(4) + '%';
  }
}
