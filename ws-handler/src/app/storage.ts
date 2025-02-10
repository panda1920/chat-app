import { AsyncLocalStorage } from 'node:async_hooks'
import { type RequestContext } from '../domain/models/request-context'

export const contextStorage = new AsyncLocalStorage<RequestContext>()
