import mongoose from 'mongoose';

// 材料/其他信息子文档
const materialSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['面料', '五金', '复合', '织袋', '塑料袋', '里布', '其他']
  },
  comment: String,
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// 付款记录子文档
const paymentSchema = new mongoose.Schema({
  paymentTo: String, // 付款对象（工厂或材料厂）
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  comment: String
});

// 生产订单主文档
const productionOrderSchema = new mongoose.Schema({
  factoryName: {
    type: String,
    required: true
  },
  goodsInfo: String,
  amount: Number,
  pricePerItem: Number,
  totalProductionPrice: {
    type: Number,
    required: true
  },
  materials: [materialSchema],
  payments: [paymentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 计算应付金额的虚拟字段
productionOrderSchema.virtual('amountDue').get(function() {
  const materialCost = this.materials.reduce((sum, item) => sum + item.price, 0);
  const paidAmount = this.payments.reduce((sum, item) => sum + item.amount, 0);
  return this.totalProductionPrice - materialCost - paidAmount;
});

// 启用虚拟字段在JSON中显示
productionOrderSchema.set('toJSON', { virtuals: true });
productionOrderSchema.set('toObject', { virtuals: true });

// 更新时间中间件
productionOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('ProductionOrder', productionOrderSchema);
