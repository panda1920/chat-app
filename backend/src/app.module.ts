import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { LoggerModule } from 'nestjs-pino'
import { AppController } from './app.controller'
import { AppExceptionFilter } from './app.filters'
import { AppService } from './app.service'
import loggerConfig from './config/logger'
import MessageRepository from './service/message-repository.service'

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),
    LoggerModule.forRoot(loggerConfig),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    AppService,
    MessageRepository,
  ],
})
export class AppModule {}
