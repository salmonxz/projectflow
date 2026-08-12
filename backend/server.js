const app = require('./src/app');
const seed = require('./database/seed');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 ProjectFlow Express Server running on http://localhost:${PORT}`);
  try {
    await seed();
  } catch (err) {
    console.error('Error auto-seeding on startup:', err.message);
  }
});
