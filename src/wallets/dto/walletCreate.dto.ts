import { IsInt, IsNotEmpty, Min } from "class-validator";



export class WalletCreateDto{
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(1)
    userId: number;
}