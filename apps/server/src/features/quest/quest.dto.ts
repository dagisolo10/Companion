import { OmitType, PartialType } from "@nestjs/mapped-types";
import { Difficulty, Mode, QuestStatus } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

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

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(720)
    expirationHours?: number;
}

export type Filter = "All" | QuestStatus;

export class UpdateQuestDto extends OmitType(PartialType(CreateQuestDto), ["code", "expirationHours"]) {}
