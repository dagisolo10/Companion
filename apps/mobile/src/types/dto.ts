import { Difficulty, Mode } from "@/types/models";


export type UpdateUserDto = {
    name?: string;
    public?: boolean;
    username?: string;
};

export type CreateQuestDto = {
    mode: Mode;
    title: string;
    code: string;
    description: string;
    difficulty: Difficulty;
};

export type RemoveMemberDto = { partyMemberId: string };
export type TransferPartyDto = { partyMemberId: string };

export type CreatePartyDto = {
    name: string;
};

export type UpdatePartyDto = {
    name?: string;
};

export type UpdateQuestDto = Partial<Omit<CreateQuestDto, "code">>;
