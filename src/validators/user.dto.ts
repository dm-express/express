import { IsEmail, IsString, MinLength } from "class-validator";

// joi

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class UpdateUserDto {
  @IsString()
  @MinLength(2)
  name?: string;

  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  password?: string;
}
