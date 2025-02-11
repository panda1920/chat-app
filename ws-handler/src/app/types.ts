import { type authorize } from './auth'
import { type onDisconnect, type onConnect, type onMessage } from './handlers'

export type ConnectHandler = typeof onConnect

export type Authorizer = typeof authorize

export type MessageHandler = typeof onMessage

export type DisconnectHandler = typeof onDisconnect
