import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { type Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
    constructor(@Inject(REQUEST) private readonly request: Request) {}

    getUserId() {
        return this.request.userId;
    }
}
