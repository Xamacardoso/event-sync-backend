import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import { CurrentUser } from '../../infra/auth/current-user.decorator';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { UpdateUserDto, UserDetailsDto } from '../dtos/user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile details' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: UserDetailsDto })
    getProfile(@CurrentUser() user) {
        return this.usersService.getProfile(user.userId);
    }

    @Put('me')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    updateProfile(@CurrentUser() user, @Body() dto: UpdateUserDto) {
        return this.usersService.updateProfile(user.userId, dto);
    }
}
