import api from './index'

// 获取发货订单列表
export const getShippingOrders = (params) => {
  return api.get('/shipping', { params })
}

// 获取单个发货订单
export const getShippingOrder = (id) => {
  return api.get(`/shipping/${id}`)
}

// 创建发货订单
export const createShippingOrder = (data) => {
  return api.post('/shipping', data)
}

// 更新发货订单
export const updateShippingOrder = (id, data) => {
  return api.put(`/shipping/${id}`, data)
}

// 删除发货订单
export const deleteShippingOrder = (id) => {
  return api.delete(`/shipping/${id}`)
}

// ==================== 货物管理 ====================

// 添加货物
export const addShippingGoods = (id, data) => {
  return api.post(`/shipping/${id}/goods`, data)
}

// 更新货物
export const updateShippingGoods = (id, goodsId, data) => {
  return api.put(`/shipping/${id}/goods/${goodsId}`, data)
}

// 删除货物
export const deleteShippingGoods = (id, goodsId) => {
  return api.delete(`/shipping/${id}/goods/${goodsId}`)
}

// ==================== 付款管理 ====================

// 添加付款记录
export const addShippingPayment = (id, data) => {
  return api.post(`/shipping/${id}/payments`, data)
}

// 删除付款记录
export const deleteShippingPayment = (id, paymentId) => {
  return api.delete(`/shipping/${id}/payments/${paymentId}`)
}

// 获取总欠款
export const getTotalOwed = (params) => {
  return api.get('/shipping/stats/total-owed', { params })
}
