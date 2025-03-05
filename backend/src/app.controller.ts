import { Controller, Get, Param, Query } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('/chat/:chatId')
  getMessages(
    @Param('chatId') chatId: string,
    @Query('lastCreatedAt') lastCreatedAt?: number,
  ) {
    return this.appService.getMessages(chatId, lastCreatedAt)
  }
}
