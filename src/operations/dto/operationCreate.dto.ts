import { OperationType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
  isISO8601,
  registerDecorator,
} from 'class-validator';

export function IsGreaterThanOrEqual(
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
          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} deve ser maior ou igual a ${relatedPropertyName}.`;
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
  @Transform(({ value }) => {
    const isValidDate = isISO8601(value, { strict: true, strictSeparator: true });
    if (!isValidDate) {
      throw new Error(`Property "from_date" should be a valid ISO8601 date string`);
    }
    return new Date(value);
  })
  start: Date;

  @ValidateIf((o) => o.finish === null || o.finish === undefined)
  @IsInt()
  @Min(0)
  count?: number;

  @ValidateIf((o) => o.count === null || o.count === undefined)
  @Transform(({ value }) => {
    const isValidDate = isISO8601(value, { strict: true, strictSeparator: true });
    if (!isValidDate) {
      throw new Error(`Property "from_date" should be a valid ISO8601 date string`);
    }
    return new Date(value);
  })
  @IsGreaterThanOrEqual('start')
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
