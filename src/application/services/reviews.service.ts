import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../../infra/database/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infra/database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { CreateReviewDto } from '../../presentation/dtos/review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async create(userId: string, dto: CreateReviewDto) {
        // 1. Verificar se o evento existe e está finalizado
        const event = await this.db.query.events.findFirst({
            where: eq(schema.events.id, dto.eventId),
        });

        if (!event) throw new NotFoundException('Evento não encontrado');
        if (event.status !== 'finished') throw new BadRequestException('Apenas eventos finalizados podem ser avaliados.');

        // 2. Verificar se o usuário participou E fez check-in
        const registration = await this.db.query.registrations.findFirst({
            where: and(
                eq(schema.registrations.eventId, dto.eventId),
                eq(schema.registrations.userId, userId),
                eq(schema.registrations.status, 'checked_in')
            )
        });

        if (!registration) {
            throw new ForbiddenException('Você precisa ter participado do evento (checked_in) para avaliar.');
        }

        if (registration.status !== 'checked_in') {
            // Double check status just in case
            throw new ForbiddenException('Apenas participantes presentes podem avaliar.');
        }

        // 3. Verificar se já avaliou
        const existing = await this.db.query.reviews.findFirst({
            where: and(
                eq(schema.reviews.userId, userId),
                eq(schema.reviews.eventId, dto.eventId)
            )
        });

        if (existing) {
            throw new ConflictException('Você já avaliou este evento.');
        }

        // 4. Criar Avaliação
        const [review] = await this.db.insert(schema.reviews).values({
            userId,
            eventId: dto.eventId,
            rating: dto.rating,
            comment: dto.comment,
        }).returning();

        // 5. Atualizar Rating do Organizador (Assíncrono ou direto)
        await this.updateOrganizerRating(event.organizerId);

        return review;
    }

    async findOneByUserAndEvent(userId: string, eventId: string) {
        return this.db.query.reviews.findFirst({
            where: and(
                eq(schema.reviews.userId, userId),
                eq(schema.reviews.eventId, eventId)
            )
        });
    }

    private async updateOrganizerRating(organizerId: string) {
        // Média de todos os reviews de eventos desse organizador
        const result = await this.db.execute(sql`
            SELECT AVG(r.rating) as avg_rating
            FROM reviews r
            JOIN events e ON r.event_id = e.id
            WHERE e.organizer_id = ${organizerId}
        `);

        const newRating = result[0]?.avg_rating ? parseFloat(result[0].avg_rating as string) : 0;

        await this.db.update(schema.users)
            .set({ organizerRating: newRating })
            .where(eq(schema.users.id, organizerId));
    }
}
