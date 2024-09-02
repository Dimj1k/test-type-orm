import { Book } from './books/book.entity'
import { Genre } from './genres'
import { User, UserInfo } from './user/user.entity'

export const POSTGRES_ENTITIES = [Genre, Book, User, UserInfo]
