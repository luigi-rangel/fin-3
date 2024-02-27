import {  IsInt, IsNotEmpty, Length } from "class-validator";



export class WalletCreateDto{
    @IsNotEmpty()
    name: string;

    @IsInt()
    userId: number;
}