import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
