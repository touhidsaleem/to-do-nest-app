import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    console.log(
      `----------------------------- Incoming Request -------------------------------------`,
    );

    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Path: ${req.method} ${req.originalUrl}`);
    console.log(`Body:`, req.body);

    res.on('finish', () => {
      const elapsedTime = Date.now() - startTime;
      console.log(
        `----------------------------- Outgoing Response -------------------------------------`,
      );
      console.log(`Status: ${res.statusCode}`);
      console.log(`Elased time: ${elapsedTime}ms\n`);
    });

    next();
  }
}
