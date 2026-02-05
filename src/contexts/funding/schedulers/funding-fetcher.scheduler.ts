import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { AnalyzeArbitrageCommand } from '../commands/analyze-arbitrage.command';

@Injectable()
export class FundingFetcherScheduler {
  constructor(private readonly commandBus: CommandBus) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    console.log('scheduled task started');
    await this.commandBus.execute(new AnalyzeArbitrageCommand());
  }
}
