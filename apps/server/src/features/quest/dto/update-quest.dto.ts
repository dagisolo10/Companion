import { CreateQuestDto } from "./create-quest.dto";

import { OmitType, PartialType } from "@nestjs/mapped-types";

export class UpdateQuestDto extends OmitType(PartialType(CreateQuestDto), ["partyId"]) {}
