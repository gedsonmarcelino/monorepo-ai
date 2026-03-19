import { createApp } from './app/create-app.js';
import { createDevelopmentAuthService } from './modules/auth/bootstrap/create-development-auth-service.js';

const port = Number(process.env.PORT ?? 4000);
const authService = await createDevelopmentAuthService();
const app = createApp({ authService });

app.listen(port, () => {
  console.log(`@repo/auth listening on port ${port}`);
});

