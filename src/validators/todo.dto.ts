import { IsString, MinLength } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  description!: string;
}

export class UpdateTodoDto {
  @IsString()
  title?: string;

  @IsString()
  description?: string;
}
