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
    const result = await this.messageRepository.postMessage(message)
    this.logger.log(
      'Message posting complete. Result: ' + JSON.stringify(result),
    )
  }
}
