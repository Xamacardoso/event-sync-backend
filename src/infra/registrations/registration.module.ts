import { Module } from "@nestjs/common";
import { RegistrationsService } from "src/application/services/registrations.service";
import { RegistrationsController } from "src/presentation/controllers/registrations.controller";

@Module({
    controllers: [RegistrationsController], // Controllers sao os responsaveis por lidar com as requisicoes HTTP
    providers: [RegistrationsService], // Providers sao os servicos que contem a logica de negocio e outros injetaveis
})
export class RegistrationsModule {}