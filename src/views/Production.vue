<template>
  <div class="production-container">
    <!-- 顶部操作栏 -->
    <el-card class="header-card" shadow="never">
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog" :icon="Plus">新建订单</el-button>
        <el-button type="primary" @click="showSupplierPaymentDialog" :icon="Money">材料厂付款</el-button>
        <el-button type="info" @click="showSupplierSearchDialog" :icon="Search">材料厂查询</el-button>
        <el-button type="success" @click="exportToExcel('all')" :icon="Download">导出全部</el-button>
        <el-button type="success" @click="exportToExcel('filtered')" :icon="Download">导出筛选结果</el-button>
        <div class="total-due">
          总欠款: <span class="amount">¥{{ totalDue.toFixed(2) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="工厂名称">
          <el-input v-model="filters.factoryName" placeholder="请输入工厂名称" clearable @change="loadOrders" />
        </el-form-item>
        <el-form-item label="材料类型">
          <el-select v-model="filters.materialType" placeholder="选择材料类型" clearable @change="loadOrders">
            <el-option label="面料" value="面料" />
            <el-option label="五金" value="五金" />
            <el-option label="复合" value="复合" />
            <el-option label="织袋" value="织袋" />
            <el-option label="塑料袋" value="塑料袋" />
            <el-option label="里布" value="里布" />
            <el-option label="其他" value="其他" />
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
        <el-collapse v-model="activeOrders" accordion>
          <el-collapse-item v-for="order in orders" :key="order._id" :name="order._id">
            <template #title>
              <div class="order-header">
                <div class="order-info">
                  <strong>{{ order.factoryName }}</strong>
                  <span class="goods-info">{{ order.goodsInfo }}</span>
                  <span class="date">{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="order-summary">
                  <span class="price-item">生产总价: ¥{{ order.totalProductionPrice.toFixed(2) }}</span>
                  <span class="price-item">已付材料: ¥{{ calculateMaterialCost(order).toFixed(2) }}</span>
                  <span class="price-item">已付款: ¥{{ calculatePaidAmount(order).toFixed(2) }}</span>
                  <span class="amount-due" :class="{ 'negative': order.amountDue < 0 }">
                    应付: ¥{{ order.amountDue.toFixed(2) }}
                  </span>
                </div>
              </div>
            </template>

            <!-- 订单详情 -->
            <div class="order-detail">
              <div class="detail-section">
                <h4>基本信息</h4>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="工厂名称">{{ order.factoryName }}</el-descriptions-item>
                  <el-descriptions-item label="货物信息">{{ order.goodsInfo }}</el-descriptions-item>
                  <el-descriptions-item label="数量">{{ order.amount }}</el-descriptions-item>
                  <el-descriptions-item label="单价">¥{{ order.pricePerItem }}</el-descriptions-item>
                  <el-descriptions-item label="生产总价">¥{{ order.totalProductionPrice.toFixed(2) }}</el-descriptions-item>
                  <el-descriptions-item label="创建时间">{{ formatDate(order.createdAt) }}</el-descriptions-item>
                </el-descriptions>
                <div style="margin-top: 10px;">
                  <el-button size="small" type="primary" @click="showEditDialog(order)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteOrder(order._id)">删除</el-button>
                </div>
              </div>

              <div class="detail-section">
                <div class="section-header">
                  <h4>材料/其他费用</h4>
                  <el-button size="small" type="primary" @click="showAddMaterialDialog(order)">添加材料</el-button>
                </div>
                <el-table :data="order.materials" size="small" border>
                  <el-table-column prop="type" label="类型" width="100" />
                  <el-table-column prop="comment" label="备注" />
                  <el-table-column prop="price" label="价格" width="120">
                    <template #default="{ row }">
                      <span :class="{ 'negative-price': row.price < 0 }">¥{{ row.price.toFixed(2) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="date" label="日期" width="120">
                    <template #default="{ row }">
                      {{ formatDate(row.date) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                      <el-button size="small" type="primary" link @click="showEditMaterialDialog(order._id, row)">编辑</el-button>
                      <el-button size="small" type="danger" link @click="deleteMaterialRecord(order._id, row._id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div class="detail-section">
                <div class="section-header">
                  <h4>付款记录</h4>
                  <el-button size="small" type="primary" @click="showAddPaymentDialog(order)">添加付款</el-button>
                </div>
                <el-table :data="order.payments" size="small" border>
                  <el-table-column prop="paymentTo" label="付款对象" />
                  <el-table-column prop="amount" label="金额" width="120">
                    <template #default="{ row }">
                      ¥{{ row.amount.toFixed(2) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="comment" label="备注" />
                  <el-table-column prop="date" label="日期" width="120">
                    <template #default="{ row }">
                      {{ formatDate(row.date) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                      <el-button size="small" type="primary" link @click="showEditPaymentDialog(order._id, row)">编辑</el-button>
                      <el-button size="small" type="danger" link @click="deletePaymentRecord(order._id, row._id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>

        <div v-if="orders.length === 0" style="text-align: center; padding: 40px; color: #909399;">
          暂无数据
        </div>
      </div>
    </el-card>

    <!-- 新建/编辑订单对话框 -->
    <el-dialog
      v-model="orderDialogVisible"
      :title="isEdit ? '编辑订单' : '新建订单'"
      width="600px"
    >
      <el-form :model="orderForm" label-width="100px">
        <el-form-item label="工厂名称" required>
          <el-input v-model="orderForm.factoryName" placeholder="请输入工厂名称" />
        </el-form-item>
        <el-form-item label="货物信息">
          <el-input v-model="orderForm.goodsInfo" placeholder="请输入货物信息" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="orderForm.amount" :min="0" @change="calculateTotalPrice" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="orderForm.pricePerItem" :min="0" :precision="2" @change="calculateTotalPrice" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="生产总价" required>
          <el-input-number v-model="orderForm.totalProductionPrice" :min="0" :precision="2" style="width: 100%;" />
          <div style="font-size: 12px; color: #909399; margin-top: 5px;">
            自动计算: {{ (orderForm.amount * orderForm.pricePerItem).toFixed(2) }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOrder">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑材料对话框 -->
    <el-dialog v-model="materialDialogVisible" :title="isEditMaterial ? '编辑材料' : '添加材料/其他费用'" width="500px">
      <el-form :model="materialForm" label-width="80px">
        <el-form-item label="类型" required>
          <el-select v-model="materialForm.type" placeholder="选择类型">
            <el-option label="面料" value="面料" />
            <el-option label="五金" value="五金" />
            <el-option label="复合" value="复合" />
            <el-option label="织袋" value="织袋" />
            <el-option label="塑料袋" value="塑料袋" />
            <el-option label="里布" value="里布" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="materialForm.comment" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input-number v-model="materialForm.price" :precision="2" placeholder="价格（可为负数）" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="materialForm.date" type="date" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="materialDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMaterial">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑付款对话框 -->
    <el-dialog v-model="paymentDialogVisible" :title="isEditPayment ? '编辑付款' : '添加付款记录'" width="500px">
      <el-form :model="paymentForm" label-width="80px">
        <el-form-item label="付款对象" required>
          <el-input v-model="paymentForm.paymentTo" placeholder="工厂或材料厂名称" />
        </el-form-item>
        <el-form-item label="金额" required>
          <el-input-number v-model="paymentForm.amount" :min="0" :precision="2" placeholder="付款金额" style="width: 100%;" />
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

    <!-- 材料厂付款对话框 -->
    <el-dialog v-model="supplierPaymentDialogVisible" title="材料厂付款记录" width="900px">
      <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center;">
        <el-button type="primary" size="small" @click="showAddSupplierPaymentDialog">添加付款</el-button>
        <el-date-picker
          v-model="supplierPaymentDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          style="width: 240px;"
          @change="loadSupplierPayments"
        />
        <el-button size="small" @click="resetSupplierPaymentFilters">重置</el-button>
      </div>
      <el-table :data="supplierPayments" border size="small" max-height="400">
        <el-table-column prop="supplierName" label="材料厂名称" width="150" />
        <el-table-column prop="materialType" label="材料类型" width="100" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="备注" />
        <el-table-column prop="date" label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="showEditSupplierPaymentDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="deleteSupplierPaymentRecord(row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="supplierPaymentDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑材料厂付款对话框 -->
    <el-dialog v-model="supplierPaymentFormDialogVisible" :title="isEditSupplierPayment ? '编辑付款' : '添加材料厂付款'" width="500px">
      <el-form :model="supplierPaymentForm" label-width="100px">
        <el-form-item label="材料厂名称" required>
          <el-input v-model="supplierPaymentForm.supplierName" placeholder="请输入材料厂名称" />
        </el-form-item>
        <el-form-item label="材料类型" required>
          <el-select v-model="supplierPaymentForm.materialType" placeholder="选择材料类型" style="width: 100%;">
            <el-option label="面料" value="面料" />
            <el-option label="五金" value="五金" />
            <el-option label="复合" value="复合" />
            <el-option label="织袋" value="织袋" />
            <el-option label="塑料袋" value="塑料袋" />
            <el-option label="里布" value="里布" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" required>
          <el-input-number v-model="supplierPaymentForm.amount" :precision="2" placeholder="付款金额" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="supplierPaymentForm.comment" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="supplierPaymentForm.date" type="date" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="supplierPaymentFormDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSupplierPayment">保存</el-button>
      </template>
    </el-dialog>

    <!-- 材料厂查询对话框 -->
    <el-dialog v-model="supplierSearchDialogVisible" title="材料厂查询" width="1000px">
      <div style="margin-bottom: 15px;">
        <el-input
          v-model="supplierSearchKeyword"
          placeholder="输入材料厂关键词（如：信达）"
          style="width: 300px; margin-right: 10px;"
        />
        <el-date-picker
          v-model="supplierSearchDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="default"
          style="width: 240px; margin-right: 10px;"
        />
        <el-button type="primary" @click="searchSupplier">查询</el-button>
        <el-button @click="resetSupplierSearchFilters">清除</el-button>
      </div>

      <div v-if="supplierSearchResult">
        <el-alert
          :title="`查询结果：共找到 ${supplierSearchResult.summary.supplierPaymentCount} 条独立付款记录和 ${supplierSearchResult.summary.materialRecordCount} 条订单材料记录`"
          type="info"
          :closable="false"
          style="margin-bottom: 15px;"
        >
          <div style="margin-top: 10px;">
            <div>订单材料总额: ¥{{ supplierSearchResult.summary.materialRecordTotal.toFixed(2) }}</div>
            <div>独立付款总额: ¥{{ supplierSearchResult.summary.supplierPaymentTotal.toFixed(2) }}</div>
            <div style="font-weight: bold; font-size: 16px; margin-top: 5px;" :style="{ color: supplierSearchResult.summary.amountDue < 0 ? '#67c23a' : '#f56c6c' }">
              尚欠材料厂款: ¥{{ supplierSearchResult.summary.amountDue.toFixed(2) }}
            </div>
          </div>
        </el-alert>

        <el-tabs>
          <el-tab-pane label="独立付款记录">
            <el-table :data="supplierSearchResult.supplierPayments" border size="small" max-height="300">
              <el-table-column prop="supplierName" label="材料厂" width="150" />
              <el-table-column prop="materialType" label="类型" width="100" />
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="{ row }">
                  ¥{{ row.amount.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="comment" label="备注" />
              <el-table-column prop="date" label="日期" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.date) }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="订单材料记录">
            <el-table :data="supplierSearchResult.materialRecords" border size="small" max-height="300">
              <el-table-column prop="factoryName" label="订单工厂" width="130" />
              <el-table-column prop="goodsInfo" label="货物信息" width="130" />
              <el-table-column prop="type" label="材料类型" width="100" />
              <el-table-column prop="comment" label="备注" />
              <el-table-column prop="price" label="金额" width="120">
                <template #default="{ row }">
                  <span :class="{ 'negative-price': row.price < 0 }">¥{{ row.price.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="date" label="日期" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.date) }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div v-else style="text-align: center; padding: 40px; color: #909399;">
        请输入关键词进行查询
      </div>

      <template #footer>
        <el-button @click="supplierSearchDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Loading, Money, Search } from '@element-plus/icons-vue'
import * as productionAPI from '../api/production'
import { exportProductionToExcel } from '../utils/excel'

// 用于取消pending请求
let abortController = null

const loading = ref(false)
const orders = ref([])
const activeOrders = ref([])
const totalDue = ref(0)

const filters = reactive({
  factoryName: '',
  materialType: '',
  keyword: '',
  dateRange: null
})

const orderDialogVisible = ref(false)
const isEdit = ref(false)
const orderForm = reactive({
  _id: null,
  factoryName: '',
  goodsInfo: '',
  amount: 0,
  pricePerItem: 0,
  totalProductionPrice: 0
})

const materialDialogVisible = ref(false)
const isEditMaterial = ref(false)
const currentOrderId = ref(null)
const currentMaterialId = ref(null)
const materialForm = reactive({
  type: '',
  comment: '',
  price: 0,
  date: new Date()
})

const paymentDialogVisible = ref(false)
const isEditPayment = ref(false)
const currentPaymentId = ref(null)
const paymentForm = reactive({
  paymentTo: '',
  amount: 0,
  comment: '',
  date: new Date()
})

// 材料厂付款相关
const supplierPaymentDialogVisible = ref(false)
const supplierPayments = ref([])
const supplierPaymentFormDialogVisible = ref(false)
const isEditSupplierPayment = ref(false)
const currentSupplierPaymentId = ref(null)
const supplierPaymentForm = reactive({
  supplierName: '',
  materialType: '',
  amount: 0,
  comment: '',
  date: new Date()
})

// 材料厂付款筛选
const supplierPaymentDateRange = ref(null)

// 材料厂查询相关
const supplierSearchDialogVisible = ref(false)
const supplierSearchKeyword = ref('')
const supplierSearchDateRange = ref(null)
const supplierSearchResult = ref(null)

// 自动计算生产总价
const calculateTotalPrice = () => {
  if (orderForm.amount && orderForm.pricePerItem) {
    orderForm.totalProductionPrice = orderForm.amount * orderForm.pricePerItem
  }
}

// 加载订单列表
const loadOrders = async () => {
  // 取消之前的请求
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()
  
  loading.value = true
  try {
    const params = {
      factoryName: filters.factoryName || '',
      materialType: filters.materialType || '',
      keyword: filters.keyword || '',
      limit: 100
    }
    
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0].toISOString()
      params.endDate = filters.dateRange[1].toISOString()
    }
    
    const result = await productionAPI.getProductionOrders(params)
    orders.value = result.orders || []
    
    // 加载总欠款
    await loadTotalDue()
  } catch (error) {
    // 忽略被中止的请求的错误
    if (error.code !== 'ERR_CANCELED') {
      console.error('加载数据失败:', error)
      ElMessage.error('加载数据失败: ' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 加载总欠款
const loadTotalDue = async () => {
  try {
    const params = {
      factoryName: filters.factoryName,
      materialType: filters.materialType,
      keyword: filters.keyword
    }
    
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0].toISOString()
      params.endDate = filters.dateRange[1].toISOString()
    }
    
    const result = await productionAPI.getTotalDue(params)
    totalDue.value = result.totalDue || 0
  } catch (error) {
    console.error('加载总欠款失败:', error)
  }
}

// 重置筛选条件
const resetFilters = () => {
  filters.factoryName = ''
  filters.materialType = ''
  filters.keyword = ''
  filters.dateRange = null
  loadOrders()
}

// 显示新建对话框
const showCreateDialog = () => {
  isEdit.value = false
  orderForm._id = null
  orderForm.factoryName = ''
  orderForm.goodsInfo = ''
  orderForm.amount = 0
  orderForm.pricePerItem = 0
  orderForm.totalProductionPrice = 0
  orderDialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (order) => {
  isEdit.value = true
  orderForm._id = order._id
  orderForm.factoryName = order.factoryName
  orderForm.goodsInfo = order.goodsInfo
  orderForm.amount = order.amount
  orderForm.pricePerItem = order.pricePerItem
  orderForm.totalProductionPrice = order.totalProductionPrice
  orderDialogVisible.value = true
}

// 保存订单
const saveOrder = async () => {
  if (!orderForm.factoryName || !orderForm.totalProductionPrice) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  try {
    if (isEdit.value) {
      await productionAPI.updateProductionOrder(orderForm._id, orderForm)
      ElMessage.success('更新成功')
    } else {
      await productionAPI.createProductionOrder(orderForm)
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
    await productionAPI.deleteProductionOrder(id)
    ElMessage.success('删除成功')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 显示添加材料对话框
const showAddMaterialDialog = (order) => {
  isEditMaterial.value = false
  currentOrderId.value = order._id
  currentMaterialId.value = null
  materialForm.type = ''
  materialForm.comment = ''
  materialForm.price = 0
  materialForm.date = new Date()
  materialDialogVisible.value = true
}

// 显示编辑材料对话框
const showEditMaterialDialog = (orderId, material) => {
  isEditMaterial.value = true
  currentOrderId.value = orderId
  currentMaterialId.value = material._id
  materialForm.type = material.type
  materialForm.comment = material.comment
  materialForm.price = material.price
  materialForm.date = new Date(material.date)
  materialDialogVisible.value = true
}

// 保存材料
const saveMaterial = async () => {
  if (!materialForm.type) {
    ElMessage.warning('请选择类型')
    return
  }
  
  try {
    if (isEditMaterial.value) {
      await productionAPI.updateMaterial(currentOrderId.value, currentMaterialId.value, materialForm)
      ElMessage.success('更新成功')
    } else {
      await productionAPI.addMaterial(currentOrderId.value, materialForm)
      ElMessage.success('添加成功')
    }
    materialDialogVisible.value = false
    loadOrders()
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message)
  }
}

// 删除材料记录
const deleteMaterialRecord = async (orderId, materialId) => {
  try {
    await ElMessageBox.confirm('确定删除这条材料记录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await productionAPI.deleteMaterial(orderId, materialId)
    ElMessage.success('删除成功')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 显示添加付款对话框
const showAddPaymentDialog = (order) => {
  isEditPayment.value = false
  currentOrderId.value = order._id
  currentPaymentId.value = null
  paymentForm.paymentTo = order.factoryName
  paymentForm.amount = 0
  paymentForm.comment = ''
  paymentForm.date = new Date()
  paymentDialogVisible.value = true
}

// 显示编辑付款对话框
const showEditPaymentDialog = (orderId, payment) => {
  isEditPayment.value = true
  currentOrderId.value = orderId
  currentPaymentId.value = payment._id
  paymentForm.paymentTo = payment.paymentTo
  paymentForm.amount = payment.amount
  paymentForm.comment = payment.comment
  paymentForm.date = new Date(payment.date)
  paymentDialogVisible.value = true
}

// 保存付款
const savePayment = async () => {
  if (!paymentForm.paymentTo || !paymentForm.amount) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  try {
    if (isEditPayment.value) {
      await productionAPI.updatePayment(currentOrderId.value, currentPaymentId.value, paymentForm)
      ElMessage.success('更新成功')
    } else {
      await productionAPI.addPayment(currentOrderId.value, paymentForm)
      ElMessage.success('添加成功')
    }
    paymentDialogVisible.value = false
    loadOrders()
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message)
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
    await productionAPI.deletePayment(orderId, paymentId)
    ElMessage.success('删除成功')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// ==================== 材料厂付款管理 ====================

// 显示材料厂付款对话框
const showSupplierPaymentDialog = async () => {
  await loadSupplierPayments()
  supplierPaymentDialogVisible.value = true
}

// 加载材料厂付款列表
const loadSupplierPayments = async () => {
  try {
    const params = {}
    
    if (supplierPaymentDateRange.value && supplierPaymentDateRange.value.length === 2) {
      params.startDate = supplierPaymentDateRange.value[0].toISOString()
      params.endDate = supplierPaymentDateRange.value[1].toISOString()
    }
    
    const result = await productionAPI.getSupplierPayments(params)
    supplierPayments.value = result.payments || []
  } catch (error) {
    ElMessage.error('加载材料厂付款失败: ' + error.message)
  }
}

// 重置材料厂付款筛选
const resetSupplierPaymentFilters = () => {
  supplierPaymentDateRange.value = null
  loadSupplierPayments()
}

// 显示添加材料厂付款对话框
const showAddSupplierPaymentDialog = () => {
  isEditSupplierPayment.value = false
  currentSupplierPaymentId.value = null
  supplierPaymentForm.supplierName = ''
  supplierPaymentForm.materialType = ''
  supplierPaymentForm.amount = 0
  supplierPaymentForm.comment = ''
  supplierPaymentForm.date = new Date()
  supplierPaymentFormDialogVisible.value = true
}

// 显示编辑材料厂付款对话框
const showEditSupplierPaymentDialog = (payment) => {
  isEditSupplierPayment.value = true
  currentSupplierPaymentId.value = payment._id
  supplierPaymentForm.supplierName = payment.supplierName
  supplierPaymentForm.materialType = payment.materialType
  supplierPaymentForm.amount = payment.amount
  supplierPaymentForm.comment = payment.comment
  supplierPaymentForm.date = new Date(payment.date)
  supplierPaymentFormDialogVisible.value = true
}

// 保存材料厂付款
const saveSupplierPayment = async () => {
  if (!supplierPaymentForm.supplierName || !supplierPaymentForm.materialType || !supplierPaymentForm.amount) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  try {
    if (isEditSupplierPayment.value) {
      await productionAPI.updateSupplierPayment(currentSupplierPaymentId.value, supplierPaymentForm)
      ElMessage.success('更新成功')
    } else {
      await productionAPI.createSupplierPayment(supplierPaymentForm)
      ElMessage.success('添加成功')
    }
    supplierPaymentFormDialogVisible.value = false
    await loadSupplierPayments()
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message)
  }
}

// 删除材料厂付款记录
const deleteSupplierPaymentRecord = async (paymentId) => {
  try {
    await ElMessageBox.confirm('确定删除这条付款记录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await productionAPI.deleteSupplierPayment(paymentId)
    ElMessage.success('删除成功')
    await loadSupplierPayments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// ==================== 材料厂查询 ====================

// 显示材料厂查询对话框
const showSupplierSearchDialog = () => {
  supplierSearchKeyword.value = ''
  supplierSearchDateRange.value = null
  supplierSearchResult.value = null
  supplierSearchDialogVisible.value = true
}

// 查询材料厂记录
const searchSupplier = async () => {
  if (!supplierSearchKeyword.value.trim()) {
    ElMessage.warning('请输入关键词')
    return
  }
  
  try {
    let url = `/production/supplier-payments/search/${supplierSearchKeyword.value}`
    
    // 如果有时间范围，添加查询参数
    const params = new URLSearchParams()
    if (supplierSearchDateRange.value && supplierSearchDateRange.value.length === 2) {
      params.append('startDate', supplierSearchDateRange.value[0].toISOString())
      params.append('endDate', supplierSearchDateRange.value[1].toISOString())
    }
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    
    const result = await productionAPI.searchSupplierRecordsByUrl(url)
    supplierSearchResult.value = result
    ElMessage.success(`查询完成，共找到 ${result.summary.supplierPaymentCount + result.summary.materialRecordCount} 条记录`)
  } catch (error) {
    ElMessage.error('查询失败: ' + error.message)
  }
}

// 重置材料厂查询筛选
const resetSupplierSearchFilters = () => {
  supplierSearchKeyword.value = ''
  supplierSearchDateRange.value = null
  supplierSearchResult.value = null
}

// 导出到Excel
const exportToExcel = async (type) => {
  try {
    if (type === 'all') {
      // 导出所有数据
      const result = await productionAPI.getProductionOrders({ limit: 10000 })
      exportProductionToExcel(result.orders || [], '生产账单全部数据')
    } else {
      // 导出筛选结果
      exportProductionToExcel(orders.value, '生产账单筛选结果')
    }
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  }
}

// 计算材料成本
const calculateMaterialCost = (order) => {
  return order.materials.reduce((sum, item) => sum + item.price, 0)
}

// 计算已付款金额
const calculatePaidAmount = (order) => {
  return order.payments.reduce((sum, item) => sum + item.amount, 0)
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
  // 组件卸载时取消pending请求
  if (abortController) {
    abortController.abort()
  }
})
</script>

<style scoped>
.production-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.total-due {
  margin-left: auto;
  font-size: 18px;
  font-weight: bold;
}

.total-due .amount {
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

.order-header {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.order-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.goods-info {
  color: #666;
}

.date {
  color: #999;
  font-size: 12px;
}

.order-summary {
  display: flex;
  gap: 20px;
  align-items: center;
}

.price-item {
  font-size: 14px;
  color: #666;
}

.amount-due {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.amount-due.negative {
  color: #67c23a;
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

.negative-price {
  color: #67c23a;
}
</style>
