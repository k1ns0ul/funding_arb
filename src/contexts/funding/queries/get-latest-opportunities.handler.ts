import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLatestOpportunitiesQuery } from './get-latest-opportunities.query';
import { ArbitrageOpportunityRepository } from '../repositories/arbitrage-opportunity.repository';
import { ArbitrageOpportunityEntity } from '../entities/arbitrage-opportunity.entity';

@QueryHandler(GetLatestOpportunitiesQuery)
export class GetLatestOpportunitiesHandler implements IQueryHandler<GetLatestOpportunitiesQuery> {
  constructor(private readonly arbitrageOpportunityRepository: ArbitrageOpportunityRepository) {}

  async execute(query: GetLatestOpportunitiesQuery): Promise<ArbitrageOpportunityEntity[]> {
    const allOpportunities = await this.arbitrageOpportunityRepository.findLatest(1000);

    if (allOpportunities.length === 0) {
      return [];
    }

    const latestDate = allOpportunities[0].createdAt;

    const latestOpportunities = allOpportunities.filter(
      (opp) => opp.createdAt.getTime() === latestDate.getTime(),
    );

    return latestOpportunities.sort((a, b) => b.spread - a.spread).slice(0, query.limit);
  }
}
