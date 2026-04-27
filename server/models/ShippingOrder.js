import mongoose from 'mongoose';

// 付款信息子文档
const paymentInfoSchema = new mongoose.Schema({
  deposit: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  comment: String
});

// 货物信息子文档
const goodsItemSchema = new mongoose.Schema({
  goodsImage: String,
  goodsName: String,
  goodsId: String,
  serialNumber: String,
  quantity: Number,
  pricePerUnit: Number,
  pieceCount: Number,
  totalGoodsPrice: Number,
  shippingFee: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// 发货订单主文档
const shippingOrderSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: true
  },
  goods: [goodsItemSchema],  // 一个订单多个货物
  paymentRecords: [paymentInfoSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 计算所有货物总价（不含运费）
shippingOrderSchema.virtual('totalGoodsPrice').get(function() {
  return this.goods.reduce((sum, item) => sum + (item.totalGoodsPrice || 0), 0);
});

// 计算总运费
shippingOrderSchema.virtual('totalShippingFee').get(function() {
  return this.goods.reduce((sum, item) => sum + (item.shippingFee || 0), 0);
});

// 计算应付总价 = 所有货物总价 + 所有运费
shippingOrderSchema.virtual('totalDue').get(function() {
  return this.totalGoodsPrice + this.totalShippingFee;
});

// 计算欠款金额
shippingOrderSchema.virtual('amountOwed').get(function() {
  const totalPaid = this.paymentRecords.reduce((sum, record) => 
    sum + record.deposit + record.paidAmount, 0
  );
  return this.totalDue - totalPaid;
});

// 是否付清的虚拟字段
shippingOrderSchema.virtual('isPaidFull').get(function() {
  return this.amountOwed <= 0;
});

// 启用虚拟字段在JSON中显示
shippingOrderSchema.set('toJSON', { virtuals: true });
shippingOrderSchema.set('toObject', { virtuals: true });

// 更新时间中间件
shippingOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('ShippingOrder', shippingOrderSchema);
