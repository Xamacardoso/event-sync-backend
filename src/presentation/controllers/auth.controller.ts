import { AuthService } from "src/application/services/auth.service";
import { LoginDto, RegisterDto } from "../dtos/auth.dto";
import { Controller, Post } from "@nestjs/common";
import { Body } from "@nestjs/common";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}