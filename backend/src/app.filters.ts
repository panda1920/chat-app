import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'
import { PinoLogger } from 'nestjs-pino'

@Catch(Error)
export class AppExceptionFilter implements ExceptionFilter {
  // excplicitly using pinologger interface for obj merging feature
  // https://github.com/pinojs/pino/blob/main/docs/api.md#info
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>()
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let cause = undefined

    if (exception instanceof HttpException) {
      cause = exception.cause
      statusCode = exception.getStatus()
    }

    this.logger.error({ cause, stack: exception.stack }, exception.message)

    return res.status(statusCode).json({
      message: exception.message,
    })
  }
}
