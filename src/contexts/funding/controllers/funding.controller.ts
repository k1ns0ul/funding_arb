import { Controller, Get, Query, Header } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetOpportunitiesDto } from '../dtos/get-opportunities.dto';
import { GetLatestOpportunitiesQuery } from '../queries/get-latest-opportunities.query';
import { GetLatestMarginOpportunitiesQuery } from '../queries/get-latest-margin-opportunities.query';
import { AnalyzeArbitrageCommand } from '../commands/analyze-arbitrage.command';
import { AnalyzeMarginTypeCommand } from '../commands/analyze-margin-type.command';

@Controller('funding')
export class FundingController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('opportunities')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async getOpportunities(@Query() dto: GetOpportunitiesDto) {
    await this.commandBus.execute(new AnalyzeArbitrageCommand());

    const opportunities = await this.queryBus.execute(new GetLatestOpportunitiesQuery(dto.limit));

    return this.formatOpportunities(opportunities);
  }

  @Get('margin-type-opportunities')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async getMarginTypeOpportunities(@Query() dto: GetOpportunitiesDto) {
    await this.commandBus.execute(new AnalyzeMarginTypeCommand());

    const opportunities = await this.queryBus.execute(
      new GetLatestMarginOpportunitiesQuery(dto.limit),
    );

    return this.formatMarginOpportunities(opportunities);
  }

  private formatOpportunities(opportunities: any[]): string {
    if (opportunities.length === 0) {
      return 'no arbitrage opportunities found';
    }

    let output = '\n';

    opportunities.forEach((opp, index) => {
      output += `${index + 1}. ${opp.normalizedSymbol} | spread: ${this.formatPercent(opp.spread)}\n`;
      output += '-'.repeat(80) + '\n';
      output +=
        this.padRight('exchange', 15) + ' | ' + this.padRight('price', 15) + ' | ' + 'funding 1h\n';
      output += '-'.repeat(80) + '\n';

      for (const exchange of opp.exchangesData) {
        output += this.padRight(exchange.exchange, 15) + ' | ';
        output += this.padRight(this.formatPrice(exchange.price), 15) + ' | ';
        output += this.formatPercent(exchange.rate) + '\n';
      }

      output += '\n';
    });

    return output;
  }

  private formatMarginOpportunities(opportunities: any[]): string {
    if (opportunities.length === 0) {
      return 'no margin type opportunities found';
    }

    let output = '\nmargin type arbitrage opportunities (Bybit only)\n';
    output += '='.repeat(80) + '\n\n';

    opportunities.forEach((opp, index) => {
      output += `${index + 1}. ${opp.asset}\n`;
      output += '-'.repeat(80) + '\n';
      output += `spread: ${this.formatPercent(opp.grossSpread)}\n`;
      output += `usdt contract: ${opp.usdtMarginedContract} | rate: ${this.formatPercent(opp.usdtFundingRate)}\n`;
      output += `coin contract: ${opp.coinMarginedContract} | rate: ${this.formatPercent(opp.coinFundingRate)}\n`;
      output += `recommended: ${opp.recommendedPosition}\n`;
      output += '\n';
    });

    return output;
  }

  private formatPercent(value: number): string {
    const numValue = Number(value);
    const sign = numValue >= 0 ? '+' : '';
    return sign + numValue.toFixed(4) + '%';
  }

  private formatPrice(value: number): string {
    const numValue = Number(value);
    if (numValue === 0) return 'n/a';
    if (numValue >= 1000) return numValue.toFixed(2);
    if (numValue >= 1) return numValue.toFixed(4);
    return numValue.toFixed(6);
  }

  private padRight(text: string, width: number): string {
    return text.toString().padEnd(width, ' ');
  }
}
