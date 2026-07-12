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
      throw new UnauthorizedException("Missing token");
    }

    const token = authHeader.slice("Bearer ".length);

    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (!["admin", "manager", "staff"].includes(payload.role)) {
        throw new UnauthorizedException("Insufficient permissions");
      }
      request.user = payload;
      request.admin = payload; // Keep for backward compatibility
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
