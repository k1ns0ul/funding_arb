import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundingRateEntity } from './entities/funding-rate.entity';
import { ArbitrageOpportunityEntity } from './entities/arbitrage-opportunity.entity';
import { MarginTypeOpportunityEntity } from './entities/margin-type-opportunity.entity';
import { FundingController } from './controllers/funding.controller';
import { MexcClient } from './clients/mexc.client';
import { GateClient } from './clients/gate.client';
import { BybitClient } from './clients/bybit.client';
import { KucoinClient } from './clients/kucoin.client';
import { FundingRateRepository } from './repositories/funding-rate.repository';
import { ArbitrageOpportunityRepository } from './repositories/arbitrage-opportunity.repository';
import { MarginTypeOpportunityRepository } from './repositories/margin-type-opportunity.repository';
import { ArbitrageAnalyzerService } from './services/arbitrage-analyzer.service';
import { MarginTypeAnalyzerService } from './services/margin-type-analyzer.service';
import { FetchFundingRatesHandler } from './commands/fetch-funding-rates.handler';
import { AnalyzeArbitrageHandler } from './commands/analyze-arbitrage.handler';
import { AnalyzeMarginTypeHandler } from './commands/analyze-margin-type.handler';
import { GetLatestOpportunitiesHandler } from './queries/get-latest-opportunities.handler';
import { GetLatestMarginOpportunitiesHandler } from './queries/get-latest-margin-opportunities.handler';
import { FundingFetcherScheduler } from './schedulers/funding-fetcher.scheduler';

const CommandHandlers = [
  FetchFundingRatesHandler,
  AnalyzeArbitrageHandler,
  AnalyzeMarginTypeHandler,
];

const QueryHandlers = [GetLatestOpportunitiesHandler, GetLatestMarginOpportunitiesHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      FundingRateEntity,
      ArbitrageOpportunityEntity,
      MarginTypeOpportunityEntity,
    ]),
  ],
  controllers: [FundingController],
  providers: [
    MexcClient,
    GateClient,
    BybitClient,
    KucoinClient,
    FundingRateRepository,
    ArbitrageOpportunityRepository,
    MarginTypeOpportunityRepository,
    ArbitrageAnalyzerService,
    MarginTypeAnalyzerService,
    FundingFetcherScheduler,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class FundingModule {}
