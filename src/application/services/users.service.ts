import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../../infra/database/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infra/database/schema';
import { eq } from 'drizzle-orm';
import { UpdateUserDto, UserDetailsDto } from '../../presentation/dtos/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async getProfile(userId: string): Promise<UserDetailsDto> {
        const user = await this.db.query.users.findFirst({
            where: eq(schema.users.id, userId),
            columns: {
                name: true,
                email: true,
                city: true,
                photoUrl: true,
                role: true,
                organizerRating: true,
                visibilityParticipation: true,
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            ...user,
            role: user.role ?? 'user',
            organizerRating: user.organizerRating ?? 0,
            visibilityParticipation: user.visibilityParticipation ?? true,
        };
    }

    async updateProfile(userId: string, dto: UpdateUserDto) {
        const [updatedUser] = await this.db
            .update(schema.users)
            .set(dto)
            .where(eq(schema.users.id, userId))
            .returning({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
                city: schema.users.city,
                photoUrl: schema.users.photoUrl,
                role: schema.users.role,
            });

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return updatedUser;
    }
}
