import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "src/infra/database/drizzle.provider";
import { JwtService } from "@nestjs/jwt";
import { LoginDto, RegisterDto } from "src/presentation/dtos/auth.dto";
import { users } from "src/infra/database/schema";
import * as bcrypt from 'bcrypt';
import * as schema from 'src/infra/database/schema';
import { eq } from "drizzle-orm";

@Injectable()
export class AuthService {
    constructor (
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
        private jwtService: JwtService,
    ) {}

    // Registra um novo usuário
    async register(registerDto: RegisterDto) {
        // Verifica se o usuário já existe
        const existingUser = await this.db.query.users.findFirst({
            where: eq(users.email, registerDto.email),
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }
        
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(registerDto.password, salt);

        // Salva no banco de dados
        const newUser = await this.db.insert(users).values({
            name: registerDto.name,
            email: registerDto.email,
            passwordHash: hashedPassword,
            role: registerDto.role,
            city: registerDto.city,
        }).returning({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            role: schema.users.role,
        });

        return newUser;
    }

    // Login de usuário
    async login(loginDto: LoginDto) {
        const user = await this.db.query.users.findFirst({
            where: eq(users.email, loginDto.email),
        });

        // Validaa a senha
        if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Gera o token JWT
        const payload = { email: user.email, sub: user.id , role: user.role};
        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }, // Retorna o usuário logado
        };
    }
}
