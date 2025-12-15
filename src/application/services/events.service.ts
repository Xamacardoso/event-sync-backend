import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE } from '../../infra/database/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infra/database/schema';
import { eq, desc, and, lte, gte, SQL, ilike } from 'drizzle-orm';
import { CreateEventDto, UpdateEventDto } from '../../presentation/dtos/event.dto';
import { EventFilterDto } from '../../presentation/dtos/event-filter.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) { }

  // Criar Evento
  async create(userId: string, dto: CreateEventDto) {
    const [event] = await this.db.insert(schema.events).values({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      registrationStart: dto.registrationStart ? new Date(dto.registrationStart) : null,
      registrationEnd: dto.registrationEnd ? new Date(dto.registrationEnd) : null,
      organizerId: userId,
    }).returning();

    return event;
  }

  // Listar Eventos (Público)
  async findAll(filters: EventFilterDto) {
    const conditions: SQL[] = [];

    // Por padrão, buscar apenas eventos publicados
    conditions.push(eq(schema.events.status, 'published'));

    if (filters.title) {
      conditions.push(ilike(schema.events.title, `%${filters.title}%`));
    }

    if (filters.type) {
      conditions.push(eq(schema.events.type, filters.type));
    }

    if (filters.startDate) {
      conditions.push(gte(schema.events.startDate, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(schema.events.startDate, new Date(filters.endDate)));
    }

    return this.db.query.events.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.events.createdAt)],
      with: {
        organizer: {
          columns: { name: true, organizerRating: true }
        }
      }
    });
  }

  // Buscar um Evento por ID
  async findOne(id: string) {
    const event = await this.db.query.events.findFirst({
      where: eq(schema.events.id, id),
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  // Atualizar Evento (Apenas o dono pode editar)
  async update(id: string, userId: string, dto: UpdateEventDto) {
    // Verifica se evento existe
    const event = await this.findOne(id);

    // Verifica se o usuário é o dono
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this event');
    }

    const updateData: any = { ...dto };

    // TODO: Validar datas (ex: endDate > startDate) e automatizar conversão
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate)
    if (dto.registrationStart) updateData.registrationStart = new Date(dto.registrationStart);
    if (dto.registrationEnd) updateData.registrationEnd = new Date(dto.registrationEnd);

    const [updatedEvent] = await this.db.update(schema.events)
      .set(updateData)
      .where(eq(schema.events.id, id))
      .returning();

    return updatedEvent;
  }

  // Listar Eventos do Usuário (Apenas o dono pode ver)
  async findMyEvents(userId: string) {
    // Verifica se o usuário existe
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      orderBy: [desc(schema.users.createdAt)],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verifica se o usuário é o dono
    if (user.id !== userId) {
      throw new ForbiddenException('You do not have permission to view this user\'s events');
    }

    return this.db.query.events.findMany({
      where: eq(schema.events.organizerId, userId),
      orderBy: [desc(schema.events.createdAt)],
    });
  }

  // Cancelar evento
  async cancel(id: string, userId: string) {
    // Verifica se evento existe
    const event = await this.findOne(id);

    // Verifica se o usuário é o dono
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this event');
    }

    const [canceledEvent] = await this.db.update(schema.events)
      .set({ status: 'canceled' })
      .where(eq(schema.events.id, id))
      .returning();

    return canceledEvent;
  }
}