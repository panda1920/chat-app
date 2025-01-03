import { Injectable } from '@nestjs/common'
import MessageRepository from './service/message-repository.service'

@Injectable()
export class AppService {
  constructor(private readonly messageRepository: MessageRepository) {}

  getHello(): string {
    return 'Hello New Year!'
  }

  async postMessage(message: string) {
    return await this.messageRepository.postMessage(message)
  }
}
