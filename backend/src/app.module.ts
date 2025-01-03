import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import MessageRepository from './service/message-repository.service'
import loggerConfig from './config/logger'

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),
    LoggerModule.forRoot(loggerConfig),
  ],
  controllers: [AppController],
  providers: [AppService, MessageRepository],
})
export class AppModule {}
