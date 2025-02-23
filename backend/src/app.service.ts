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

  async postMessage(message: string) {
    this.logger.log('Posting message')
    const result = await this.messageRepository.postMessage({
      id: 'test_id',
      chatId: 'test_chat',
      fromId: 'test_user_id',
      message,
      createdAt: Date.now(),
    })
    this.logger.log(
      'Message posting complete. Result: ' + JSON.stringify(result),
    )
  }

  async getMessages(chatId: string) {
    this.logger.log('Getting message')
    return await this.messageRepository.getMessages(chatId)
  }
}
