import { type Message } from '../domain/models/message'

export type Authorizer = () => Promise<boolean>
export type MessageHandler = (message: Message) => Promise<void>
export type ConnectHandler = (
  chatId: Message['chatId'],
  sendMessage: (message: Message) => void,
) => Promise<void>
export type DisconnectHandler = (
  chatId: Message['chatId'],
  sendMessage: (message: Message) => void,
) => Promise<void>
