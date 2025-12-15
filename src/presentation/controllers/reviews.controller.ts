import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ReviewsService } from '../../application/services/reviews.service';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { CurrentUser } from '../../infra/auth/current-user.decorator';
import { CreateReviewDto } from '../dtos/review.dto';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @ApiOperation({ summary: 'Avaliar um evento finalizado' })
    @ApiBody({ type: CreateReviewDto })
    create(@Body() dto: CreateReviewDto, @CurrentUser() user: any) {
        return this.reviewsService.create(user.userId, dto);
    }
}
