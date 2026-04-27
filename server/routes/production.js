import express from 'express';
import ProductionOrder from '../models/ProductionOrder.js';
import MaterialSupplierPayment from '../models/MaterialSupplierPayment.js';

const router = express.Router();

// 获取所有生产订单（支持筛选）
router.get('/', async (req, res) => {
  try {
    const { factoryName, materialType, keyword, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    // 工厂名称筛选
    if (factoryName) {
      query.factoryName = new RegExp(factoryName, 'i');
    }
    
    // 材料类型筛选
    if (materialType) {
      query['materials.type'] = materialType;
    }
    
    // 关键词搜索
    if (keyword) {
      query.$or = [
        { factoryName: new RegExp(keyword, 'i') },
        { goodsInfo: new RegExp(keyword, 'i') },
        { 'materials.comment': new RegExp(keyword, 'i') },
        { 'payments.comment': new RegExp(keyword, 'i') }
      ];
    }
    
    // 时间段筛选
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await ProductionOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await ProductionOrder.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== 统计路由（必须在 /:id 之前）====================

// 计算总欠款
router.get('/stats/total-due', async (req, res) => {
  try {
    const { factoryName, materialType, keyword, startDate, endDate } = req.query;
    
    let query = {};
    
    if (factoryName) {
      query.factoryName = new RegExp(factoryName, 'i');
    }
    
    if (materialType) {
      query['materials.type'] = materialType;
    }
    
    if (keyword) {
      query.$or = [
        { factoryName: new RegExp(keyword, 'i') },
        { goodsInfo: new RegExp(keyword, 'i') },
        { 'materials.comment': new RegExp(keyword, 'i') }
      ];
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await ProductionOrder.find(query);
    const totalDue = orders.reduce((sum, order) => sum + order.amountDue, 0);
    
    res.json({ totalDue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== 材料厂付款管理（必须在 /:id 之前）====================

// 按材料厂关键词获取所有相关记录（订单内材料+独立付款）
router.get('/supplier-payments/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const { startDate, endDate } = req.query;
    
    // 1. 查找独立付款记录
    let supplierQuery = {
      $or: [
        { supplierName: new RegExp(keyword, 'i') },
        { comment: new RegExp(keyword, 'i') }
      ]
    };
    
    // 添加日期筛选
    if (startDate || endDate) {
      supplierQuery.date = {};
      if (startDate) supplierQuery.date.$gte = new Date(startDate);
      if (endDate) supplierQuery.date.$lte = new Date(endDate);
    }
    
    const supplierPayments = await MaterialSupplierPayment.find(supplierQuery).sort({ date: -1 });
    
    // 2. 查找订单中的材料记录
    const orders = await ProductionOrder.find({
      'materials.comment': new RegExp(keyword, 'i')
    });
    
    // 3. 提取匹配的材料记录，并按日期筛选
    const materialRecords = [];
    orders.forEach(order => {
      order.materials.forEach(material => {
        if (material.comment && material.comment.match(new RegExp(keyword, 'i'))) {
          // 日期筛选
          let includeRecord = true;
          if (startDate || endDate) {
            const materialDate = new Date(material.date);
            if (startDate && materialDate < new Date(startDate)) includeRecord = false;
            if (endDate && materialDate > new Date(endDate)) includeRecord = false;
          }
          
          if (includeRecord) {
            materialRecords.push({
              _id: material._id,
              orderId: order._id,
              factoryName: order.factoryName,
              goodsInfo: order.goodsInfo,
              type: material.type,
              comment: material.comment,
              price: material.price,
              date: material.date,
              source: 'order' // 标记来源
            });
          }
        }
      });
    });
    
    // 计算总金额 - 尚欠材料厂款 = 材料总额 - 独立付款总额
    const supplierTotal = supplierPayments.reduce((sum, p) => sum + p.amount, 0);
    const materialTotal = materialRecords.reduce((sum, m) => sum + m.price, 0);
    const amountDue = materialTotal - supplierTotal; // 尚欠材料厂款
    
    res.json({
      supplierPayments,
      materialRecords,
      summary: {
        supplierPaymentTotal: supplierTotal,
        materialRecordTotal: materialTotal,
        amountDue: amountDue, // 尚欠材料厂款
        supplierPaymentCount: supplierPayments.length,
        materialRecordCount: materialRecords.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取所有材料厂付款记录
router.get('/supplier-payments', async (req, res) => {
  try {
    const { supplierName, materialType, keyword, startDate, endDate } = req.query;
    
    let query = {};
    
    if (supplierName) {
      query.supplierName = new RegExp(supplierName, 'i');
    }
    
    if (materialType) {
      query.materialType = materialType;
    }
    
    if (keyword) {
      query.$or = [
        { supplierName: new RegExp(keyword, 'i') },
        { comment: new RegExp(keyword, 'i') }
      ];
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const payments = await MaterialSupplierPayment.find(query).sort({ date: -1 });
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建材料厂付款记录
router.post('/supplier-payments', async (req, res) => {
  try {
    const payment = new MaterialSupplierPayment(req.body);
    const newPayment = await payment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新材料厂付款记录
router.put('/supplier-payments/:paymentId', async (req, res) => {
  try {
    const payment = await MaterialSupplierPayment.findByIdAndUpdate(
      req.params.paymentId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ message: '付款记录不存在' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除材料厂付款记录
router.delete('/supplier-payments/:paymentId', async (req, res) => {
  try {
    const payment = await MaterialSupplierPayment.findByIdAndDelete(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: '付款记录不存在' });
    }
    res.json({ message: '付款记录已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== 订单 CRUD 路由 ====================

// 获取单个生产订单
router.get('/:id', async (req, res) => {
  try {
    const order = await ProductionOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新生产订单
router.post('/', async (req, res) => {
  try {
    const order = new ProductionOrder(req.body);
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新生产订单
router.put('/:id', async (req, res) => {
  try {
    const order = await ProductionOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除生产订单
router.delete('/:id', async (req, res) => {
  try {
    const order = await ProductionOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    res.json({ message: '订单已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加材料记录
router.post('/:id/materials', async (req, res) => {
  try {
    const order = await ProductionOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    order.materials.push(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新材料记录
router.put('/:id/materials/:materialId', async (req, res) => {
  try {
    const order = await ProductionOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    const material = order.materials.id(req.params.materialId);
    if (!material) {
      return res.status(404).json({ message: '材料记录不存在' });
    }
    Object.assign(material, req.body);
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除材料记录
router.delete('/:id/materials/:materialId', async (req, res) => {
  try {
    const order = await ProductionOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    order.materials.pull({ _id: req.params.materialId });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加付款记录
router.post('/:id/payments', async (req, res) => {
  try {
    const order = await ProductionOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    order.payments.push(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新付款记录
router.put('/:id/payments/:paymentId', async (req, res) => {
  try {
    const order = await ProductionOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    const payment = order.payments.id(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: '付款记录不存在' });
    }
    Object.assign(payment, req.body);
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除付款记录
router.delete('/:id/payments/:paymentId', async (req, res) => {
  try {
    const order = await ProductionOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    order.payments.pull({ _id: req.params.paymentId });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
