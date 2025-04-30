import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './common/interceptors/response.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') ?? 3000;

  // app.useGlobalInterceptors(new ResponseInterceptor());

  await app
    .listen(port)
    .then(() => {
      console.log(`Server Running On ${port}`);
    })
    .catch((err) => {
      console.log(`Error Running Server ${err}`);
    });
}
bootstrap();
