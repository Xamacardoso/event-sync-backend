import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE } from '../../infra/database/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infra/database/schema';
import { eq, desc, and, lte, gte, SQL, ilike } from 'drizzle-orm';
import { CreateEventDto, UpdateEventDto } from '../../presentation/dtos/event.dto';
import { EventFilterDto } from '../../presentation/dtos/event-filter.dto';
import { EventContext } from '../../domain/events/event-context';
import { EventStateFactory } from '../../domain/events/event-state.factory';

@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) { }

  // Criar Evento (Mantido igual)
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

    // Lógica correta de filtro de status
    if (filters.status) {
      conditions.push(eq(schema.events.status, filters.status));
    } else {
      conditions.push(eq(schema.events.status, 'published'));
    }

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

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    // Build the where clause conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Query for total count (needed for pagination metadata)
    // We select id only for efficiency when counting
    const allMatchingEvents = await this.db.select({ id: schema.events.id })
      .from(schema.events)
      .where(whereClause);

    const total = allMatchingEvents.length;
    const lastPage = Math.ceil(total / limit);

    const data = await this.db.query.events.findMany({
      where: whereClause,
      orderBy: [desc(schema.events.createdAt)],
      limit: limit,
      offset: offset,
      with: {
        organizer: {
          columns: { name: true, organizerRating: true }
        }
      }
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage,
        limit
      }
    };
  }

  // Buscar um Evento por ID
  async findOne(id: string) {
    const event = await this.db.query.events.findFirst({
      where: eq(schema.events.id, id),
      with: {
        organizer: {
          columns: { id: true, name: true, photoUrl: true, organizerRating: true }
        }
      }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  // Atualizar Evento (Com State Pattern)
  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this event');
    }

    // Inicializa o Contexto e Estado
    const context = new EventContext({ ...event }); // Copia para não mutar o original imediatamente
    const state = EventStateFactory.create(event.status || 'draft', context);
    context.setState(state);

    // 1. Aplica atualizações de dados (Valida se o estado atual permite edição)
    context.update(dto);

    // 2. Processa transição de status se solicitado
    if (dto.status && dto.status !== event.status) {
      if (dto.status === 'published') context.publish();
      else if (dto.status === 'canceled') context.cancel();
      else if (dto.status === 'finished') context.finish();
      else if (dto.status === 'draft') {
        context.revertToDraft();
      }
    }

    // Prepara dados para salvar
    const { status, ...currentData } = context.event;

    // Converte datas para Date object se estiverem no DTO (context.update fez Object.assign nas strings)
    // Precisamos garantir que o objeto passado para o Drizzle tenha Dates corretas
    const updateData: any = { ...dto, status: context.getStatus() as any };

    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.registrationStart) updateData.registrationStart = new Date(dto.registrationStart);
    if (dto.registrationEnd) updateData.registrationEnd = new Date(dto.registrationEnd);

    const [updatedEvent] = await this.db.update(schema.events)
      .set(updateData)
      .where(eq(schema.events.id, id))
      .returning();

    return updatedEvent;
  }

  async findMyEvents(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.db.query.events.findMany({
      where: eq(schema.events.organizerId, userId),
      orderBy: [desc(schema.events.createdAt)],
    });
  }

  // Cancelar evento (Usando State Pattern)
  async cancel(id: string, userId: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this event');
    }

    const context = new EventContext({ ...event });
    const state = EventStateFactory.create(event.status || 'draft', context);
    context.setState(state);

    context.cancel(); // Dispara transição e validações

    const [canceledEvent] = await this.db.update(schema.events)
      .set({ status: context.getStatus() as any })
      .where(eq(schema.events.id, id))
      .returning();

    return canceledEvent;
  }
}