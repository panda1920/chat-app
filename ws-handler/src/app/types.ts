import {
  type onDisconnect,
  type onConnect,
  type onMessage,
  type onRequest,
} from './handlers'
import { type Message } from '../domain/models/message'

export type RequestHandler = typeof onRequest

export type ConnectHandler = typeof onConnect

export type MessageHandler = typeof onMessage

export type DisconnectHandler = typeof onDisconnect

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
