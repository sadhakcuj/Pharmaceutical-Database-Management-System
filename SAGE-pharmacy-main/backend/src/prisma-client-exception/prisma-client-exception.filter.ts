import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const msg = exception.message.replace(/\n/g, ''); // remove line break

    switch (exception.code) {
      case 'P2002':
        const status = HttpStatus.CONFLICT;
        res.status(status).json({
          statusCode: status,
          message: msg,
        });
        break;
      default:
        super.catch(exception, host);
        break;
    }
  }
}
