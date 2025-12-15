import { Module } from '@nestjs/common';
import { ReviewsService } from '../../application/services/reviews.service';
import { ReviewsController } from '../../presentation/controllers/reviews.controller';
import { DrizzleModule } from '../database/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule { }
