import { OmitType, PartialType } from "@nestjs/mapped-types";
import { Difficulty, Mode, QuestStatus } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class CreateQuestDto {
    @IsString()
    code!: string;

    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsEnum(Mode)
    mode!: Mode;

    @IsEnum(Difficulty)
    difficulty!: Difficulty;
}

export type Filter = "All" | QuestStatus;

export class UpdateQuestDto extends OmitType(PartialType(CreateQuestDto), ["code"]) {}
