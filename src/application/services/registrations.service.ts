import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../../infra/database/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infra/database/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class RegistrationsService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Participante se inscreve em evento
  async register(userId: string, eventId: string) {
    // TODO: Fazer funcao para facilitar a legibilidade dessaa query
    const event = await this.db.query.events.findFirst({
      where: eq(schema.events.id, eventId),
    });

    if (!event) throw new NotFoundException('Event not found');

    // Validações de data
    const now = new Date();
    if (event.registrationStart && now < event.registrationStart) {
      throw new BadRequestException('Registration has not started yet');
    }
    if (event.registrationEnd && now > event.registrationEnd) {
      throw new BadRequestException('Registration is closed');
    }

    // Verifica duplicação de inscrição
    const existing = await this.db.query.registrations.findFirst({
      where: and(
        eq(schema.registrations.eventId, eventId),
        eq(schema.registrations.userId, userId)
      ),
    });
    if (existing) throw new ConflictException('Already registered');

    // Define status inicial: Se requer aprovação -> pending, senão -> approved
    const status = event.requiresApproval ? 'pending' : 'approved';

    const [registration] = await this.db.insert(schema.registrations).values({
      userId,
      eventId,
      status,
    }).returning();

    return { message: 'Registration successful', registration };
  }

  // Organizador lista inscrições de um evento seu
  async findAllByEvent(userId: string, eventId: string) {
    // Verifica se o evento pertence ao usuário
    // TODO: Fazer funcao para facilitar a legibilidade dessaa query
    const event = await this.db.query.events.findFirst({
        where: eq(schema.events.id, eventId)
    });
    
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== userId) throw new ForbiddenException('Not your event');

    // Busca inscrições com dados do usuário
    return this.db.query.registrations.findMany({
      where: eq(schema.registrations.eventId, eventId),
      with: {
        user: { // Graças ao relations.ts agora da para buscar o usuário relacionado
            columns: { id: true, name: true, email: true, photoUrl: true }
        } 
      }
    });
  }

  // Organizador muda status (Aprovar/Recusar)
  async updateStatus(userId: string, registrationId: string, status: 'approved' | 'rejected') {
    // Buscar a inscrição e o evento associado para verificar permissão
    const registration = await this.db.query.registrations.findFirst({
        where: eq(schema.registrations.id, registrationId),
        with: {
            event: true
        }
    });

    if (!registration) throw new NotFoundException('Registration not found');
    
    // Verifica permissão (apenas organizador do evento)
    if (registration.event.organizerId !== userId) {
        throw new ForbiddenException('You do not have permission to manage this registration');
    }

    const [updated] = await this.db.update(schema.registrations)
        .set({ status })
        .where(eq(schema.registrations.id, registrationId))
        .returning();

    return updated;
  }
}