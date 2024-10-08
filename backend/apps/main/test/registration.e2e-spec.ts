import * as request from 'supertest'
import * as cookieParser from 'cookie-parser'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { TestingModule, Test } from '@nestjs/testing'
import { addDays } from 'date-fns'
import { DataSource, Db, MongoClient } from 'typeorm'
import { AppModule } from '../src/app.module'
import { POSTGRES_ENTITIES } from '../src/shared/entities'
import { User } from '../src/shared/entities/user'
import {
    registrationUserSuccess,
    secondUser,
    registrationUserFail,
    MockMailer,
} from './mocks'
import { sleep } from './utils'
import { CacheUser, MONGO_ENTITIES } from './mongo-entities'
import { ConfigService } from '@nestjs/config'

let app: INestApplication
let mongo: DataSource
let pg: DataSource
let server: any
beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider('Mailer')
        .useClass(MockMailer)
        .compile()
    let configService = moduleFixture.get(ConfigService)
    mongo = await new DataSource({
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        database: 'test',
        entities: MONGO_ENTITIES,
    }).initialize()
    pg = await new DataSource({
        type: configService.get<'postgres'>('TYPEORM_DRIVER'),
        host: configService.get('TYPEORM_HOST'),
        port: configService.get('TYPEORM_PORT'),
        username: configService.get('TYPEORM_USERNAME'),
        password: configService.get('TYPEORM_PASSWORD'),
        database: configService.get<string>('TYPEORM_DATABASE'),
        entities: POSTGRES_ENTITIES,
    }).initialize()
    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    app.setGlobalPrefix('api')
    app.use(cookieParser())

    await app.init()

    server = app.getHttpServer()
})
afterAll(async () => {
    await Promise.all([
        pg
            .createQueryBuilder()
            .delete()
            .from('users')
            .where('users.email = any (:emails)', {
                emails: [registrationUserSuccess.email, secondUser.email],
            })
            .execute(),
        mongo.getMongoRepository(CacheUser).deleteMany({}),
    ])
    await Promise.all([pg.destroy(), mongo.destroy()])
    await app.close()
})

describe('UserRegistration (e2e)', () => {
    test(`Registration User - success`, async () => {
        await request(server)
            .post('/api/registration')
            .send(registrationUserSuccess)
            .expect(201, {
                message:
                    'Если почта существует - Вы получите сообщение с кодом',
            })
        let { code } = await mongo.getMongoRepository(CacheUser).findOneBy({
            email: registrationUserSuccess.email,
        })
        await request(server)
            .post('/api/registration/confirm')
            .send({ code })
            .expect(201, { success: 'Вы успешно зарегистрировались' })
        await sleep(100)
        expect(
            await pg.getRepository(User).findOne({
                where: { email: registrationUserSuccess.email },
            }),
        ).not.toBeNull()
    })

    test(`Registration User - error`, async () => {
        await request(server)
            .post('/api/registration')
            .send(registrationUserFail)
            .expect(400, {
                message: [
                    '(user) => user.password and passwordConfirm does not match',
                ],
                error: 'Bad Request',
                statusCode: 400,
            })
        await request(server)
            .post('/api/registration')
            .send({
                ...registrationUserSuccess,
                email: 'asad@email.el',
                info: { birthdayDate: addDays(new Date(), 5) },
            })
            .expect(400)
        await request(server)
            .post('/api/registration')
            .send({
                ...registrationUserFail,
                passwordConfirm: registrationUserFail.password,
                info: {
                    gender: 3,
                },
            })
            .expect(400, {
                message: [
                    'info.gender must be one of the following values: 0, 1, 2',
                ],
                error: 'Bad Request',
                statusCode: 400,
            })
        await request(server)
            .post('/api/registration')
            .send(secondUser)
            .expect(201)
        let { code } = await mongo
            .getMongoRepository(CacheUser)
            .findOneBy({ email: secondUser.email })
        await request(server)
            .post('/api/registration/confirm')
            .send({ code })
            .expect(201)
        await request(server)
            .post('/api/registration')
            .send(secondUser)
            .expect(400, {
                message: "user's exists",
                error: 'Bad Request',
                statusCode: 400,
            })
    })
})
