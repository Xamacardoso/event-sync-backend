import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export type JwtPayload = {
    sub: string;
    email: string;
    role: string;
};


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            // Retira o token do header da requisicao
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,

            // Usa a chave que ta la no env
            secretOrKey: config.getOrThrow('JWT_SECRET'),
        });
    }

    // Funcao chamada quando o token for validado
    async validate(payload: JwtPayload) {
        // Retorna os dados do usuário que estarão disponíveis no request
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}