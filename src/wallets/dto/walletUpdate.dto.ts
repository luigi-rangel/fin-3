import { IsNotEmpty } from "class-validator";


export class WalletUpdateDto {
    @IsNotEmpty()
    name: string
}