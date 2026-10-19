import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    let payload: { id: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    request['user'] = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return true;
  }

  private extractTokenFromHeader(request: {
    headers: Record<string, string | undefined>;
  }): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
