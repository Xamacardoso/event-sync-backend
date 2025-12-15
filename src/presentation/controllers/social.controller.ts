import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SocialService } from '../../application/services/social.service';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { CurrentUser } from '../../infra/auth/current-user.decorator';

@ApiTags('Social')
@Controller('social')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SocialController {
    constructor(private readonly socialService: SocialService) {
        console.log('SocialController initialized');
    }

    @Post('friend-request/:targetUserId')
    @ApiOperation({ summary: 'Enviar pedido de amizade (Exige evento em comum)' })
    sendRequest(@Param('targetUserId') targetId: string, @CurrentUser() user: any) {
        return this.socialService.sendFriendRequest(user.userId, targetId);
    }

    @Patch('friend-request/:id/respond')
    @ApiOperation({ summary: 'Aceitar ou Recusar pedido' })
    @ApiBody({ schema: { type: 'object', properties: { action: { type: 'string', enum: ['accepted', 'rejected'] } } } })
    respondRequest(
        @Param('id') requestId: string,
        @Body('action') action: 'accepted' | 'rejected',
        @CurrentUser() user: any
    ) {
        return this.socialService.respondToRequest(user.userId, requestId, action);
    }

    @Get('friends')
    @ApiOperation({ summary: 'Listar meus amigos' })
    getFriends(@CurrentUser() user: any) {
        return this.socialService.getFriends(user.userId);
    }

    @Get('requests/pending')
    @ApiOperation({ summary: 'Listar pedidos de amizade recebidos' })
    getPending(@CurrentUser() user: any) {
        return this.socialService.getPendingRequests(user.userId);
    }

    @Get('requests/sent')
    @ApiOperation({ summary: 'Listar pedidos de amizade enviados' })
    getSent(@CurrentUser() user: any) {
        return this.socialService.getSentRequests(user.userId);
    }

    @Delete('friendships/:friendId')
    @ApiOperation({ summary: 'Remover amizade ou cancelar pedido' })
    removeFriend(@Param('friendId') friendId: string, @CurrentUser() user: any) {
        return this.socialService.removeFriendship(user.userId, friendId);
    }

    @Post('messages/:friendId')
    @ApiOperation({ summary: 'Enviar mensagem para um amigo' })
    @ApiBody({ schema: { type: 'object', properties: { content: { type: 'string' } } } })
    sendMessage(
        @Param('friendId') friendId: string,
        @Body('content') content: string,
        @CurrentUser() user: any
    ) {
        return this.socialService.sendMessage(user.userId, friendId, content);
    }

    @Get('messages/:friendId')
    @ApiOperation({ summary: 'Ver histórico de mensagens com um amigo' })
    getMessages(@Param('friendId') friendId: string, @CurrentUser() user: any) {
        return this.socialService.getMessages(user.userId, friendId);
    }

    @Get('events/:id/chat')
    @ApiOperation({ summary: 'Ver chat do evento' })
    getEventChat(@Param('id') eventId: string) {
        return this.socialService.getEventMessages(eventId);
    }

    @Post('events/:id/chat')
    @ApiOperation({ summary: 'Enviar mensagem no chat do evento' })
    @ApiBody({ schema: { type: 'object', properties: { content: { type: 'string' } } } })
    sendEventMessage(
        @Param('id') eventId: string,
        @Body('content') content: string,
        @CurrentUser() user: any
    ) {
        return this.socialService.sendMessageToEvent(user.userId, eventId, content);
    }
}
