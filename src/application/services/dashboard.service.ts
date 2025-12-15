import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../../infra/database/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infra/database/schema';
import { eq, and, sql, gt } from 'drizzle-orm';

@Injectable()
export class DashboardService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async getStats(userId: string) {
        // 1. Total de eventos criados
        const eventsCreated = await this.db.query.events.findMany({
            where: eq(schema.events.organizerId, userId),
        });
        const totalEvents = eventsCreated.length;

        // 2. Total de inscritos (somar inscrições de todos os eventos desse organizador)
        // Poderia ser otimizado com aggregation query, mas faremos simples por enquanto
        const eventIds = eventsCreated.map(e => e.id);
        let totalRegistrations = 0;

        if (eventIds.length > 0) {
            // Conta as inscrições onde o eventId está na lista de eventos do organizador
            // Drizzle 'inArray' seria melhor, mas vamos usar query builder ou raw se precisar
            // Vamos iterar ou buscar todas inscrições desses eventos
            /* 
               const regs = await this.db.select({ count: sql<number>`count(*)` })
                   .from(schema.registrations)
                   .where(inArray(schema.registrations.eventId, eventIds));
            */
            // Como nao tenho certeza se inArray foi exportado no schema ou drizzle-orm import, vou usar findMany com filter no JS se escala for pequena (MVP)
            // Ou melhor, fazer uma query raw simples ou usar o relations

            // Abordagem via relations se events tiver 'registrations' relation definido
            // Assumindo que não, vamos buscar inscrições.
            const allRegs = await this.db.query.registrations.findMany({
                where: (registrations, { inArray }) => inArray(registrations.eventId, eventIds)
            });
            totalRegistrations = allRegs.length;
        }

        // 3. Próximo Evento (Data de inicio > agora, ordenado ASC)
        const nextEvent = await this.db.query.events.findFirst({
            where: and(
                eq(schema.events.organizerId, userId),
                gt(schema.events.startDate, new Date())
            ),
            orderBy: (events, { asc }) => [asc(events.startDate)],
        });

        return {
            totalEvents,
            totalRegistrations,
            nextEvent: nextEvent ? {
                id: nextEvent.id,
                title: nextEvent.title,
                startDate: nextEvent.startDate
            } : null
        };
    }
}
