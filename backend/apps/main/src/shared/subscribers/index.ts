import { BookSubscriber } from './book.subscriber'
import { UserSubscriber } from './user.subscriber'

export const POSTGRES_SUBSCRIBERS = [UserSubscriber, BookSubscriber]
