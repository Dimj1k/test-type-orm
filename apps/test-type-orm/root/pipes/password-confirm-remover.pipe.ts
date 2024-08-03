import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { CreateUserDto } from '../user/dto/create-user.dto'

@Injectable()
export class PasswordConfirmRemover implements PipeTransform {
    transform(user: CreateUserDto, metadata: ArgumentMetadata) {
        if (metadata.type !== 'body') return user
        return (({ passwordConfirm, ...newUser }) => newUser)(user)
    }
}
