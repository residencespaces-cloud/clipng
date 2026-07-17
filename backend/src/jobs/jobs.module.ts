import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from '../notifications/notifications.module';
import { JobsService } from './jobs.service';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationsModule],
  providers: [JobsService],
})
export class JobsModule {}
