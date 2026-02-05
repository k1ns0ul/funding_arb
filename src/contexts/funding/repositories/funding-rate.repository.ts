import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FundingRateEntity } from '../entities/funding-rate.entity';

@Injectable()
export class FundingRateRepository {
  constructor(
    @InjectRepository(FundingRateEntity)
    private readonly repository: Repository<FundingRateEntity>,
  ) {}

  async save(fundingRates: FundingRateEntity[]): Promise<void> {
    await this.repository.save(fundingRates);
  }

  async findRecent(limit: number): Promise<FundingRateEntity[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findBySymbol(normalizedSymbol: string, limit: number): Promise<FundingRateEntity[]> {
    return this.repository.find({
      where: { normalizedSymbol },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
