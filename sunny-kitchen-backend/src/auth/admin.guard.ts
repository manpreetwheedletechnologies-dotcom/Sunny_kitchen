import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing admin token");
    }

    const token = authHeader.slice("Bearer ".length);

    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (payload.role !== "admin") {
        throw new UnauthorizedException("Not an admin token");
      }
      request.admin = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired admin token");
    }
  }
}
