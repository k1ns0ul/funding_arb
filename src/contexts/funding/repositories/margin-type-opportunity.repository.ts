import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { MarginTypeOpportunityEntity } from '../entities/margin-type-opportunity.entity';

@Injectable()
export class MarginTypeOpportunityRepository {
  constructor(
    @InjectRepository(MarginTypeOpportunityEntity)
    private readonly repository: Repository<MarginTypeOpportunityEntity>,
  ) {}

  async save(opportunities: MarginTypeOpportunityEntity[]): Promise<void> {
    await this.repository.save(opportunities);
  }

  async findLatest(limit: number): Promise<MarginTypeOpportunityEntity[]> {
    return this.repository.find({
      order: { grossSpread: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async deleteOld(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await this.repository.delete({
      createdAt: LessThan(oneHourAgo),
    });
  }
}
