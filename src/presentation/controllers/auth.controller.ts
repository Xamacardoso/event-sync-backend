import { AuthService } from "src/application/services/auth.service";
import { LoginDto, RegisterDto } from "../dtos/auth.dto";
import { Controller, Get, UseGuards, Post } from "@nestjs/common";
import { Body } from "@nestjs/common";
import { JwtAuthGuard } from "src/infra/auth/jwt-auth.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";

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

    @Get('check-token')
    @UseGuards(JwtAuthGuard) // Protege a rota com JWT. So funciona se tiver logado
    async checkToken(@CurrentUser() user: any) {
        return { message: 'Token is valid' };
    }
}