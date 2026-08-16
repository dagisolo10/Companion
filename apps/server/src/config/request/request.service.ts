import { Injectable } from "@nestjs/common";

@Injectable()
export class RequestService {
    private userId: string | null = null;

    setUserId(userId: string) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }
}
