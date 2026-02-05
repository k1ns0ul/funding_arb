import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { AnalyzeArbitrageCommand } from './analyze-arbitrage.command';
import { FetchFundingRatesCommand } from './fetch-funding-rates.command';
import { ArbitrageOpportunityRepository } from '../repositories/arbitrage-opportunity.repository';
import { ArbitrageAnalyzerService } from '../services/arbitrage-analyzer.service';

@CommandHandler(AnalyzeArbitrageCommand)
export class AnalyzeArbitrageHandler implements ICommandHandler<AnalyzeArbitrageCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly arbitrageOpportunityRepository: ArbitrageOpportunityRepository,
    private readonly arbitrageAnalyzer: ArbitrageAnalyzerService,
  ) {}

  async execute(): Promise<void> {
    console.log('starting arbitrage analysis');

    const fundingRates = await this.commandBus.execute(new FetchFundingRatesCommand());

    const opportunities = this.arbitrageAnalyzer.analyzeOpportunities(fundingRates);

    if (opportunities.length > 0) {
      await this.arbitrageOpportunityRepository.deleteOld();
      await this.arbitrageOpportunityRepository.save(opportunities);
      console.log(`found and saved ${opportunities.length} arbitrage opportunities`);

      this.logOpportunities(opportunities);
    } else {
      console.log('no arbitrage opportunities found');
    }
  }

  private logOpportunities(opportunities: any[]): void {
    opportunities.forEach((opp, index) => {
      console.log(
        `${index + 1}. ${opp.normalizedSymbol} | spread: ${this.formatPercent(opp.spread)}`,
      );
      console.log('-'.repeat(80));

      for (const exchange of opp.exchangesData) {
        console.log(
          `  ${exchange.exchange.padEnd(10)} | price: ${this.formatPrice(exchange.price).padEnd(12)} | rate: ${this.formatPercent(exchange.rate)}`,
        );
      }

      console.log('');
    });

    console.log('='.repeat(80) + '\n');
  }

  private formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(4) + '%';
  }

  private formatPrice(value: number): string {
    if (value === 0) return 'n/a';
    if (value >= 1000) return value.toFixed(2);
    if (value >= 1) return value.toFixed(4);
    return value.toFixed(6);
  }
}
