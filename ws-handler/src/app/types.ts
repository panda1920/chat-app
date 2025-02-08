import { type Message } from '../domain/models'

export type Authorizer = () => Promise<boolean>
export type MessageHandler = (message: Message) => Promise<void>
export type OnConnectHandler = (
  chatId: Message['chatId'],
  sendMessage: (message: Message) => void,
) => Promise<void>
