import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name: string;
}

export class UpdateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name: string;
}
