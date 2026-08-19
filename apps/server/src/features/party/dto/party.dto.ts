import { PartialType } from "@nestjs/mapped-types";
import { IsString } from "class-validator";

export class CreatePartyDto {
    @IsString()
    name!: string;
}

export class UpdatePartyDto extends PartialType(CreatePartyDto) {}
