require('dotenv').config();

const { connectDatabase } = require('./src/config/database');
const { createApp } = require('./src/app');

// Default port 
const PORT = Number(process.env.PORT) || 3000;

async function main() {
  await connectDatabase();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
