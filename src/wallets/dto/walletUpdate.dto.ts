import { IsNotEmpty } from "class-validator";


export class UpdateWalletDto {
    @IsNotEmpty()
    name: string
}