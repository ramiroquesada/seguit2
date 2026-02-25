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

export class UpdateCityDto {
  @IsString()
  @IsOptional()
  name?: string;
}

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  cityId?: number;
}

export class UpdateOfficeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  sectionId?: number;
}

export class MergeOfficesDto {
  @IsInt()
  targetId: number;

  @IsInt({ each: true })
  sourceIds: number[];
}
