import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsString } from "class-validator";

export class CreatePartyDto {
    @IsString()
    name!: string;

    @IsBoolean()
    public = true;
}

export class UpdatePartyDto extends PartialType(CreatePartyDto) {}

export class TransferPartyDto {
    @IsString()
    partyMemberId!: string;
}
