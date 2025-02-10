export class WsHandlerError extends Error {
  statusCode = 500
}

export class InternalServerError extends WsHandlerError {
  statusCode = 500
}

export class ParsingError extends WsHandlerError {
  statusCode = 400
}

export class UnauthorizedError extends WsHandlerError {
  statusCode = 401
}
