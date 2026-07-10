import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(email: string, password: string) {
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@sunnyskitchen.in";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";

    if (email !== adminEmail || password !== adminPassword) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const token = await this.jwtService.signAsync({
      sub: "admin",
      email,
      role: "admin",
    });

    return { accessToken: token, email };
  }
}
