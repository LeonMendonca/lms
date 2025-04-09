import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { getPayloadFromToken } from 'utils/jwt/jwt-main';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  private extractTokenFromHeadersOrCookies(request: Request) {
    const reqHeader = request.headers;
    //console.log(reqHeader.authorization);
    if (reqHeader.authorization) {
      const [type, token] = reqHeader.authorization.split(' ');
      return type === 'Bearer' ? token : undefined;
    } else if (request.cookies) {
      return (request.cookies['token'] as string) ?? undefined;
    } else {
      return undefined;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    //console.log(request);
    const token = this.extractTokenFromHeadersOrCookies(request);
    if (!token) {
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
