import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLatestMarginOpportunitiesQuery } from './get-latest-margin-opportunities.query';
import { MarginTypeOpportunityRepository } from '../repositories/margin-type-opportunity.repository';
import { MarginTypeOpportunityEntity } from '../entities/margin-type-opportunity.entity';

@QueryHandler(GetLatestMarginOpportunitiesQuery)
export class GetLatestMarginOpportunitiesHandler implements IQueryHandler<GetLatestMarginOpportunitiesQuery> {
  constructor(private readonly marginTypeOpportunityRepository: MarginTypeOpportunityRepository) {}

  async execute(query: GetLatestMarginOpportunitiesQuery): Promise<MarginTypeOpportunityEntity[]> {
    return this.marginTypeOpportunityRepository.findLatest(query.limit);
  }
}
