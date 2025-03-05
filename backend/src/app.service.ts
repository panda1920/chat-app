import { Injectable, Logger } from '@nestjs/common'
import MessageRepository from './service/message-repository.service'

@Injectable()
export class AppService {
  constructor(private readonly messageRepository: MessageRepository) {}
  private readonly logger = new Logger('AppeService')

  getHello(): string {
    this.logger.log('You have called getHello')
    return 'Hello New Year!'
  }

  async getMessages(chatId: string, lastCreatedAt?: number) {
    this.logger.log('Getting message')
    return await this.messageRepository.getMessages(chatId, lastCreatedAt)
  }
}
