import { Difficulty, Mode } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class CreateQuestDto {
    @IsString()
    partyId!: string;

    @IsString()
    recipientId!: string;

    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsEnum(Mode)
    mode!: Mode;

    @IsEnum(Difficulty)
    difficulty!: Difficulty;
}
