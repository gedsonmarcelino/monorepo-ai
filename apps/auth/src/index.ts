import { createApp } from './app/create-app.js';

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

app.listen(port, () => {
  console.log(`@repo/auth listening on port ${port}`);
});

