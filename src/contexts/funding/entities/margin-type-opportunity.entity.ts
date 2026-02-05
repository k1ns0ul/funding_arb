import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('margin_type_opportunities')
@Index(['asset', 'createdAt'])
@Index(['grossSpread', 'createdAt'])
export class MarginTypeOpportunityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  exchange: string;

  @Column()
  asset: string;

  @Column({ name: 'usdt_margined_contract' })
  usdtMarginedContract: string;

  @Column('decimal', { precision: 10, scale: 6, name: 'usdt_funding_rate' })
  usdtFundingRate: number;

  @Column('decimal', { precision: 18, scale: 8, name: 'usdt_price' })
  usdtPrice: number;

  @Column({ name: 'coin_margined_contract' })
  coinMarginedContract: string;

  @Column('decimal', { precision: 10, scale: 6, name: 'coin_funding_rate' })
  coinFundingRate: number;

  @Column('decimal', { precision: 18, scale: 8, name: 'coin_price' })
  coinPrice: number;

  @Column('decimal', { precision: 10, scale: 6, name: 'gross_spread' })
  grossSpread: number;

  @Column({ name: 'recommended_position' })
  recommendedPosition: string;

  @Column()
  action: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
