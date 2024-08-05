import { Module } from '@nestjs/common'
import { BooksService } from './books.service'
import { BooksController } from './books.controller'
import { JwtStrategy } from '../strategy/jwt.strategy'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Book } from '../entities/books/book.entity'
import { User } from '../entities/user/user.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Book, User])],
    controllers: [BooksController],
    providers: [BooksService, JwtStrategy],
    exports: [],
})
export class BooksModule {}
