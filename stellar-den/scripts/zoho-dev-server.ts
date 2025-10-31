import 'dotenv/config';
import express from 'express';
import zohoRoutes from '../server/routes/zoho';

const app = express();
app.use(express.json());
app.use('/api/zoho', zohoRoutes);

const PORT = 8090;
app.listen(PORT, () => {
  console.log(`Zoho dev server running at http://127.0.0.1:${PORT}`);
});
