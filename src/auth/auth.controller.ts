import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // This means all routes here start with http://localhost:3000/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    // In a real app, we would use DTOs to validate this incoming data
    return this.authService.registerUser(
      body.fullName,
      body.email,
      body.password,
    );
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.loginUser(body.email, body.password);
  }

  @Post('register-driver')
  async registerDriver(@Body() body: any) {
    return this.authService.registerDriver(
      body.fullName,
      body.email,
      body.password,
      body.vehicleModel,
      body.licensePlate,
    );
  }

  @Post('login-driver')
  async loginDriver(@Body() body: any) {
    return this.authService.loginDriver(body.email, body.password);
  }
}
