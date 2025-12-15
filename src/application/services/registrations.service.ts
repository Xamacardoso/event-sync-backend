import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../../infra/database/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infra/database/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class RegistrationsService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) { }

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
    // Define status inicial: Se requer aprovação -> pending, senão -> approved
    const status = event.requiresApproval ? 'pending' : 'approved';

    if (existing) {
      if (existing.status === 'canceled') {
        const [updated] = await this.db.update(schema.registrations)
          .set({ status, registrationDate: new Date() })
          .where(eq(schema.registrations.id, existing.id))
          .returning();
        return { message: 'Registration reactivated', registration: updated };
      }
      throw new ConflictException('Already registered');
    }

    const [registration] = await this.db.insert(schema.registrations).values({
      userId,
      eventId,
      status,
    }).returning();

    return { message: 'Registration successful', registration };
  }

  // Participante cancela sua inscrição
  async cancelRegistration(userId: string, registrationId: string) {
    const registration = await this.db.query.registrations.findFirst({
      where: and(
        eq(schema.registrations.id, registrationId),
        eq(schema.registrations.userId, userId)
      )
    });

    if (!registration) throw new NotFoundException('Registration not found');

    if (registration.status === 'checked_in') {
      throw new BadRequestException('Cannot cancel after check-in');
    }

    const [updated] = await this.db.update(schema.registrations)
      .set({ status: 'canceled' })
      .where(eq(schema.registrations.id, registrationId))
      .returning();

    return { message: 'Registration canceled', registration: updated };
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
    // Busca inscrições com dados do usuário
    const registrations = await this.db.query.registrations.findMany({
      where: eq(schema.registrations.eventId, eventId),
      with: {
        user: { // Graças ao relations.ts agora da para buscar o usuário relacionado
          columns: { id: true, name: true, email: true, photoUrl: true }
        },
        checkins: true,
      }
    });

    return registrations.map(reg => {
      // Pega o check-in mais recente, se houver
      const lastCheckin = reg.checkins && reg.checkins.length > 0
        ? reg.checkins.sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeB - timeA;
        })[0]
        : null;

      return {
        ...reg,
        checkedInAt: lastCheckin?.timestamp || null,
      }
    });
  }

  async findParticipantsByEvent(eventId: string) {
    const registrations = await this.db.query.registrations.findMany({
      where: eq(schema.registrations.eventId, eventId),
      with: {
        user: {
          columns: { id: true, name: true, email: true, photoUrl: true }
        }
      }
    });
    // Filter active participants only
    return registrations.filter(r => r.status && ['approved', 'checked_in', 'confirmed'].includes(r.status));
  }

  async findMyRegistrations(userId: string) {
    return this.db.query.registrations.findMany({
      where: eq(schema.registrations.userId, userId),
      with: {
        event: true,
      },
      orderBy: (registrations, { desc }) => [desc(registrations.registrationDate)],
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

  // Obter cartao virtual do participatne
  async getTvCard(userId: string, registrationId: string) {
    const registration = await this.db.query.registrations.findFirst({
      where: and(
        eq(schema.registrations.id, registrationId),
        eq(schema.registrations.userId, userId)
      ),
      with: {
        event: true,
        user: true, // Para pegar o nome do participante
      }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found.');
    }

    // TODO: Transformar em enum
    if (registration.status !== 'approved' && registration.status !== 'confirmed') {
      throw new BadRequestException('You must have an approved or confirmed registration to access the virtual card.');
    }

    // Retorna dados formatados para o Cartão
    return {
      registrationId: registration.id,
      participantName: registration.user.name,
      eventName: registration.event.title,
      eventDate: registration.event.startDate,
      local: registration.event.localAddress || 'Online',
      status: registration.status,
      qrCodeData: registration.id, // O QR Code será apenas o ID da inscrição
    };
  }

  // Realizar check-in. TODO: Transformar em enum
  async checkIn(organizerId: string, registrationId: string, method: 'manual' | 'qr') {
    // Buscar inscrição e evento
    const registration = await this.db.query.registrations.findFirst({
      where: eq(schema.registrations.id, registrationId),
      with: {
        event: true,
      }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found.');
    }

    // 1. Validar se o usuário é o organizador do evento
    if (registration.event.organizerId !== organizerId) {
      throw new ForbiddenException('You do not have permission to perform check-in for this event.');
    }

    // 2. Validar status da inscrição
    if (registration.status !== 'approved' && registration.status !== 'confirmed') {
      throw new BadRequestException(`Participant not approved (Status: ${registration.status}).`);
    }

    // 3. Validar limite de check-ins
    // (Padrão é 1, mas o evento pode permitir mais, ex: credenciamento + brindes)
    if (registration.checkinsCount! >= (registration.event.allowedCheckins || 1)) {
      throw new ConflictException('Participant already checked in.');
    }

    // 4. Registrar Check-in (Transação simples: Insert no histórico + Update no contador)
    await this.db.transaction(async (tx) => {
      // Cria registro na tabela de logs 'checkins'
      await tx.insert(schema.checkins).values({
        registrationId: registration.id,
        method: method,
      });

      // Incrementa contador na inscrição e atualiza status se necessário
      await tx.update(schema.registrations)
        .set({
          checkinsCount: registration.checkinsCount! + 1,
          status: 'checked_in' // Opcional: mudar status para indicar presença
        })
        .where(eq(schema.registrations.id, registrationId));
    });

    return {
      message: 'Check-in made successfully',
      participant: registration.userId // Retorna ID para o front mostrar quem entrou
    };
  }
}