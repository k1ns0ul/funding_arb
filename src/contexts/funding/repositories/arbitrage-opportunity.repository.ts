import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ArbitrageOpportunityEntity } from '../entities/arbitrage-opportunity.entity';

@Injectable()
export class ArbitrageOpportunityRepository {
  constructor(
    @InjectRepository(ArbitrageOpportunityEntity)
    private readonly repository: Repository<ArbitrageOpportunityEntity>,
  ) {}

  async save(opportunities: ArbitrageOpportunityEntity[]): Promise<void> {
    await this.repository.save(opportunities);
  }

  async findLatest(limit: number): Promise<ArbitrageOpportunityEntity[]> {
    return this.repository.find({
      order: { spread: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async findBySymbol(
    normalizedSymbol: string,
    limit: number,
  ): Promise<ArbitrageOpportunityEntity[]> {
    return this.repository.find({
      where: { normalizedSymbol },
      order: { createdAt: 'DESC' },
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
