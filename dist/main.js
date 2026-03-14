"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs = __importStar(require("fs"));
const CRAWLER_UAS = [
    'facebookexternalhit', 'facebot', 'twitterbot', 'linkedinbot',
    'whatsapp', 'telegrambot', 'slackbot', 'redditbot', 'pinterest',
    'googlebot', 'bingbot', 'applebot', 'discordbot', 'skypeuripreview',
];
function isCrawler(ua = '') {
    const lower = ua.toLowerCase();
    return CRAWLER_UAS.some(bot => lower.includes(bot));
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads', 'projects');
    if (!fs.existsSync(uploadsDir))
        fs.mkdirSync(uploadsDir, { recursive: true });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads' });
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use((req, res, next) => {
        const ua = req.headers['user-agent'] || '';
        if (req.path.includes('/og') && isCrawler(ua)) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('X-Robots-Tag', 'index, follow');
        }
        next();
    });
    app.enableCors({
        origin: function (origin, callback) {
            const allowed = [
                'http://localhost:3000',
                'http://localhost:3002',
                'https://jacobchidieugen.com',
                'https://jacob-chidi-eugene.vercel.app',
            ];
            if (!origin ||
                allowed.includes(origin) ||
                origin.endsWith('.vercel.app')) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('JCE Blog API')
        .setDescription('Jacob Chidi Eugene — Blog Backend REST API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 JCE Blog API running on port ${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
    console.log(`🖼️  Uploads served at http://localhost:${port}/uploads/`);
}
bootstrap();
//# sourceMappingURL=main.js.map