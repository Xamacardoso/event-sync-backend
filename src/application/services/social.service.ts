import { Injectable, Inject, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../../infra/database/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infra/database/schema';
import { eq, and, or, sql } from 'drizzle-orm';

@Injectable()
export class SocialService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    // 1. Enviar Pedido de Amizade
    async sendFriendRequest(userId: string, targetUserId: string) {
        if (userId === targetUserId) throw new BadRequestException('Não pode adicionar a si mesmo');

        // A. Verificar se já existe amizade ou pedido
        const existing = await this.db.query.friendships.findFirst({
            where: or(
                and(eq(schema.friendships.requesterId, userId), eq(schema.friendships.recipientId, targetUserId)),
                and(eq(schema.friendships.requesterId, targetUserId), eq(schema.friendships.recipientId, userId))
            )
        });

        if (existing) {
            if (existing.status === 'pending') throw new ConflictException('Já existe um pedido pendente');
            if (existing.status === 'accepted') throw new ConflictException('Vocês já são amigos');
        }

        // B. REGRA DE OURO: Verificar se têm evento em comum (aprovado/confirmado)
        const commonEvents = await this.db.execute(sql`
      SELECT r1.event_id FROM registrations r1
      INNER JOIN registrations r2 ON r1.event_id = r2.event_id
      WHERE r1.user_id = ${userId} 
      AND r2.user_id = ${targetUserId}
      AND r1.status IN ('approved', 'confirmed', 'checked_in')
      AND r2.status IN ('approved', 'confirmed', 'checked_in')
      LIMIT 1
    `);

        if (commonEvents.length === 0) {
            throw new BadRequestException('Vocês precisam estar inscritos no mesmo evento para serem amigos.');
        }

        // C. Criar o pedido
        const [request] = await this.db.insert(schema.friendships).values({
            requesterId: userId,
            recipientId: targetUserId,
            status: 'pending',
        }).returning();

        return { message: 'Pedido de amizade enviado', request };
    }

    // 2. Aceitar ou Recusar Pedido
    async respondToRequest(userId: string, requestId: string, action: 'accepted' | 'rejected') {
        const request = await this.db.query.friendships.findFirst({
            where: eq(schema.friendships.id, requestId)
        });

        if (!request) throw new NotFoundException('Pedido não encontrado');
        if (request.recipientId !== userId) throw new BadRequestException('Este pedido não é para você');
        if (request.status !== 'pending') throw new BadRequestException('Este pedido já foi respondido');

        const [updated] = await this.db.update(schema.friendships)
            .set({ status: action })
            .where(eq(schema.friendships.id, requestId))
            .returning();

        return { message: `Pedido ${action === 'accepted' ? 'aceito' : 'recusado'}`, friendship: updated };
    }

    // 3. Listar Amigos
    async getFriends(userId: string) {
        // Busca onde sou requerer OU recipient, e status é accepted
        const friends = await this.db.query.friendships.findMany({
            where: and(
                or(eq(schema.friendships.requesterId, userId), eq(schema.friendships.recipientId, userId)),
                eq(schema.friendships.status, 'accepted')
            )
        });

        // Precisamos carregar os dados dos usuários amigos. 
        // Como o ID do amigo pode estar no requesterId ou recipientId, fazemos um map.
        const friendIds = friends.map(f => f.requesterId === userId ? f.recipientId : f.requesterId);

        if (friendIds.length === 0) return [];

        return this.db.query.users.findMany({
            // @ts-ignore
            where: sql`id IN ${friendIds}`,
            columns: { id: true, name: true, photoUrl: true, city: true }
        });
    }

    // 4. Listar Pedidos Pendentes (Recebidos)
    async getPendingRequests(userId: string) {
        return this.db.query.friendships.findMany({
            where: and(
                eq(schema.friendships.recipientId, userId),
                eq(schema.friendships.status, 'pending')
            ),
            // Aqui idealmente usaríamos 'with' se as relations estivessem configuradas para trazer o nome
        });
    }

    // 5. Enviar Mensagem
    async sendMessage(senderId: string, recipientId: string, content: string) {
        // Verificar se são amigos
        const isFriend = await this.db.query.friendships.findFirst({
            where: and(
                or(
                    and(eq(schema.friendships.requesterId, senderId), eq(schema.friendships.recipientId, recipientId)),
                    and(eq(schema.friendships.requesterId, recipientId), eq(schema.friendships.recipientId, senderId))
                ),
                eq(schema.friendships.status, 'accepted')
            )
        });

        if (!isFriend) throw new BadRequestException('Vocês precisam ser amigos para trocar mensagens.');

        const [msg] = await this.db.insert(schema.messages).values({
            senderId,
            recipientId,
            content,
            type: 'text',
        }).returning();

        return msg;
    }

    // 6. Ler Mensagens (Histórico com um amigo)
    async getMessages(userId: string, friendId: string) {
        return this.db.query.messages.findMany({
            where: or(
                and(eq(schema.messages.senderId, userId), eq(schema.messages.recipientId, friendId)),
                and(eq(schema.messages.senderId, friendId), eq(schema.messages.recipientId, userId))
            ),
            orderBy: [schema.messages.timestamp] // Ordenar por data
        });
    }
}
