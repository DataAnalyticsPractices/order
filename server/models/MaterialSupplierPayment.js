import mongoose from 'mongoose';

// 材料厂付款记录（独立于订单）
const materialSupplierPaymentSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: true
  },
  materialType: {
    type: String,
    enum: ['面料', '五金', '复合', '织袋', '塑料袋', '里布', '其他'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  comment: String,
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('MaterialSupplierPayment', materialSupplierPaymentSchema);
