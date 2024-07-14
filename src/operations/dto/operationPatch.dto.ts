import { Type } from "class-transformer"
import { IsInt, IsOptional, Min, ValidateIf } from "class-validator"


export class OperationPatchDto {
    @Min(1)
    @IsInt()
    @ValidateIf((o) => o.walletToId === null || o.walletToId === undefined)
    walletFromId?: number | null

    @Min(1)
    @IsInt()
    @ValidateIf((o) => o.walletFromId === null || o.walletFromId === undefined)
    walletToId?: number | null
}