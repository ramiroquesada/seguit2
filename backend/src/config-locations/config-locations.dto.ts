import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCityDto {
  @IsString()
  name: string;
}

export class CreateSectionDto {
  @IsString()
  name: string;

  @IsInt()
  cityId: number;
}

export class CreateOfficeDto {
  @IsString()
  name: string;

  @IsInt()
  sectionId: number;
}

export class UpdateNameDto {
  @IsString()
  @IsOptional()
  name?: string;
}
