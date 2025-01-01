import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { Config } from './config/env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = app.get(ConfigService<Config>).get('PORT', { infer: true })
  await app.listen(port)
}
bootstrap()
