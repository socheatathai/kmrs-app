import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

import { I18nService } from '../i18n/i18n.service';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly i18n: I18nService,
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    const header = request.headers['accept-language'] as
      | string
      | string[]
      | undefined;
    const requestedLanguage = Array.isArray(header) ? header[0] : header;
    const language = this.i18n.resolveLanguage(requestedLanguage);
    const requestIdHeader = request.headers['x-request-id'];
    const requestId = Array.isArray(requestIdHeader)
      ? requestIdHeader[0]
      : requestIdHeader || randomUUID();

    response.setHeader('x-request-id', requestId);

    this.requestContext.run({ language, requestId }, () => next());
  }
}
