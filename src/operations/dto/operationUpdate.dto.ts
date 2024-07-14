import { OperationType } from '@prisma/client';
import { IsGreaterThanOrEqual, OperationCreateDto } from './operationCreate.dto';
import { IsOptional, IsArray, IsString, IsInt, Min, ValidateIf, IsNotEmpty, IsDateString, registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, isISO8601 } from 'class-validator';
import validator from 'class-validator';
import { Transform } from 'class-transformer';

// Define new constraint that checks the existence of sibling properties
@ValidatorConstraint({ async: false })
class IsNotSiblingOfConstraint implements ValidatorConstraintInterface {

  validate(value: any, args: ValidationArguments) {
    if (value !== undefined) {
      return this.getFailedConstraints(args).length === 0
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} cannot exist alongside the following defined properties: ${this.getFailedConstraints(args).join(', ')}`
  }

  getFailedConstraints(args: ValidationArguments) {
    return args.constraints.filter((prop) => args.object[prop] !== undefined)
  }
}

// Create Decorator for the constraint that was just created
function IsNotSiblingOf(props: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: props,
      validator: IsNotSiblingOfConstraint
    });
  };
}

// Helper function for determining if a prop should be validated
function incompatibleSiblingsNotPresent(incompatibleSiblings: string[]) {
  return function (o, v) {
    return Boolean(
      v !== undefined || // Validate if prop has value
      incompatibleSiblings.every((prop) => o[prop] === undefined) // Validate if all incompatible siblings are not defined
    )
  }
}


export class OperationUpdateDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  frequency?: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
    const isValidDate = isISO8601(value, { strict: true, strictSeparator: true });
    if (!isValidDate) {
      throw new Error(`Property "from_date" should be a valid ISO8601 date string`);
    }
    return new Date(value);
  })
  updateStart: Date;

  @IsNotSiblingOf(['finish'])
  @ValidateIf(incompatibleSiblingsNotPresent(['finish']))
  @IsInt()
  @Min(1)
  count?: number ;

  @IsNotSiblingOf(['count'])
  @ValidateIf(incompatibleSiblingsNotPresent(['count']))
  @Transform(({ value }) => {
    const isValidDate = isISO8601(value, { strict: true, strictSeparator: true });
    if (!isValidDate) {
      throw new Error(`Property "from_date" should be a valid ISO8601 date string`);
    }
    return new Date(value);
  })
  @IsGreaterThanOrEqual('updateStart')
  finish?: Date;

  @IsOptional()
  type?: OperationType;

  @IsOptional()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}