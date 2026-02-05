import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FetchFundingRatesCommand } from './fetch-funding-rates.command';
import { FundingRateRepository } from '../repositories/funding-rate.repository';
import { MexcClient } from '../clients/mexc.client';
import { GateClient } from '../clients/gate.client';
import { BybitClient } from '../clients/bybit.client';
import { KucoinClient } from '../clients/kucoin.client';
import { FundingRateEntity } from '../entities/funding-rate.entity';
import { ArbitrageAnalyzerService } from '../services/arbitrage-analyzer.service';

@CommandHandler(FetchFundingRatesCommand)
export class FetchFundingRatesHandler implements ICommandHandler<FetchFundingRatesCommand> {
  constructor(
    private readonly fundingRateRepository: FundingRateRepository,
    private readonly mexcClient: MexcClient,
    private readonly gateClient: GateClient,
    private readonly bybitClient: BybitClient,
    private readonly kucoinClient: KucoinClient,
    private readonly arbitrageAnalyzer: ArbitrageAnalyzerService,
  ) {}

  async execute(): Promise<FundingRateEntity[]> {
    console.log('fetching funding rates from exchanges');

    const [mexcRates, gateRates, bybitRates, kucoinRates] = await Promise.all([
      this.mexcClient.getFundingRates(),
      this.gateClient.getFundingRates(),
      this.bybitClient.getFundingRates(),
      this.kucoinClient.getFundingRates(),
    ]);

    const entities: FundingRateEntity[] = [];

    for (const rate of mexcRates) {
      const entity = new FundingRateEntity();
      entity.exchange = 'MEXC';
      entity.symbol = rate.symbol;
      entity.normalizedSymbol = this.arbitrageAnalyzer.normalizeSymbol(rate.symbol, 'MEXC');
      entity.rate = rate.rate;
      entity.hourlyRate = rate.rate / 8;
      entity.price = rate.price;
      entity.nextFundingTime = new Date(rate.nextFundingTime);
      entities.push(entity);
    }

    for (const rate of gateRates) {
      const entity = new FundingRateEntity();
      entity.exchange = 'GATE';
      entity.symbol = rate.symbol;
      entity.normalizedSymbol = this.arbitrageAnalyzer.normalizeSymbol(rate.symbol, 'GATE');
      entity.rate = rate.rate;
      entity.hourlyRate = rate.rate / 8;
      entity.price = rate.price;
      entity.nextFundingTime = new Date(rate.nextFundingTime);
      entities.push(entity);
    }

    for (const rate of bybitRates) {
      const entity = new FundingRateEntity();
      entity.exchange = 'BYBIT';
      entity.symbol = rate.symbol;
      entity.normalizedSymbol = this.arbitrageAnalyzer.normalizeSymbol(rate.symbol, 'BYBIT');
      entity.rate = rate.rate;
      entity.hourlyRate = rate.rate / 8;
      entity.price = rate.price;
      entity.nextFundingTime = new Date(rate.nextFundingTime);
      entities.push(entity);
    }

    for (const rate of kucoinRates) {
      const entity = new FundingRateEntity();
      entity.exchange = 'KUCOIN';
      entity.symbol = rate.symbol;
      entity.normalizedSymbol = this.arbitrageAnalyzer.normalizeSymbol(rate.symbol, 'KUCOIN');
      entity.rate = rate.rate;
      entity.hourlyRate = rate.rate / 8;
      entity.price = rate.price;
      entity.nextFundingTime = new Date(rate.nextFundingTime);
      entities.push(entity);
    }

    await this.fundingRateRepository.save(entities);

    console.log(`saved ${entities.length} funding rates to database`);

    return entities;
  }
}
