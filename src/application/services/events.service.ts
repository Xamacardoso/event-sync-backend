import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE } from '../../infra/database/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infra/database/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateEventDto, UpdateEventDto } from '../../presentation/dtos/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Criar Evento
  async create(userId: string, dto: CreateEventDto) {
    const [event] = await this.db.insert(schema.events).values({
      ...dto,

      // TODO: automatizar conversão
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      registrationStart: dto.registrationStart ? new Date(dto.registrationStart) : null,
      registrationEnd: dto.registrationEnd ? new Date(dto.registrationEnd) : null,
      
      organizerId: userId, // Vincula quem criou
      // status default é 'draft' se não vier no dto
    }).returning();
    
    return event;
  }

  // Listar Eventos (Público)
  async findAll() {
    // Retorna todos, ordenados por data de criação (mais novos primeiro)
    return this.db.query.events.findMany({
      orderBy: [desc(schema.events.createdAt)],
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
}