import { type Message } from '../domain/models/message'
import { type RequestContext } from '../domain/models/request-context'

export type Authorizer = (context: RequestContext) => Promise<boolean>
export type MessageHandler = (message: Message) => Promise<void>
export type ConnectHandler = (
  chatId: Message['chatId'],
  sendMessage: (message: Message) => void,
) => Promise<void>
export type DisconnectHandler = (
  chatId: Message['chatId'],
  sendMessage: (message: Message) => void,
) => Promise<void>
