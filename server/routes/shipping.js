import express from 'express';
import ShippingOrder from '../models/ShippingOrder.js';

const router = express.Router();

// 获取所有发货订单（支持筛选）
router.get('/', async (req, res) => {
  try {
    const { customer, goodsName, isPaidFull, keyword, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    // 订货方筛选
    if (customer) {
      query.customer = new RegExp(customer, 'i');
    }
    
// 货品名称/货号筛选（需要在货物数组中查询）
    if (goodsName) {
      query['goods.goodsName'] = new RegExp(goodsName, 'i');
    }
    
    // 关键词搜索
    if (keyword) {
      query.$or = [
        { customer: new RegExp(keyword, 'i') },
        { 'goods.goodsName': new RegExp(keyword, 'i') },
        { 'goods.goodsId': new RegExp(keyword, 'i') },
        { 'goods.serialNumber': new RegExp(keyword, 'i') }
      ];
    }
    
    // 时间段筛选
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    let orders = await ShippingOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // 是否付清筛选（在查询后进行）
    if (isPaidFull !== undefined && isPaidFull !== '') {
      const paidFullBool = isPaidFull === 'true';
      orders = orders.filter(order => order.isPaidFull === paidFullBool);
    }
    
    const count = await ShippingOrder.countDocuments(query);
    
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

// 获取单个发货订单
router.get('/:id', async (req, res) => {
  try {
    const order = await ShippingOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新发货订单
router.post('/', async (req, res) => {
  try {
    const order = new ShippingOrder({
      customer: req.body.customer,
      goods: []
    });
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新发货订单
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      customer: req.body.customer
    };
    const order = await ShippingOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// 删除发货订单
router.delete('/:id', async (req, res) => {
  try {
    const order = await ShippingOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    res.json({ message: '订单已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加付款记录
router.post('/:id/payments', async (req, res) => {
  try {
    const order = await ShippingOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    order.paymentRecords.push(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除付款记录
router.delete('/:id/payments/:paymentId', async (req, res) => {
  try {
    const order = await ShippingOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    order.paymentRecords.pull({ _id: req.params.paymentId });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== 货物管理 ====================

// 添加货物
router.post('/:id/goods', async (req, res) => {
  try {
    const order = await ShippingOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    order.goods.push(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新货物
router.put('/:id/goods/:goodsId', async (req, res) => {
  try {
    const order = await ShippingOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    const goods = order.goods.id(req.params.goodsId);
    if (!goods) {
      return res.status(404).json({ message: '货物不存在' });
    }
    Object.assign(goods, req.body);
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除货物
router.delete('/:id/goods/:goodsId', async (req, res) => {
  try {
    const order = await ShippingOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    order.goods.pull({ _id: req.params.goodsId });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 计算总欠款
router.get('/stats/total-owed', async (req, res) => {
  try {
    const { customer, goodsName, isPaidFull, keyword, startDate, endDate } = req.query;
    
    let query = {};
    
    if (customer) {
      query.customer = new RegExp(customer, 'i');
    }
    
    if (goodsName) {
      query.$or = [
        { 'goods.goodsName': new RegExp(goodsName, 'i') },
        { 'goods.goodsId': new RegExp(goodsName, 'i') }
      ];
    }
    
    if (keyword) {
      query.$or = [
        { customer: new RegExp(keyword, 'i') },
        { 'goods.goodsName': new RegExp(keyword, 'i') },
        { 'goods.goodsId': new RegExp(keyword, 'i') }
      ];
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    let orders = await ShippingOrder.find(query);
    
    if (isPaidFull !== undefined && isPaidFull !== '') {
      const paidFullBool = isPaidFull === 'true';
      orders = orders.filter(order => order.isPaidFull === paidFullBool);
    }
    
    const totalOwed = orders.reduce((sum, order) => sum + order.amountOwed, 0);
    
    res.json({ totalOwed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
