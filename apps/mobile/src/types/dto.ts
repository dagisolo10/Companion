import { Difficulty, Mode } from "./models";

export type UpdateUserDto = {
    name?: string;
    username?: string;
};

export type CreatePartyDto = {
    name: string;
};

export type UpdatePartyDto = {
    name?: string;
};

export type TransferPartyDto = {
    partyMemberId: string;
};

export type RemoveMemberDto = {
    partyMemberId: string;
};

export type CreateQuestDto = {
    mode: Mode;
    title: string;
    partyId: string;
    description: string;
    difficulty: Difficulty;
};

export type UpdateQuestDto = Partial<Omit<CreateQuestDto, "partyId">>;
