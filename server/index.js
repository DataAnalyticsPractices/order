import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import productionRoutes from './routes/production.js';
import shippingRoutes from './routes/shipping.js';

const app = express();
const PORT = 5000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB 连接
const MONGODB_URI = 'mongodb://localhost:27017/order_management';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 连接成功');
  })
  .catch((err) => {
    console.error('❌ MongoDB 连接失败:', err);
  });

// 路由
app.use('/api/production', productionRoutes);
app.use('/api/shipping', shippingRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});
