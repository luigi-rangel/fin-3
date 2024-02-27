import { OperationType } from '@prisma/client';
import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    Min,
    ValidateIf,
    ValidationArguments,
    ValidationOptions,
    registerDecorator,
} from 'class-validator';

export function IsLessThanOrEqual(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            name: 'isLessThanOrEqual',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    return (
                        typeof value === 'number' &&
                        typeof relatedValue === 'number' &&
                        value <= relatedValue
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} deve ser menor ou igual a ${relatedPropertyName}.`;
                },
            },
        });
    };
}

export class OperationCreateDto {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    frequency: number;

    @IsNotEmpty()
    @IsDateString()
    start: Date;

    @ValidateIf((o) => o.finish === null || o.finish === undefined)
    @IsInt()
    @Min(0)
    count?: number;

    @ValidateIf((o) => o.count === null || o.count === undefined)
    @IsDateString()
    @IsLessThanOrEqual('start')
    finish?: Date;

    @IsNotEmpty()
    type: OperationType;

    @IsOptional()
    @IsInt()
    @Min(1)
    walletFromId?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    walletToId?: number;

    tags: string[];

    @IsNotEmpty()
    @Min(0)
    value: number;
}
