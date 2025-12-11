import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EventsService } from "src/application/services/events.service";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { JwtAuthGuard } from "src/infra/auth/jwt-auth.guard";
import { CreateEventDto, UpdateEventDto } from "../dtos/event.dto";

@ApiTags('Events')
@Controller('events')
export class EventsController {
    constructor (private readonly eventsService: EventsService) {}

    @Post()
    @UseGuards(JwtAuthGuard) // Endpoint protegido
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new event (Organizer)' })
    @ApiResponse({ status: 201, description: 'Event created successfully' })
    create(@CurrentUser() user, @Body() dto: CreateEventDto) {
        // Passa o ID do usuário autenticado para vincular o evento a ele
        return this.eventsService.create(user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all events (Public)' })
    @ApiResponse({ status: 200, description: 'List of events retrieved successfully' })
    findAll() {
        return this.eventsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtain details for an event' })
    @ApiResponse({ status: 200, description: 'Event details retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard) // Endpoint protegido
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an event (Organizer only)' })
    update(
        @Param('id') id: string,
        @CurrentUser() user,
        @Body() dto: UpdateEventDto,
    ) {
        return this.eventsService.update(id, user.userId, dto);
    }
}
