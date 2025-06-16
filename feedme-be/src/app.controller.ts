import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('add-normal')
  addNormal(@Body() body: { id: String }) {
    this.appService.addNormal();
    return { message: 'Normal Order Added' };
  }

  @Post('add-vip')
  addVip(@Body() body: { id: String }) {
    this.appService.addVip();
    return { message: 'VIP Order Added' };
  }

  @Post('add-bot')
  addBot() {
    this.appService.addBot();
    return { message: 'Bot Added' };
  }

  @Post('remove-bot')
  removeLastBot() {
    this.appService.removeLastBot();
    return { message: 'Bot Removed' };
  }
}
