import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreatePartyDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsBoolean()
    public?: boolean;
}

export class UpdatePartyDto extends PartialType(CreatePartyDto) {}

export class TransferPartyDto {
    @IsString()
    partyMemberId!: string;
}
