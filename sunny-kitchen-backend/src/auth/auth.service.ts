import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    
    if (!user) {
      // Fallback for initial setup if no users exist
      const adminEmail = process.env.ADMIN_EMAIL ?? "admin@sunnyskitchen.in";
      const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
      
      if (email === adminEmail && password === adminPassword) {
        const token = await this.jwtService.signAsync({
          sub: "admin-fallback",
          id: "admin-fallback",
          email,
          role: "admin",
        });
        return { accessToken: token, email, role: "admin" };
      }
      throw new UnauthorizedException("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const token = await this.jwtService.signAsync({
      sub: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return { accessToken: token, email: user.email, role: user.role };
  }
}
