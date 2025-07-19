import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';


@Injectable()
export class SchedulerService {

  constructor(private readonly prisma: PrismaService) { }

  private count = 0;

  // @Cron(CronExpression.EVERY_30_SECONDS)
  // handleCron() {
  //   console.log('Heyyyyyyy', ++this.count, 'Scheduler executed!');
  // }


  // This cron job runs every hour
  // It checks for users whose suspended_until date is less than or equal to the current date
@Cron(CronExpression.EVERY_10_MINUTES) 
async handleHourlyCron() {
  const now = new Date();  
  console.log('Hourly Cron executed at:', now);
  
  const usersToUpdate = await this.prisma.user.findMany({
    where: {
      suspended_until: {
        lte: now,  
      },
      suspended_at: {
        not: null,  
      },
    },
    select: {
      id: true, 
      suspended_at: true,
      suspended_until: true,
    },
  });

  for (const user of usersToUpdate) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        suspended_at: null, 
        suspended_until: null,
        status: 1,
      },
    });

    console.log(`User ${user.id} has been unsuspended.`);
  }
}


//update posts status to expired if the post is active and accepted and the expires date is less than or equal to now
// This cron job runs every 10 seconds
@Cron(CronExpression.EVERY_10_SECONDS)
async handlePostUpdate() {
  const now = new Date();  
  console.log('Cron executed at:', now);
   const updatePostsStatus = await this.prisma.services.findMany({
    where:{
      status:'active',
      is_accepted: true,
      expires_date: {
        lte: now,
      },
    }
   })

  for (const post of updatePostsStatus) {
    await this.prisma.services.update({
      where: { id: post.id },
      data: {
        status: "expired",

      },
    });

    console.log(`Post ${post.id} has been updated to expired.`);


  }
}


}