import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { AppClusterService } from './cluster.service'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.setGlobalPrefix('api')
    app.disable('x-powered-by')
    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())
    await app.listen(3002)
}
AppClusterService.clusterize(bootstrap, 2)
// bootstrap()
