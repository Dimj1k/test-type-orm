import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
    Scope,
} from '@nestjs/common'

export const Beetween = (
    leftSide: number = -Infinity,
    rightSide: number = Infinity,
) => {
    @Injectable({ scope: Scope.REQUEST })
    class Beetween implements PipeTransform {
        transform(value: number, metadata: ArgumentMetadata) {
            if (!value) return undefined
            value = +value
            if (isNaN(value))
                throw new BadRequestException('value is not number')
            if (value < leftSide || value > rightSide)
                throw new BadRequestException(
                    value > rightSide
                        ? `${value} > ${rightSide}`
                        : `${value} < ${leftSide}`,
                )
            return value
        }
    }
    return Beetween
}
