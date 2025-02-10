import { AsyncLocalStorage } from 'node:async_hooks'
import { InternalServerError } from './errors'
import { type RequestContext } from '../domain/models/request-context'

export const contextStorage = new AsyncLocalStorage<RequestContext>()

export function getContext() {
  const store = contextStorage.getStore()
  if (!store) throw new InternalServerError('Context not found!')

  return store
}
