import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('funding_rates')
@Index(['exchange', 'symbol', 'createdAt'])
@Index(['normalizedSymbol', 'createdAt'])
export class FundingRateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  exchange: string;

  @Column()
  symbol: string;

  @Column({ name: 'normalized_symbol' })
  normalizedSymbol: string;

  @Column('decimal', { precision: 10, scale: 6 })
  rate: number;

  @Column('decimal', { precision: 10, scale: 6, name: 'hourly_rate' })
  hourlyRate: number;

  @Column('decimal', { precision: 18, scale: 8 })
  price: number;

  @Column({ type: 'timestamp', name: 'next_funding_time' })
  nextFundingTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
