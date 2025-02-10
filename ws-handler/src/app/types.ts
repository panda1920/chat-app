import { type Message } from '../domain/models/message'

export type Authorizer = () => Promise<boolean>
export type MessageHandler = (data: string) => Promise<void>
export type ConnectHandler = (
  sendMessage: (message: Message) => void,
) => Promise<void>
export type DisconnectHandler = (
  sendMessage: (message: Message) => void,
) => Promise<void>
