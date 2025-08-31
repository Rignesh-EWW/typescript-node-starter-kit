import express from 'express';
import userRoutes from './api/user.routes';
import adminRoutes from './api/admin.routes';
import { shared } from '../../common/src';

const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'auth ok', util: shared() })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running at http://localhost:${PORT}`);
});
