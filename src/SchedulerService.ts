import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  
   
  private count = 0;

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    console.log('Heyyyyyyy', ++this.count, 'Scheduler executed!');
  }

  
//   @Interval(5000) 
//   handleInterval() {
//     console.log('Interval job executed every 5 seconds!');
//   }

  
//   @Timeout(10000)
//   handleTimeout() {
//     console.log('Timeout job executed after 10 seconds!');
//   }
}
