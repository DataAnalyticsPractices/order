<template>
  <div class="shipping-container">
    <!-- 顶部操作栏 -->
    <el-card class="header-card" shadow="never">
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog" :icon="Plus">新建订单</el-button>
        <el-button type="success" @click="exportToExcel" :icon="Download">导出Excel</el-button>
        <div class="total-owed">
          客户总欠款: <span class="amount">¥{{ totalOwed.toFixed(2) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="订货方">
          <el-input v-model="filters.customer" placeholder="请输入订货方" clearable @change="loadOrders" />
        </el-form-item>
        <el-form-item label="货品名称/货号">
          <el-input v-model="filters.goodsName" placeholder="请输入货品名称或货号" clearable @change="loadOrders" />
        </el-form-item>
        <el-form-item label="付款状态">
          <el-select v-model="filters.isPaidFull" placeholder="选择付款状态" clearable @change="loadOrders" style="width: 200px;">
            <el-option label="已付清" value="true" />
            <el-option label="未付清" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词搜索">
          <el-input v-model="filters.keyword" placeholder="搜索任意内容" clearable @change="loadOrders" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="loadOrders"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadOrders">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="orders-card" shadow="never">
      <div v-if="loading" style="text-align: center; padding: 40px;">
        <el-icon class="is-loading" size="32"><Loading /></el-icon>
        <div>加载中...</div>
      </div>
      <div v-else>
        <el-table ref="shippingTableRef" :data="orders" border stripe max-height="600" style="width: 100%;" :expand-row-keys="expandedRowIds" @expand="handleRowExpand">
          <el-table-column type="expand" width="50">
            <template #default="{ row }">
              <div class="order-detail">
                <!-- 货物信息部分 -->
                <div class="detail-section">
                  <div class="section-header">
                    <h4>货物信息</h4>
                    <el-button size="small" type="primary" @click="showAddGoodsDialog(row)">添加货物</el-button>
                  </div>
                  <el-table :data="row.goods" size="small" border>
                    <el-table-column prop="goodsName" label="货物名称" />
                    <el-table-column prop="goodsId" label="货号" width="100" />
                    <el-table-column prop="serialNumber" label="编号" width="100" />
                    <el-table-column prop="quantity" label="数量" width="70" />
                    <el-table-column prop="pricePerUnit" label="单价" width="80">
                      <template #default="{ row: goods }">
                        ¥{{ goods.pricePerUnit.toFixed(2) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="pieceCount" label="件数" width="70" />
                    <el-table-column prop="totalGoodsPrice" label="总价" width="90">
                      <template #default="{ row: goods }">
                        ¥{{ goods.totalGoodsPrice.toFixed(2) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="shippingFee" label="运费" width="100">
                      <template #default="{ row: goods }">
                        ¥{{ goods.shippingFee.toFixed(2) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="应付价" width="120">
                      <template #default="{ row: goods }">
                        ¥{{ (goods.totalGoodsPrice + goods.shippingFee).toFixed(2) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100">
                      <template #default="{ row: goods }">
                        <el-button size="small" type="info" link @click="showEditGoodsDialog(row, goods)">编辑</el-button>
                        <el-button size="small" type="danger" link @click="deleteGoods(row._id, goods._id)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <!-- 付款记录部分 -->
                <div class="detail-section">
                  <div class="section-header">
                    <h4>付款记录</h4>
                    <el-button size="small" type="primary" @click="showAddPaymentDialog(row)">添加付款</el-button>
                  </div>
                  <el-table :data="row.paymentRecords" size="small" border>
                    <el-table-column prop="deposit" label="定金" width="120">
                      <template #default="{ row: payment }">
                        <span :class="{ 'negative-price': payment.deposit < 0 }">¥{{ payment.deposit.toFixed(2) }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="paidAmount" label="已付金额" width="120">
                      <template #default="{ row: payment }">
                        <span :class="{ 'negative-price': payment.paidAmount < 0 }">¥{{ payment.paidAmount.toFixed(2) }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="comment" label="备注" min-width="100" />
                    <el-table-column prop="date" label="日期" width="100">
                      <template #default="{ row: payment }">
                        {{ formatDate(payment.date) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="70">
                      <template #default="{ row: payment }">
                        <el-button size="small" type="danger" link @click="deletePaymentRecord(row._id, payment._id)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="customer" label="订货方" width="150" />
          <el-table-column label="货物信息" min-width="150">
            <template #default="{ row }">
              <div v-if="row.goods && row.goods.length > 0">
                <div v-for="(goods, index) in row.goods" :key="index" style="font-size: 12px; line-height: 1.5;">
                  <div>{{ goods.goodsName }} ({{ goods.goodsId }})</div>
                </div>
              </div>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="80">
            <template #default="{ row }">
              {{ row.goods ? row.goods.reduce((sum, g) => sum + g.quantity, 0) : 0 }}
            </template>
          </el-table-column>
          <el-table-column label="货物总价" width="120">
            <template #default="{ row }">
              ¥{{ (row.goods ? row.goods.reduce((sum, g) => sum + g.totalGoodsPrice, 0) : 0).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="总运费" width="100">
            <template #default="{ row }">
              ¥{{ (row.goods ? row.goods.reduce((sum, g) => sum + g.shippingFee, 0) : 0).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="应付总额" width="120">
            <template #default="{ row }">
              <span class="amount-owed" :class="{ 'paid-full': row.isPaidFull }">
                ¥{{ row.totalDue.toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="已付金额" width="120">
            <template #default="{ row }">
              ¥{{ calculateTotalPaid(row).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="欠款金额" width="120">
            <template #default="{ row }">
              <span class="amount-owed" :class="{ 'paid-full': row.isPaidFull }">
                ¥{{ row.amountOwed.toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.isPaidFull ? 'success' : 'danger'">
                {{ row.isPaidFull ? '已付清' : '未付清' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="showEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" link @click="deleteOrder(row._id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 订单对话框（仅编辑订货方） -->
    <el-dialog v-model="orderDialogVisible" :title="isEdit ? '编辑订单' : '新建订单'" width="500px">
      <el-form :model="orderForm" label-width="100px">
        <el-form-item label="订货方" required>
          <el-input v-model="orderForm.customer" placeholder="请输入订货方名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOrder">保存</el-button>
      </template>
    </el-dialog>

    <!-- 货物对话框 -->
    <el-dialog v-model="goodsDialogVisible" :title="isEditGoods ? '编辑货物' : '添加货物'" width="600px">
      <el-form :model="goodsForm" label-width="100px">
        <el-form-item label="货物名称" required>
          <el-input v-model="goodsForm.goodsName" placeholder="请输入货物名称" />
        </el-form-item>
        <el-form-item label="货号">
          <el-input v-model="goodsForm.goodsId" placeholder="请输入货号" />
        </el-form-item>
        <el-form-item label="编号">
          <el-input v-model="goodsForm.serialNumber" placeholder="请输入编号" />
        </el-form-item>
        <el-form-item label="货物图片">
          <el-upload
            class="image-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleGoodsImageChange"
            accept="image/*"
          >
            <img v-if="goodsForm.goodsImage" :src="goodsForm.goodsImage" class="upload-image" />
            <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="image-upload-tip">提示: 点击上传图片，支持 JPG/PNG 格式</div>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日期">
              <el-date-picker v-model="goodsForm.date" type="date" placeholder="选择日期" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量">
              <el-input-number v-model="goodsForm.quantity" :min="0" @change="calculateGoodsTotal" placeholder="数量" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单价">
              <el-input-number v-model="goodsForm.pricePerUnit" :min="0" :precision="2" @change="calculateGoodsTotal" placeholder="单价" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="件数">
              <el-input-number v-model="goodsForm.pieceCount" :min="0" placeholder="件数" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="货物总价">
          <el-input-number v-model="goodsForm.totalGoodsPrice" :min="0" :precision="2" placeholder="货物总价" style="width: 100%;" />
          <div style="font-size: 12px; color: #909399; margin-top: 5px;">
            自动计算: {{ (goodsForm.quantity * goodsForm.pricePerUnit).toFixed(2) }}
          </div>
        </el-form-item>
        <el-form-item label="运费">
          <el-input-number v-model="goodsForm.shippingFee" :precision="2" placeholder="运费（可为负数）" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="goodsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGoods">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加付款对话框 -->
    <el-dialog v-model="paymentDialogVisible" title="添加付款记录" width="500px">
      <el-form :model="paymentForm" label-width="100px">
        <el-form-item label="定金">
          <el-input-number v-model="paymentForm.deposit" :precision="2" placeholder="定金（可为负数）" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="已付金额">
          <el-input-number v-model="paymentForm.paidAmount" :precision="2" placeholder="已付金额（可为负数）" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="paymentForm.comment" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="paymentForm.date" type="date" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="paymentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePayment">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Loading } from '@element-plus/icons-vue'
import * as shippingAPI from '../api/shipping'
import { exportShippingToExcel } from '../utils/excel'

// 用于取消pending请求
let abortController = null

const loading = ref(false)
const orders = ref([])
const totalOwed = ref(0)
const expandedRowIds = ref([])
const shippingTableRef = ref(null)

const filters = reactive({
  customer: '',
  goodsName: '',
  isPaidFull: '',
  keyword: '',
  dateRange: null
})

// 订单对话框
const orderDialogVisible = ref(false)
const isEdit = ref(false)
const orderForm = reactive({
  _id: null,
  customer: ''
})

// 货物对话框
const goodsDialogVisible = ref(false)
const isEditGoods = ref(false)
const currentOrderId = ref(null)
const currentGoodsId = ref(null)
const goodsForm = reactive({
  goodsImage: '',
  goodsName: '',
  goodsId: '',
  serialNumber: '',
  quantity: 0,
  pricePerUnit: 0,
  pieceCount: 0,
  totalGoodsPrice: 0,
  shippingFee: 0,
  date: new Date()
})

// 付款对话框
const paymentDialogVisible = ref(false)
const paymentForm = reactive({
  deposit: 0,
  paidAmount: 0,
  comment: '',
  date: new Date()
})

// 计算货物总价
const calculateGoodsTotal = () => {
  if (goodsForm.quantity && goodsForm.pricePerUnit) {
    goodsForm.totalGoodsPrice = goodsForm.quantity * goodsForm.pricePerUnit
  }
}

// 处理货物图片上传
const handleGoodsImageChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    goodsForm.goodsImage = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 加载订单列表
const loadOrders = async () => {
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()
  
  loading.value = true
  try {
    const params = {
      customer: filters.customer || '',
      goodsName: filters.goodsName || '',
      isPaidFull: filters.isPaidFull || '',
      keyword: filters.keyword || '',
      limit: 100
    }
    
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0].toISOString()
      params.endDate = filters.dateRange[1].toISOString()
    }
    
    const result = await shippingAPI.getShippingOrders(params)
    orders.value = result.orders || []
    
    await loadTotalOwed()
  } catch (error) {
    if (error.code !== 'ERR_CANCELED') {
      console.error('加载数据失败:', error)
      ElMessage.error('加载数据失败: ' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 加载总欠款
const loadTotalOwed = async () => {
  try {
    const params = {
      customer: filters.customer,
      goodsName: filters.goodsName,
      isPaidFull: filters.isPaidFull,
      keyword: filters.keyword
    }
    
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0].toISOString()
      params.endDate = filters.dateRange[1].toISOString()
    }
    
    const result = await shippingAPI.getTotalOwed(params)
    totalOwed.value = result.totalOwed || 0
  } catch (error) {
    console.error('加载总欠款失败:', error)
  }
}

// 重置筛选条件
const resetFilters = () => {
  filters.customer = ''
  filters.goodsName = ''
  filters.isPaidFull = ''
  filters.keyword = ''
  filters.dateRange = null
  loadOrders()
}

// 显示新建订单对话框
const showCreateDialog = () => {
  isEdit.value = false
  orderForm._id = null
  orderForm.customer = ''
  orderDialogVisible.value = true
}

// 显示编辑订单对话框
const showEditDialog = (order) => {
  isEdit.value = true
  orderForm._id = order._id
  orderForm.customer = order.customer
  orderDialogVisible.value = true
}

// 保存订单
const saveOrder = async () => {
  if (!orderForm.customer) {
    ElMessage.warning('请填写订货方')
    return
  }
  
  try {
    if (isEdit.value) {
      await shippingAPI.updateShippingOrder(orderForm._id, {
        customer: orderForm.customer
      })
      ElMessage.success('更新成功')
    } else {
      await shippingAPI.createShippingOrder({
        customer: orderForm.customer
      })
      ElMessage.success('创建成功')
    }
    orderDialogVisible.value = false
    loadOrders()
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  }
}

// 删除订单
const deleteOrder = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除这条订单吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await shippingAPI.deleteShippingOrder(id)
    ElMessage.success('删除成功')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 显示添加货物对话框
const showAddGoodsDialog = (order) => {
  isEditGoods.value = false
  currentOrderId.value = order._id
  currentGoodsId.value = null
  goodsForm.goodsImage = ''
  goodsForm.goodsName = ''
  goodsForm.goodsId = ''
  goodsForm.serialNumber = ''
  goodsForm.quantity = 0
  goodsForm.pricePerUnit = 0
  goodsForm.pieceCount = 0
  goodsForm.totalGoodsPrice = 0
  goodsForm.shippingFee = 0
  goodsForm.date = new Date()
  goodsDialogVisible.value = true
}

// 显示编辑货物对话框
const showEditGoodsDialog = (order, goods) => {
  isEditGoods.value = true
  currentOrderId.value = order._id
  currentGoodsId.value = goods._id
  goodsForm.goodsImage = goods.goodsImage
  goodsForm.goodsName = goods.goodsName
  goodsForm.goodsId = goods.goodsId
  goodsForm.serialNumber = goods.serialNumber
  goodsForm.quantity = goods.quantity
  goodsForm.pricePerUnit = goods.pricePerUnit
  goodsForm.pieceCount = goods.pieceCount
  goodsForm.totalGoodsPrice = goods.totalGoodsPrice
  goodsForm.shippingFee = goods.shippingFee
  goodsForm.date = new Date(goods.date)
  goodsDialogVisible.value = true
}

// 保存货物
const saveGoods = async () => {
  if (!goodsForm.goodsName) {
    ElMessage.warning('请填写货物名称')
    return
  }
  
  try {
    if (isEditGoods.value) {
      const result = await shippingAPI.updateShippingGoods(currentOrderId.value, currentGoodsId.value, goodsForm)
      ElMessage.success('编辑成功')
      
      const orderIndex = orders.value.findIndex(o => o._id === currentOrderId.value)
      if (orderIndex !== -1) {
        const order = orders.value[orderIndex]
        order.goods = result.goods
        await loadTotalOwed()
        await nextTick()
        if (shippingTableRef.value && order) {
          shippingTableRef.value.toggleRowExpansion(order, true)
        }
      }
    } else {
      const result = await shippingAPI.addShippingGoods(currentOrderId.value, goodsForm)
      ElMessage.success('添加成功')
      
      const orderIndex = orders.value.findIndex(o => o._id === currentOrderId.value)
      if (orderIndex !== -1) {
        const order = orders.value[orderIndex]
        order.goods = result.goods
        await loadTotalOwed()
        await nextTick()
        if (shippingTableRef.value && order) {
          shippingTableRef.value.toggleRowExpansion(order, true)
        }
      }
    }
    goodsDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  }
}

// 删除货物
const deleteGoods = async (orderId, goodsId) => {
  try {
    await ElMessageBox.confirm('确定删除这个货物吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const result = await shippingAPI.deleteShippingGoods(orderId, goodsId)
    ElMessage.success('删除成功')
    
    const orderIndex = orders.value.findIndex(o => o._id === orderId)
    if (orderIndex !== -1) {
      const order = orders.value[orderIndex]
      order.goods = result.goods
      await loadTotalOwed()
      await nextTick()
      if (shippingTableRef.value && order) {
        shippingTableRef.value.toggleRowExpansion(order, true)
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 处理表格行展开
const handleRowExpand = ({ row, expanded }) => {
  if (expanded) {
    if (!expandedRowIds.value.includes(row._id)) {
      expandedRowIds.value.push(row._id)
    }
  } else {
    expandedRowIds.value = expandedRowIds.value.filter(id => id !== row._id)
  }
}

// 显示添加付款对话框
const showAddPaymentDialog = (order) => {
  currentOrderId.value = order._id
  paymentForm.deposit = 0
  paymentForm.paidAmount = 0
  paymentForm.comment = ''
  paymentForm.date = new Date()
  paymentDialogVisible.value = true
}

// 保存付款
const savePayment = async () => {
  try {
    const currentId = currentOrderId.value
    
    const result = await shippingAPI.addShippingPayment(currentId, paymentForm)
    ElMessage.success('添加成功')
    paymentDialogVisible.value = false
    
    const orderIndex = orders.value.findIndex(o => o._id === currentId)
    if (orderIndex !== -1) {
      const order = orders.value[orderIndex]
      const currentOrder = order
      
      order.paymentRecords = result.paymentRecords
      order.amountOwed = result.amountOwed
      order.isPaidFull = result.isPaidFull
      
      await loadTotalOwed()
      
      await nextTick()
      if (shippingTableRef.value && currentOrder) {
        shippingTableRef.value.toggleRowExpansion(currentOrder, true)
      }
    } else {
      await loadOrders()
    }
  } catch (error) {
    ElMessage.error('添加失败: ' + error.message)
  }
}

// 删除付款记录
const deletePaymentRecord = async (orderId, paymentId) => {
  try {
    await ElMessageBox.confirm('确定删除这条付款记录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await shippingAPI.deleteShippingPayment(orderId, paymentId)
    ElMessage.success('删除成功')
    
    const orderIndex = orders.value.findIndex(o => o._id === orderId)
    if (orderIndex !== -1) {
      const order = orders.value[orderIndex]
      const currentOrder = order
      
      order.paymentRecords = result.paymentRecords
      order.amountOwed = result.amountOwed
      order.isPaidFull = result.isPaidFull
      
      await loadTotalOwed()
      
      await nextTick()
      if (shippingTableRef.value && currentOrder) {
        shippingTableRef.value.toggleRowExpansion(currentOrder, true)
      }
    } else {
      await loadOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 导出到Excel
const exportToExcel = async () => {
  try {
    exportShippingToExcel(orders.value, '发货货款统计')
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  }
}

// 计算已付总额
const calculateTotalPaid = (order) => {
  return order.paymentRecords.reduce((sum, record) => 
    sum + record.deposit + record.paidAmount, 0
  )
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  loadOrders()
})

onBeforeUnmount(() => {
  if (abortController) {
    abortController.abort()
  }
})
</script>

<style scoped>
.shipping-container {
  max-width: 1600px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-owed {
  margin-left: auto;
  font-size: 18px;
  font-weight: bold;
}

.total-owed .amount {
  color: #f56c6c;
  font-size: 24px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin: 0;
}

.orders-card {
  margin-bottom: 20px;
}

.order-detail {
  padding: 20px;
  background-color: #f9f9f9;
}

.detail-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
}

.amount-owed {
  font-weight: bold;
  color: #f56c6c;
}

.amount-owed.paid-full {
  color: #67c23a;
}

.negative-price {
  color: #f56c6c;
}

.image-upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.image-uploader:hover {
  border-color: #409eff;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.upload-image {
  width: 178px;
  height: 178px;
  object-fit: contain;
  display: block;
}

.empty-text {
  color: #909399;
}
</style>
