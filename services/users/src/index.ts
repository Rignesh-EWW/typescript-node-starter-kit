import express from 'express';
import userRoutes from './api/user.routes';
import adminRoutes from './api/admin.routes';
import { shared } from '../../common/src';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Users service');
});

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'users ok', util: shared() })
);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Users service running at http://localhost:${PORT}`);
});
