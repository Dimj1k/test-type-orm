import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { BooksService } from './books.service'
import { Roles } from '../decorators/roles.decorator'
import { ROLE } from '../entities/user/user.entity'
import { RolesGuard } from '../guards/role.guard'
import { JwtGuard } from '../guards/jwt.guard'
import { Request } from 'express'
import { JwtPayload } from '../interfaces/jwt-controller.interface'
import { FindAllBooksDto } from './dto/find-all-books.dto'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@ApiTags('books')
@UsePipes(new ValidationPipe())
@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Post('/create')
    create(@Body() createBooksDto: CreateBookDto) {
        return this.booksService.create(createBooksDto)
    }

    @Post('/find')
    findAll(@Body() { skip, limit }: FindAllBooksDto) {
        return this.booksService.findAll(skip, limit)
    }

    @Get('/find/:nameBook')
    findOne(@Param('nameBook') nameBook: string) {
        return this.booksService.findOne(nameBook)
    }

    @ApiBearerAuth()
    @UseGuards(JwtGuard)
    @Get('/getOwnedBooks')
    getOwnedBooks(@Req() request: Request & { user: JwtPayload }) {
        let user = request.user
        return this.booksService.getBooksUser(user.userId)
    }

    @ApiBearerAuth()
    @UseGuards(JwtGuard)
    @Post('/addBook/:nameBook')
    addBook(
        @Param('nameBook') nameBook: string,
        @Req() request: Request & { user: JwtPayload },
    ) {
        let user = request.user
        return this.booksService.addBook(user.userId, nameBook)
    }

    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Patch('/update/:id')
    update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.booksService.update(id, updateBookDto)
    }

    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Delete('/delete/:id')
    remove(@Param('id') id: string) {
        return this.booksService.remove(id)
    }
}
