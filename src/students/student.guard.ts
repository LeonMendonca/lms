import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { getPayloadFromToken } from 'src/jwt/jwt-main';

@Injectable()
export class StudentAuthGuard implements CanActivate {

    private extractTokenFromHeadersOrCookies(request: Request) {
        const reqHeader = request.headers;
        console.log(reqHeader.authorization);
        if(reqHeader.authorization) {
           const [type, token] = reqHeader.authorization.split(" ");
           return type === 'Bearer' ? token : undefined;
        } else if (request.cookies) {
            return request.cookies['token'] as string ?? undefined;
        } else {
            return undefined;
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest() as Request;
        console.log(request);
        const token = this.extractTokenFromHeadersOrCookies(request)
        if(!token) {
            throw new UnauthorizedException();
        }
        try {
            request['user'] = getPayloadFromToken(token);
        } catch (error) {
            throw new UnauthorizedException();
        }
        return true;
    }
}





/*
let tokenFrom: 'authorization' | 'cookie' | undefined = undefined;
        let splitBy: ' ' | '=' | undefined = undefined;
        let type: 'Bearer' | 'token' | undefined = undefined;
        if(reqHeader.authorization) {
            tokenFrom = 'authorization';
            splitBy = ' ';
        } else if(reqHeader.cookie){
            tokenFrom = 'cookie';
            splitBy = '=';
        } else {
            console.log("No headers");
            return ;
        }
        if(!tokenFrom || !splitBy) {
            console.log("No token", tokenFrom, splitBy);
            return
        }
        const [typeToken, token] = request.headers[tokenFrom]?.split(splitBy) ?? [];
        console.log("Cookie from either",type, token);
        return type === 'Bearer' || type === 'token' ? token : undefined;
*/