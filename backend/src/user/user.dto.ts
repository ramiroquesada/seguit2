import { IsString, MinLength, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  fullName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
