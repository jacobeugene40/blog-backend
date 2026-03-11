# Rate Limiting & Security Setup

## 1. Install throttler package

```bash
npm install @nestjs/throttler
```

## 2. Add ThrottlerModule to app.module.ts

Find your ThrottlerModule import section and add:

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl:   60000,  // 1 minute window
      limit: 60,     // 60 requests per minute globally
    }]),
    // ... your other imports
  ],
  providers: [
    {
      provide:  APP_GUARD,
      useClass: ThrottlerGuard,   // applies globally, endpoints can @SkipThrottle()
    },
    // ... your other providers
  ],
})
export class AppModule {}
```

## 3. Add to Render environment variables

```
FRONTEND_URL = https://jacob-chidi-eugene.vercel.app
BACKEND_URL  = https://blog-backend-8oer.onrender.com
```

## 4. Rate limits applied per endpoint

| Endpoint              | Limit            | Why                          |
|-----------------------|------------------|------------------------------|
| GET /posts            | unlimited        | read-only, safe              |
| GET /posts/:slug/slug | unlimited        | read-only, safe              |
| POST /posts/:id/like  | 3 per minute/IP  | prevent like bombing         |
| GET /posts/:slug/og   | 30 per minute/IP | crawlers don't need more     |
| POST /comments        | 5 per minute/IP  | prevent comment spam         |
| Admin endpoints       | unlimited        | JWT protected, trusted       |

