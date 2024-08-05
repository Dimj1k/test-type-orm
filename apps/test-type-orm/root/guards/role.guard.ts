import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLE } from '../entities/user/user.entity'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        )
        if (!requiredRoles) return true
        const { user } = context.switchToHttp().getRequest()
        // console.log(user)
        // return true
        return requiredRoles.some((role) => user.roles.includes(role))
    }
}
