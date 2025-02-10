// object that holds request specific information
// TODO: add user information here too
export type RequestContext = {
  url: string
  startAt: number
  traceId: string
  chatId: string
  userId: string
}
