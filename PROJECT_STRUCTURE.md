# 项目文件结构说明

```
order/
│
├── 📁 server/                      # 后端代码
│   ├── 📁 models/                  # 数据库模型
│   │   ├── ProductionOrder.js      # 生产订单模型
│   │   └── ShippingOrder.js        # 发货订单模型
│   │
│   ├── 📁 routes/                  # API路由
│   │   ├── production.js           # 生产订单API
│   │   └── shipping.js             # 发货订单API
│   │
│   └── index.js                    # Express服务器入口
│
├── 📁 src/                         # 前端代码
│   ├── 📁 api/                     # API请求封装
│   │   ├── index.js                # Axios配置
│   │   ├── production.js           # 生产订单API调用
│   │   └── shipping.js             # 发货订单API调用
│   │
│   ├── 📁 router/                  # Vue Router配置
│   │   └── index.js                # 路由定义
│   │
│   ├── 📁 utils/                   # 工具函数
│   │   └── excel.js                # Excel导出功能
│   │
│   ├── 📁 views/                   # 页面组件
│   │   ├── Production.vue          # 生产账单信息页面
│   │   └── Shipping.vue            # 发货货款统计页面
│   │
│   ├── App.vue                     # 根组件
│   └── main.js                     # 应用入口
│
├── 📄 配置文件
│   ├── package.json                # 项目依赖和脚本
│   ├── package-lock.json           # 依赖版本锁定
│   ├── vite.config.js              # Vite配置
│   ├── config.js                   # 应用配置
│   └── .gitignore                  # Git忽略文件
│
├── 📄 启动脚本
│   ├── start.bat                   # 一键启动脚本(Windows)
│   └── start-mongodb.bat           # MongoDB启动脚本
│
├── 📄 数据库脚本
│   ├── init-database.js            # 数据库初始化
│   └── seed-database.js            # 测试数据生成
│
├── 📄 文档
│   ├── README.md                   # 项目主文档
│   ├── QUICKSTART.md               # 快速开始指南
│   ├── USER_GUIDE.md               # 详细使用说明
│   ├── TROUBLESHOOTING.md          # 问题排查指南
│   └── PROJECT_STRUCTURE.md        # 本文件
│
├── index.html                      # HTML入口文件
│
└── 📁 node_modules/                # 依赖包(自动生成)
```

## 文件说明

### 后端文件

#### server/index.js
- Express服务器主文件
- 配置中间件(CORS、JSON解析)
- MongoDB数据库连接
- API路由注册
- 监听端口5000

#### server/models/ProductionOrder.js
- 生产订单的Mongoose模型
- 包含材料记录和付款记录的子文档
- 虚拟字段: amountDue(应付金额)
- 索引: factoryName, createdAt, materials.type

#### server/models/ShippingOrder.js
- 发货订单的Mongoose模型
- 包含付款记录的子文档  
- 虚拟字段: amountOwed(欠款金额), isPaidFull(是否付清)
- 索引: customer, date, goodsName, goodsId

#### server/routes/production.js
- 生产订单的CRUD接口
- 材料记录的增删接口
- 付款记录的增删接口
- 筛选和统计接口
- 支持分页、搜索、日期范围筛选

#### server/routes/shipping.js
- 发货订单的CRUD接口
- 付款记录的增删接口
- 筛选和统计接口
- 支持按付款状态筛选

### 前端文件

#### src/main.js
- Vue应用入口
- 导入Element Plus UI库
- 注册全局图标
- 挂载应用

#### src/App.vue
- 应用根组件
- 侧边栏导航菜单
- 路由出口
- 全局样式

#### src/router/index.js
- Vue Router配置
- 定义路由规则
- 默认重定向到生产账单页

#### src/api/index.js
- Axios实例配置
- 请求/响应拦截器
- 统一错误处理

#### src/api/production.js
- 生产订单相关的API调用封装
- 包括CRUD、材料、付款、统计等接口

#### src/api/shipping.js
- 发货订单相关的API调用封装
- 包括CRUD、付款、统计等接口

#### src/utils/excel.js
- Excel导出功能实现
- 使用XLSX库
- 生成多sheet工作簿
- 自动格式化和设置列宽

#### src/views/Production.vue
- 生产账单信息页面
- 订单列表展示(折叠面板)
- 筛选条件表单
- 新建/编辑订单对话框
- 添加材料/付款对话框
- 实时统计总欠款
- Excel导出功能

#### src/views/Shipping.vue
- 发货货款统计页面
- 订单表格展示(可展开)
- 筛选条件表单
- 新建/编辑订单对话框
- 添加付款对话框
- 实时统计总欠款
- Excel导出功能

### 配置文件

#### package.json
- 项目元信息
- npm依赖声明
- npm脚本命令:
  - `npm run dev` - 启动前端开发服务器
  - `npm run server` - 启动后端服务器
  - `npm start` - 同时启动前后端
  - `npm run build` - 构建生产版本
  - `npm run seed` - 导入测试数据

#### vite.config.js
- Vite构建工具配置
- Vue插件配置
- 路径别名(@指向src)
- 开发服务器配置(端口3000)
- API代理配置(转发到5000端口)

#### config.js
- 应用配置集中管理
- 数据库配置
- 服务器配置
- 业务配置(材料类型、分页等)

### 启动脚本

#### start.bat
- Windows批处理脚本
- 检查MongoDB服务状态
- 检查npm依赖
- 启动前后端服务
- 显示访问地址

#### start-mongodb.bat
- 手动启动MongoDB的辅助脚本
- 自动查找MongoDB安装路径
- 使用默认数据目录

### 数据库脚本

#### init-database.js
- MongoDB Shell脚本
- 创建集合
- 创建索引
- 初始化数据库结构

#### seed-database.js
- Node.js脚本
- 清空现有数据
- 插入示例订单数据
- 便于快速测试系统功能

### 文档文件

#### README.md
- 项目概述
- 功能特点
- 技术栈说明
- 安装步骤
- 使用说明
- 目录结构
- 常见问题

#### QUICKSTART.md
- 快速开始指南
- 第一次使用的步骤
- 主要功能演示
- 常用操作技巧
- 数据备份建议

#### USER_GUIDE.md
- 详细的功能使用说明
- 每个功能的操作步骤
- 实用技巧和场景示例
- 业务场景演练
- 注意事项

#### TROUBLESHOOTING.md
- 常见问题及解决方案
- 按问题类型分类
- 详细的排查步骤
- 日志位置说明
- 系统要求

#### PROJECT_STRUCTURE.md
- 本文件
- 项目结构可视化
- 每个文件的详细说明
- 技术架构说明

## 技术架构

### 前端架构
```
用户界面 (Vue Components)
         ↓
  路由管理 (Vue Router)
         ↓
   API调用 (Axios)
         ↓
  后端API (Express)
```

### 后端架构
```
Express Server
      ↓
  路由处理 (Routes)
      ↓
  业务逻辑
      ↓
  数据模型 (Mongoose)
      ↓
  MongoDB数据库
```

### 数据流

**创建订单流程:**
```
1. 用户填写表单 (Production.vue)
2. 表单验证
3. 调用API (production.js)
4. 发送HTTP请求 (axios)
5. 后端路由处理 (production.js)
6. 保存到数据库 (ProductionOrder model)
7. 返回结果
8. 更新页面显示
```

**查询订单流程:**
```
1. 用户设置筛选条件
2. 构建查询参数
3. 调用API获取数据
4. 后端执行MongoDB查询
5. 返回数据和统计信息
6. 渲染订单列表
7. 显示总欠款
```

## 依赖关系

### 前端依赖
- **vue**: 前端框架
- **vue-router**: 路由管理
- **element-plus**: UI组件库
- **axios**: HTTP客户端
- **xlsx**: Excel操作
- **file-saver**: 文件下载

### 后端依赖
- **express**: Web服务器框架
- **mongoose**: MongoDB ODM
- **cors**: 跨域资源共享

### 开发依赖
- **vite**: 构建工具
- **@vitejs/plugin-vue**: Vue插件
- **concurrently**: 并行运行命令

## 端口使用

- **3000**: 前端开发服务器 (Vite)
- **5000**: 后端API服务器 (Express)
- **27017**: MongoDB数据库 (默认)

## 数据库设计

### 集合: productionorders
```javascript
{
  factoryName: String,        // 工厂名称
  goodsInfo: String,          // 货物信息
  amount: Number,             // 数量
  pricePerItem: Number,       // 单价
  totalProductionPrice: Number, // 生产总价
  materials: [                // 材料记录数组
    {
      type: String,           // 类型
      comment: String,        // 备注
      price: Number,          // 价格
      date: Date              // 日期
    }
  ],
  payments: [                 // 付款记录数组
    {
      paymentTo: String,      // 付款对象
      amount: Number,         // 金额
      comment: String,        // 备注
      date: Date              // 日期
    }
  ],
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}
```

### 集合: shippingorders
```javascript
{
  customer: String,           // 订货方
  goodsImage: String,         // 货物图片
  goodsName: String,          // 货物名称
  goodsId: String,            // 货号
  serialNumber: String,       // 编号
  date: Date,                 // 日期
  quantity: Number,           // 数量
  pricePerUnit: Number,       // 单价
  pieceCount: Number,         // 件数
  totalGoodsPrice: Number,    // 货物总价
  shippingFee: Number,        // 运费
  totalDue: Number,           // 应付总价
  paymentRecords: [           // 付款记录数组
    {
      deposit: Number,        // 定金
      paidAmount: Number,     // 已付金额
      comment: String,        // 备注
      date: Date              // 日期
    }
  ],
  createdAt: Date,            // 创建时间
  updatedAt: Date             // 更新时间
}
```

## 环境变量

当前版本使用硬编码配置,可以根据需要修改:
- MongoDB URI: `server/index.js`
- API Base URL: `src/api/index.js`
- 服务器端口: `server/index.js`
- 前端端口: `vite.config.js`

## 扩展建议

如需扩展功能,可以考虑:
1. 添加用户认证和权限管理
2. 添加数据导入功能
3. 添加数据可视化图表
4. 添加邮件/短信通知
5. 支持多币种
6. 添加审批流程
7. 移动端优化
8. 部署到云服务器

## 性能优化

已实现的优化:
- MongoDB索引优化查询速度
- 虚拟字段减少计算
- 前端分页减少一次性加载
- Vite HMR提升开发体验

可以进一步优化:
- 添加Redis缓存
- 实现虚拟滚动(大数据量)
- 图片懒加载
- API请求去抖动
- 前端状态管理(Pinia)

## 维护说明

### 日常维护
1. 定期备份MongoDB数据
2. 检查磁盘空间
3. 更新npm依赖包
4. 导出历史数据存档

### 升级步骤
1. 停止服务
2. 备份数据库
3. 更新代码
4. 安装新依赖: `npm install`
5. 重启服务

### 监控建议
1. MongoDB日志
2. 服务器错误日志
3. 磁盘使用率
4. 数据库大小

---

最后更新: 2024-02-23
版本: 1.0.0
