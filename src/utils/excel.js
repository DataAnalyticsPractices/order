import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 导出生产账单到Excel
export const exportProductionToExcel = (orders, filename = '生产账单') => {
  // 创建工作簿
  const wb = XLSX.utils.book_new()

  // 1. 订单汇总表
  const summaryData = []
  summaryData.push(['生产账单汇总'])
  summaryData.push([])
  summaryData.push(['工厂名称', '货物信息', '数量', '单价', '生产总价', '材料费用', '已付款', '应付金额', '创建日期'])

  orders.forEach(order => {
    const materialCost = order.materials.reduce((sum, m) => sum + m.price, 0)
    const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0)
    
    summaryData.push([
      order.factoryName,
      order.goodsInfo || '',
      order.amount || 0,
      order.pricePerItem || 0,
      order.totalProductionPrice,
      materialCost,
      paidAmount,
      order.amountDue,
      formatDate(order.createdAt)
    ])
  })

  // 计算总计
  summaryData.push([])
  const totalProduction = orders.reduce((sum, o) => sum + o.totalProductionPrice, 0)
  const totalMaterial = orders.reduce((sum, o) => 
    sum + o.materials.reduce((s, m) => s + m.price, 0), 0
  )
  const totalPaid = orders.reduce((sum, o) => 
    sum + o.payments.reduce((s, p) => s + p.amount, 0), 0
  )
  const totalDue = orders.reduce((sum, o) => sum + o.amountDue, 0)
  
  summaryData.push(['总计', '', '', '', totalProduction, totalMaterial, totalPaid, totalDue, ''])

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  
  // 设置列宽
  summarySheet['!cols'] = [
    { wch: 20 }, // 工厂名称
    { wch: 20 }, // 货物信息
    { wch: 10 }, // 数量
    { wch: 10 }, // 单价
    { wch: 12 }, // 生产总价
    { wch: 12 }, // 材料费用
    { wch: 12 }, // 已付款
    { wch: 12 }, // 应付金额
    { wch: 12 }  // 创建日期
  ]
  
  XLSX.utils.book_append_sheet(wb, summarySheet, '订单汇总')

  // 2. 详细信息表
  const detailData = []
  detailData.push(['生产账单详细信息'])
  detailData.push([])

  orders.forEach((order, index) => {
    // 订单基本信息
    detailData.push([`订单 ${index + 1}：${order.factoryName}`])
    detailData.push(['工厂名称', order.factoryName])
    detailData.push(['货物信息', order.goodsInfo || ''])
    detailData.push(['数量', order.amount || 0])
    detailData.push(['单价', order.pricePerItem || 0])
    detailData.push(['生产总价', order.totalProductionPrice])
    detailData.push(['创建日期', formatDate(order.createdAt)])
    detailData.push([])

    // 材料信息
    if (order.materials && order.materials.length > 0) {
      detailData.push(['材料/其他费用'])
      detailData.push(['类型', '备注', '价格', '日期'])
      order.materials.forEach(material => {
        detailData.push([
          material.type,
          material.comment || '',
          material.price,
          formatDate(material.date)
        ])
      })
      const materialTotal = order.materials.reduce((sum, m) => sum + m.price, 0)
      detailData.push(['材料费用小计', '', materialTotal, ''])
      detailData.push([])
    }

    // 付款记录
    if (order.payments && order.payments.length > 0) {
      detailData.push(['付款记录'])
      detailData.push(['付款对象', '备注', '金额', '日期'])
      order.payments.forEach(payment => {
        detailData.push([
          payment.paymentTo,
          payment.comment || '',
          payment.amount,
          formatDate(payment.date)
        ])
      })
      const paymentTotal = order.payments.reduce((sum, p) => sum + p.amount, 0)
      detailData.push(['付款小计', '', paymentTotal, ''])
      detailData.push([])
    }

    // 应付金额
    detailData.push(['应付金额', order.amountDue])
    detailData.push([])
    detailData.push(['----------------------------------------'])
    detailData.push([])
  })

  const detailSheet = XLSX.utils.aoa_to_sheet(detailData)
  
  // 设置列宽
  detailSheet['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 12 }
  ]
  
  XLSX.utils.book_append_sheet(wb, detailSheet, '详细信息')

  // 3. 材料汇总表
  const materialSummary = {}
  orders.forEach(order => {
    order.materials.forEach(material => {
      const key = `${material.type}-${material.comment || '无备注'}`
      if (!materialSummary[key]) {
        materialSummary[key] = {
          type: material.type,
          comment: material.comment || '无备注',
          totalPrice: 0,
          count: 0
        }
      }
      materialSummary[key].totalPrice += material.price
      materialSummary[key].count += 1
    })
  })

  const materialData = []
  materialData.push(['材料费用汇总'])
  materialData.push([])
  materialData.push(['材料类型', '备注', '次数', '总金额'])

  Object.values(materialSummary).forEach(item => {
    materialData.push([
      item.type,
      item.comment,
      item.count,
      item.totalPrice
    ])
  })

  const materialSheet = XLSX.utils.aoa_to_sheet(materialData)
  
  // 设置列宽
  materialSheet['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 10 },
    { wch: 15 }
  ]
  
  XLSX.utils.book_append_sheet(wb, materialSheet, '材料汇总')

  // 保存文件
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${filename}_${Date.now()}.xlsx`)
}

// 导出发货货款到Excel
export const exportShippingToExcel = (orders, filename = '发货货款统计') => {
  // 创建工作簿
  const wb = XLSX.utils.book_new()

  // 1. 订单汇总表
  const summaryData = []
  summaryData.push(['发货货款统计'])
  summaryData.push([])
  summaryData.push([
    '订货方', '货物名称', '货号', '编号', '日期(最早)', '数量(合计)', '单价(均价)',
    '件数(合计)', '货物总价(合计)', '运费(合计)', '应付总价', '已付款', '欠款金额', '付款状态'
  ])

  orders.forEach(order => {
    const goodsList = order.goods || []
    const totalPaid = order.paymentRecords.reduce((sum, p) => 
      sum + p.deposit + p.paidAmount, 0
    )
    const totalQuantity = goodsList.reduce((sum, g) => sum + (g.quantity || 0), 0)
    const totalPieceCount = goodsList.reduce((sum, g) => sum + (g.pieceCount || 0), 0)
    const totalGoodsPrice = goodsList.reduce((sum, g) => sum + (g.totalGoodsPrice || 0), 0)
    const totalShippingFee = goodsList.reduce((sum, g) => sum + (g.shippingFee || 0), 0)
    const avgPricePerUnit = goodsList.length > 0
      ? goodsList.reduce((sum, g) => sum + (g.pricePerUnit || 0), 0) / goodsList.length
      : 0
    const earliestDate = goodsList.length > 0
      ? new Date(Math.min(...goodsList.map(g => new Date(g.date || Date.now()).getTime())))
      : null
    const goodsNames = goodsList.map(g => g.goodsName || '').filter(Boolean).join('、')
    const goodsIds = goodsList.map(g => g.goodsId || '').filter(Boolean).join('、')
    const serialNumbers = goodsList.map(g => g.serialNumber || '').filter(Boolean).join('、')

    summaryData.push([
      order.customer,
      goodsNames,
      goodsIds,
      serialNumbers,
      formatDate(earliestDate),
      totalQuantity,
      avgPricePerUnit,
      totalPieceCount,
      totalGoodsPrice,
      totalShippingFee,
      order.totalDue,
      totalPaid,
      order.amountOwed,
      order.isPaidFull ? '已付清' : '未付清'
    ])
  })

  // 计算总计
  summaryData.push([])
  const totalGoodsPrice = orders.reduce((sum, o) => sum + (o.totalGoodsPrice || 0), 0)
  const totalShippingFee = orders.reduce((sum, o) => 
    sum + ((o.totalShippingFee !== undefined)
      ? o.totalShippingFee
      : (o.goods || []).reduce((s, g) => s + (g.shippingFee || 0), 0)), 0
  )
  const totalDue = orders.reduce((sum, o) => sum + o.totalDue, 0)
  const totalPaidAll = orders.reduce((sum, o) => 
    sum + o.paymentRecords.reduce((s, p) => s + p.deposit + p.paidAmount, 0), 0
  )
  const totalOwed = orders.reduce((sum, o) => sum + o.amountOwed, 0)
  
  summaryData.push([
    '总计', '', '', '', '', '', '', '', 
    totalGoodsPrice, totalShippingFee, totalDue, totalPaidAll, totalOwed, ''
  ])

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  
  // 设置列宽
  summarySheet['!cols'] = [
    { wch: 15 }, // 订货方
    { wch: 20 }, // 货物名称
    { wch: 15 }, // 货号
    { wch: 12 }, // 编号
    { wch: 12 }, // 日期
    { wch: 8 },  // 数量
    { wch: 10 }, // 单价
    { wch: 8 },  // 件数
    { wch: 12 }, // 货物总价
    { wch: 10 }, // 运费
    { wch: 12 }, // 应付总价
    { wch: 12 }, // 已付款
    { wch: 12 }, // 欠款金额
    { wch: 10 }  // 付款状态
  ]
  
  XLSX.utils.book_append_sheet(wb, summarySheet, '订单汇总')

  // 2. 详细信息表（包含付款记录）
  const detailData = []
  detailData.push(['发货货款详细信息'])
  detailData.push([])

  orders.forEach((order, index) => {
    // 订单基本信息
    detailData.push([`订单 ${index + 1}：${order.customer}`])
    detailData.push(['订货方', order.customer])
    detailData.push(['应付总价', order.totalDue])
    detailData.push([])
    detailData.push(['货物明细'])
    detailData.push(['货物名称', '货号', '编号', '日期', '数量', '单价', '件数', '货物总价', '运费', '应付价'])
    ;(order.goods || []).forEach(goods => {
      detailData.push([
        goods.goodsName || '',
        goods.goodsId || '',
        goods.serialNumber || '',
        formatDate(goods.date),
        goods.quantity || 0,
        goods.pricePerUnit || 0,
        goods.pieceCount || 0,
        goods.totalGoodsPrice || 0,
        goods.shippingFee || 0,
        (goods.totalGoodsPrice || 0) + (goods.shippingFee || 0)
      ])
    })
    detailData.push([])

    // 付款记录
    if (order.paymentRecords && order.paymentRecords.length > 0) {
      detailData.push(['付款记录'])
      detailData.push(['定金', '已付金额', '备注', '日期'])
      order.paymentRecords.forEach(payment => {
        detailData.push([
          payment.deposit,
          payment.paidAmount,
          payment.comment || '',
          formatDate(payment.date)
        ])
      })
      const totalPaid = order.paymentRecords.reduce((sum, p) => 
        sum + p.deposit + p.paidAmount, 0
      )
      detailData.push(['已付款合计', totalPaid, '', ''])
      detailData.push([])
    }

    // 欠款金额
    detailData.push(['欠款金额', order.amountOwed])
    detailData.push(['付款状态', order.isPaidFull ? '已付清' : '未付清'])
    detailData.push([])
    detailData.push(['----------------------------------------'])
    detailData.push([])
  })

  const detailSheet = XLSX.utils.aoa_to_sheet(detailData)
  
  // 设置列宽
  detailSheet['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 20 },
    { wch: 12 }
  ]
  
  XLSX.utils.book_append_sheet(wb, detailSheet, '详细信息')

  // 3. 客户汇总表
  const customerSummary = {}
  orders.forEach(order => {
    if (!customerSummary[order.customer]) {
      customerSummary[order.customer] = {
        customer: order.customer,
        orderCount: 0,
        totalDue: 0,
        totalPaid: 0,
        totalOwed: 0
      }
    }
    customerSummary[order.customer].orderCount += 1
    customerSummary[order.customer].totalDue += order.totalDue
    customerSummary[order.customer].totalPaid += order.paymentRecords.reduce((sum, p) => 
      sum + p.deposit + p.paidAmount, 0
    )
    customerSummary[order.customer].totalOwed += order.amountOwed
  })

  const customerData = []
  customerData.push(['客户统计汇总'])
  customerData.push([])
  customerData.push(['客户名称', '订单数量', '应付总额', '已付款', '欠款金额'])

  Object.values(customerSummary).forEach(item => {
    customerData.push([
      item.customer,
      item.orderCount,
      item.totalDue,
      item.totalPaid,
      item.totalOwed
    ])
  })

  const customerSheet = XLSX.utils.aoa_to_sheet(customerData)
  
  // 设置列宽
  customerSheet['!cols'] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 }
  ]
  
  XLSX.utils.book_append_sheet(wb, customerSheet, '客户汇总')

  // 保存文件
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${filename}_${Date.now()}.xlsx`)
}
