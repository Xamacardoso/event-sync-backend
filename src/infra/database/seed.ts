import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as bcrypt from 'bcrypt';

async function seed() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL not set');
    }

    const client = postgres(connectionString);
    const db = drizzle(client, { schema });

    console.log('🧹 Cleaning database...');
    await db.delete(schema.messages);
    await db.delete(schema.reviews);       // Added
    await db.delete(schema.certificates);  // Added
    await db.delete(schema.friendships);
    await db.delete(schema.checkins);      // Added
    await db.delete(schema.registrations);
    await db.delete(schema.events);
    await db.delete(schema.users);
    console.log('✨ Database clean');

    console.log('🌱 Seeding database...');

    // 1. Create Users
    const password = await bcrypt.hash('123456', 10);
    const usersData = [
        // Usuários Originais de Teste
        { name: 'Teste', email: 'teste@gmail.com', passwordHash: password, role: 'organizer', city: 'Picos', photoUrl: 'https://i.pravatar.cc/150?u=teste' },
        { name: 'Pebinha da Silva', email: 'pebinha@gmail.com', passwordHash: password, role: 'user', city: 'Picoense', photoUrl: 'https://i.pravatar.cc/150?u=pebinha' },

        // Novos Usuários de Teste de Cenários
        { name: 'Alice Organizer', email: 'alice@example.com', passwordHash: password, role: 'organizer', city: 'São Paulo', photoUrl: 'https://i.pravatar.cc/150?u=alice' },
        { name: 'Bob Friend', email: 'bob@example.com', passwordHash: password, role: 'user', city: 'Rio de Janeiro', photoUrl: 'https://i.pravatar.cc/150?u=bob' },
        { name: 'Charlie User', email: 'charlie@example.com', passwordHash: password, role: 'user', city: 'São Paulo', photoUrl: 'https://i.pravatar.cc/150?u=charlie' },
        { name: 'David Fan', email: 'david@example.com', passwordHash: password, role: 'user', city: 'Curitiba', photoUrl: 'https://i.pravatar.cc/150?u=david' },
        { name: 'Eve Newbie', email: 'eve@example.com', passwordHash: password, role: 'user', city: 'Belo Horizonte', photoUrl: 'https://i.pravatar.cc/150?u=eve' },
    ];

    const users: any[] = [];
    for (const u of usersData) {
        const [user] = await db.insert(schema.users).values(u as any).returning();
        users.push(user);
    }
    const [teste, pebinha, alice, bob, charlie, david, eve] = users;

    console.log('✅ Users created');

    // 2. Create Events
    const eventsData = [
        // Evento Original do Organizador Teste
        {
            organizerId: teste.id,
            title: 'Evento Teste Original',
            description: 'Descrição herdada do sistema antigo.',
            startDate: new Date('2025-12-25T20:00:00Z'),
            endDate: new Date('2025-12-26T02:00:00Z'),
            price: 100,
            type: 'paid',
            status: 'published',
            localAddress: 'Espaço de Eventos Picos',
        },
        {
            organizerId: alice.id,
            title: 'Tech Summit 2025',
            description: 'The biggest tech conference in Latam.',
            startDate: new Date('2025-10-10T09:00:00Z'),
            endDate: new Date('2025-10-12T18:00:00Z'),
            price: 299.90,
            type: 'paid',
            status: 'published',
            localAddress: 'Expo Center Norte',
        },
        {
            organizerId: alice.id,
            title: 'React Workshop',
            description: 'Learn React from scratch.',
            startDate: new Date('2025-11-05T14:00:00Z'),
            endDate: new Date('2025-11-05T18:00:00Z'),
            price: 0,
            type: 'free',
            status: 'published',
            localUrl: 'https://zoom.us/j/123456',
        },
        {
            organizerId: alice.id,
            title: 'Draft Event Future',
            description: 'Something big coming soon.',
            startDate: new Date('2025-12-01T10:00:00Z'),
            endDate: new Date('2025-12-01T12:00:00Z'),
            price: 50,
            type: 'paid',
            status: 'draft',
        },
        {
            organizerId: teste.id,
            title: 'Evento Exclusivo (Aprovação)',
            description: 'Necessário aprovação do organizador para entrar.',
            startDate: new Date('2026-01-15T19:00:00Z'),
            endDate: new Date('2026-01-15T23:00:00Z'),
            price: 0,
            type: 'free',
            requiresApproval: true,
            status: 'published',
            localAddress: 'Clube Privado',
        },
        {
            organizerId: alice.id,
            title: 'Evento Passado (Finished)',
            description: 'Evento que já ocorreu. Bom para testar avaliações.',
            startDate: new Date('2023-01-01T10:00:00Z'),
            endDate: new Date('2023-01-01T18:00:00Z'),
            price: 50,
            type: 'paid',
            status: 'finished',
            localAddress: 'Centro Histórico',
            workloadHours: 8,
        },
        {
            organizerId: alice.id,
            title: 'JS Conference 2023',
            description: 'A maior conferência de JS.',
            startDate: new Date('2023-05-20T09:00:00Z'),
            endDate: new Date('2023-05-21T18:00:00Z'),
            price: 150,
            type: 'paid',
            status: 'finished',
            localAddress: 'Hotel Plaza',
            workloadHours: 20,
        },
        {
            organizerId: alice.id,
            title: 'Node.js Workshop',
            description: 'Workshop intensivo.',
            startDate: new Date('2023-06-15T14:00:00Z'),
            endDate: new Date('2023-06-15T18:00:00Z'),
            price: 99,
            type: 'paid',
            status: 'finished',
            localUrl: 'https://meet.google.com/abc-defg-hij',
            workloadHours: 4,
        },
        {
            organizerId: teste.id,
            title: 'DevOps Bootcamp',
            description: 'Aprenda CI/CD na prática.',
            startDate: new Date('2023-08-10T08:00:00Z'),
            endDate: new Date('2023-08-12T18:00:00Z'),
            price: 500,
            type: 'paid',
            status: 'finished',
            localAddress: 'Lab de Informática',
            workloadHours: 32,
        }
    ];

    const events: any[] = [];
    for (const e of eventsData) {
        const [evt] = await db.insert(schema.events).values(e as any).returning();
        events.push(evt);
    }
    const [originalEvent, techSummit, reactWorkshop, draftEvent, restrictedEvent, finishedEvent] = events;

    console.log('✅ Events created');

    // 3. Register Users
    await db.insert(schema.registrations).values([
        // Pebinha participa do evento original
        { userId: pebinha.id, eventId: originalEvent.id, status: 'approved' },

        { userId: bob.id, eventId: techSummit.id, status: 'approved' },
        { userId: charlie.id, eventId: techSummit.id, status: 'checked_in' },
        { userId: david.id, eventId: techSummit.id, status: 'pending' },
        { userId: bob.id, eventId: reactWorkshop.id, status: 'approved' },
        { userId: eve.id, eventId: reactWorkshop.id, status: 'approved' },

        // Inscrições no Evento com Aprovação
        { userId: david.id, eventId: restrictedEvent.id, status: 'pending' },
        { userId: eve.id, eventId: restrictedEvent.id, status: 'approved' },

        // Inscrição no Evento Finalizado (para testar Review)
        { userId: bob.id, eventId: finishedEvent.id, status: 'checked_in' },
        { userId: charlie.id, eventId: finishedEvent.id, status: 'checked_in' },
    ]);

    console.log('✅ Registrations created');

    // 4. Create Friendships (Bob & Charlie are friends)
    await db.insert(schema.friendships).values([
        { requesterId: bob.id, recipientId: charlie.id, status: 'accepted' },
        { requesterId: david.id, recipientId: bob.id, status: 'pending' },
    ]);

    console.log('✅ Friendships created');

    // 5. Send Messages
    // Direct Message (Bob -> Charlie) - Conversa longa
    const messagesData: any[] = [];

    // Inicia conversa
    messagesData.push({
        senderId: bob.id,
        recipientId: charlie.id,
        content: 'Hey Charlie, vai no Tech Summit?',
        timestamp: new Date('2025-10-01T10:00:00Z'),
    });

    // Gera 50 mensagens de "spam" / conversa
    for (let i = 0; i < 50; i++) {
        const isBob = i % 2 === 0;
        messagesData.push({
            senderId: isBob ? bob.id : charlie.id,
            recipientId: isBob ? charlie.id : bob.id,
            content: `Mensagem de teste ${i + 1} - ${isBob ? 'Bob falando...' : 'Charlie respondendo...'} bla bla bla`,
            timestamp: new Date(Date.now() - 1000 * 60 * (50 - i)), // Mensagens recentes
        });
    }

    // Event Chat Message (Bob -> Tech Summit)
    messagesData.push({
        senderId: bob.id,
        eventId: techSummit.id,
        content: 'Alguém sabe onde é o credenciamento?',
        timestamp: new Date(),
    });

    await db.insert(schema.messages).values(messagesData as any);

    console.log('✅ Messages created');
    console.log('🎉 Seeding completed!');
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
