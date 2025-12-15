import { Module } from '@nestjs/common';
import { SocialController } from '../../presentation/controllers/social.controller';
import { SocialService } from '../../application/services/social.service';

@Module({
    controllers: [SocialController],
    providers: [SocialService],
})
export class SocialModule { }
