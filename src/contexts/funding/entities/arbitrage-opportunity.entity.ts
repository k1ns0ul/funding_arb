import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('arbitrage_opportunities')
@Index(['normalizedSymbol', 'createdAt'])
@Index(['spread', 'createdAt'])
export class ArbitrageOpportunityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'normalized_symbol' })
  normalizedSymbol: string;

  @Column('decimal', { precision: 10, scale: 6 })
  spread: number;

  @Column('decimal', { precision: 10, scale: 6, name: 'max_rate' })
  maxRate: number;

  @Column('decimal', { precision: 10, scale: 6, name: 'min_rate' })
  minRate: number;

  @Column('jsonb', { name: 'exchanges_data' })
  exchangesData: Array<{
    exchange: string;
    symbol: string;
    rate: number;
    price: number;
  }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
