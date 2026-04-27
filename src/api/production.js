import api from './index'

// 获取生产订单列表
export const getProductionOrders = (params) => {
  return api.get('/production', { params })
}

// 获取单个生产订单
export const getProductionOrder = (id) => {
  return api.get(`/production/${id}`)
}

// 创建生产订单
export const createProductionOrder = (data) => {
  return api.post('/production', data)
}

// 更新生产订单
export const updateProductionOrder = (id, data) => {
  return api.put(`/production/${id}`, data)
}

// 删除生产订单
export const deleteProductionOrder = (id) => {
  return api.delete(`/production/${id}`)
}

// 添加材料记录
export const addMaterial = (id, data) => {
  return api.post(`/production/${id}/materials`, data)
}

// 更新材料记录
export const updateMaterial = (id, materialId, data) => {
  return api.put(`/production/${id}/materials/${materialId}`, data)
}

// 删除材料记录
export const deleteMaterial = (id, materialId) => {
  return api.delete(`/production/${id}/materials/${materialId}`)
}

// 添加付款记录
export const addPayment = (id, data) => {
  return api.post(`/production/${id}/payments`, data)
}

// 更新付款记录
export const updatePayment = (id, paymentId, data) => {
  return api.put(`/production/${id}/payments/${paymentId}`, data)
}

// 删除付款记录
export const deletePayment = (id, paymentId) => {
  return api.delete(`/production/${id}/payments/${paymentId}`)
}

// 获取总欠款
export const getTotalDue = (params) => {
  return api.get('/production/stats/total-due', { params })
}

// ==================== 材料厂付款管理 ====================

// 获取材料厂付款记录
export const getSupplierPayments = (params) => {
  return api.get('/production/supplier-payments', { params })
}

// 创建材料厂付款记录
export const createSupplierPayment = (data) => {
  return api.post('/production/supplier-payments', data)
}

// 更新材料厂付款记录
export const updateSupplierPayment = (paymentId, data) => {
  return api.put(`/production/supplier-payments/${paymentId}`, data)
}

// 删除材料厂付款记录
export const deleteSupplierPayment = (paymentId) => {
  return api.delete(`/production/supplier-payments/${paymentId}`)
}

// 按关键词搜索材料厂所有相关记录
export const searchSupplierRecords = (keyword) => {
  return api.get(`/production/supplier-payments/search/${keyword}`)
}

// 按关键词和URL参数搜索材料厂所有相关记录
export const searchSupplierRecordsByUrl = (url) => {
  return api.get(url)
}
