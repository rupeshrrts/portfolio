// Local / traditional-server entry point. On Vercel, api/index.js is used instead.
import app from './src/app.js';
import { storeMode } from './src/lib/store.js';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT} (store: ${storeMode})`));
