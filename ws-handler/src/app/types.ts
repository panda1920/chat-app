import { type Message } from '../domain/models/message'

export type MessageReturner = (message: Message) => Promise<void>

// object that holds request specific information
// TODO: add user information here too
export type RequestContext = {
  url: string
  startAt: number
  traceId: string
  chatId: string
  userId: string
}
