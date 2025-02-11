import { type authorize } from './auth'
import { type onDisconnect, type onConnect, type onMessage } from './handlers'
import { type Message } from '../domain/models/message'

export type ConnectHandler = typeof onConnect

export type Authorizer = typeof authorize

export type MessageHandler = typeof onMessage

export type DisconnectHandler = typeof onDisconnect

export type MessageReturner = (message: Message) => Promise<void>
