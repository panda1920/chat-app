import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Post('/messages')
  postMessage(@Body() body: { message: string }) {
    return this.appService.postMessage(body.message)
  }

  @Get('/chat/:chatId')
  getMessages(
    @Param('chatId') chatId: string,
    @Query('lastCreatedAt') lastCreatedAt?: number,
  ) {
    return this.appService.getMessages(chatId, lastCreatedAt)
  }
}
