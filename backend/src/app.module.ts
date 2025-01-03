import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import MessageRepository from './service/message-repository.service'

@Module({
  imports: [ConfigModule.forRoot({ cache: true })],
  controllers: [AppController],
  providers: [AppService, MessageRepository],
})
export class AppModule {}
