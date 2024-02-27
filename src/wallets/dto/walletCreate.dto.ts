import { IsInt, IsNotEmpty } from "class-validator";



export class WalletCreateDto{
    @IsNotEmpty()
    name: string;

    @IsInt()
    userId: number;
}