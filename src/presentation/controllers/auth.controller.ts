import { AuthService } from "src/application/services/auth.service";
import { LoginDto, RegisterDto } from "../dtos/auth.dto";
import { Controller, Get, UseGuards, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { Body } from "@nestjs/common";
import { JwtAuthGuard } from "src/infra/auth/jwt-auth.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK) // Retorna 200 ao invés de 201
    @ApiOperation({ summary: 'User login, obtaining jwt token' })
    @ApiResponse({ status: 200, description: 'Login successful, JWT token returned' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('check-token')
    @UseGuards(JwtAuthGuard) // Protege a rota com JWT. So funciona se tiver logado
    @ApiBearerAuth() // Adiciona o ícone de cadeado no Swagger
    @ApiOperation({ summary: 'Check if JWT token is valid' })
    @ApiResponse({ status: 200, description: 'Token is valid' })
    @ApiResponse({ status: 401, description: 'Unauthorized (invalid or inexistent token)' })
    async checkToken(@CurrentUser() user: any) {
        return { message: 'Token is valid' };
    }
}