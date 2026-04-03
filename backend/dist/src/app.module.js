"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./auth/auth.module");
const prisma_service_1 = require("./lib/prisma.service");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const purchases_controller_1 = require("./purchases/purchases.controller");
const purchases_service_1 = require("./purchases/purchases.service");
const cron_controller_1 = require("./cron/cron.controller");
const scheduler_service_1 = require("./cron/scheduler.service");
const raffles_controller_1 = require("./raffles/raffles.controller");
const raffles_service_1 = require("./raffles/raffles.service");
const tickets_controller_1 = require("./tickets/tickets.controller");
const tickets_service_1 = require("./tickets/tickets.service");
const payments_controller_1 = require("./payments/payments.controller");
const payments_service_1 = require("./payments/payments.service");
const webhooks_controller_1 = require("./webhooks/webhooks.controller");
const redis_module_1 = require("./redis/redis.module");
const raffles_gateway_1 = require("./gateways/raffles.gateway");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...(process.env.ENABLE_SCHEDULER === 'false'
                ? []
                : [schedule_1.ScheduleModule.forRoot()]),
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
        ],
        controllers: [
            app_controller_1.AppController,
            purchases_controller_1.PurchasesController,
            raffles_controller_1.RafflesController,
            tickets_controller_1.TicketsController,
            cron_controller_1.CronController,
            payments_controller_1.PaymentsController,
            webhooks_controller_1.WebhooksController,
        ],
        providers: [
            app_service_1.AppService,
            purchases_service_1.PurchasesService,
            raffles_service_1.RafflesService,
            tickets_service_1.TicketsService,
            raffles_gateway_1.RafflesGateway,
            scheduler_service_1.SchedulerService,
            payments_service_1.PaymentsService,
            prisma_service_1.PrismaService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map