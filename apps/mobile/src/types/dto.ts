import { Difficulty, Mode } from "@companion/shared-types";


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
    expirationHours?: number;
};

export type RemoveMemberDto = { partyMemberId: string };
export type TransferPartyDto = { partyMemberId: string };

export type CreatePartyDto = {
    name: string;
    public?: boolean;
};

export type UpdatePartyDto = {
    name?: string;
    public?: boolean;
};

export type UpdateQuestDto = Partial<Omit<CreateQuestDto, "code">>;
