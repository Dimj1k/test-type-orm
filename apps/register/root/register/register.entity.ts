import { Exclude } from 'class-transformer'
import {
    Column,
    CreateDateColumn,
    Entity,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { Code } from '../dtos/register-code.dto'
import { addMinutes } from 'date-fns'
enum GENDER {
    MALE,
    FEMALE,
    UNKNOWN,
}

export class CacheUserInfo {
    @Column({ name: 'birthday_date' })
    birthdayDate?: Date

    @Column({
        type: 'enum',
        enum: GENDER,
        default: GENDER.UNKNOWN,
        name: 'gender',
    })
    gender?: GENDER
}

@Entity()
export class CacheUser {
    @ObjectIdColumn()
    @Exclude()
    _id: ObjectId

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    info: CacheUserInfo

    @Column()
    @Exclude()
    code: Code

    @Column()
    @Exclude()
    createdAt: Date = new Date()

    constructor(partial?: Partial<CacheUser>) {
        Object.assign(this, partial)
    }
}

export const ENTITIES = [CacheUser]
