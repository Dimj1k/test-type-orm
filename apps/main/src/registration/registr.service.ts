import { Injectable, OnModuleInit } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import {
    Client,
    ClientGrpc,
    RpcException,
    Transport,
} from '@nestjs/microservices'
import { RegisterController } from '../interfaces/register-controller.interface'
import { join } from 'path'
import { Metadata } from '@grpc/grpc-js'
import { RegisterCode } from './dto/register-token.dto'
import { MONGO_DB_LOCATION } from '../constants'
import { catchError, lastValueFrom, take, throwError, timeout } from 'rxjs'

@Injectable()
export class RegistrService implements OnModuleInit {
    private registerService: RegisterController
    @Client({
        transport: Transport.GRPC,
        options: {
            url: MONGO_DB_LOCATION,
            package: 'mongo',
            protoPath: join(
                __dirname,
                __dirname.includes('registration') ? '..' : '.',
                'protos',
                'mongo.proto',
            ),
        },
    })
    client: ClientGrpc

    onModuleInit() {
        this.registerService =
            this.client.getService<RegisterController>('RegisterController')
    }

    async createInCacheUser(createUserDto: CreateUserDto, metadata?: Metadata) {
        return lastValueFrom(
            this.registerService.createInCacheUser(createUserDto).pipe(
                take(1),
                catchError((error) =>
                    throwError(() => new RpcException(error.response)),
                ),
            ),
        )
    }

    async returnByTokenUser(token: RegisterCode) {
        return lastValueFrom(
            this.registerService.returnByTokenUser(token).pipe(
                take(1),
                catchError((error) =>
                    throwError(() => new RpcException(error.response)),
                ),
            ),
        )
    }
}
