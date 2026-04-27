// 数据库配置
export const dbConfig = {
  // MongoDB 连接配置
  mongodb: {
    // 本地数据库连接字符串
    uri: 'mongodb://localhost:27017/order_management',
    
    // 数据库名称
    dbName: 'order_management',
    
    // 连接选项
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // 服务器配置
  server: {
    // 后端服务器端口
    port: 5000,
    
    // CORS 配置
    cors: {
      origin: 'http://localhost:3000',
      credentials: true
    }
  }
};

// 前端配置
export const frontendConfig = {
  // 开发服务器配置
  dev: {
    port: 3000,
    host: 'localhost'
  },
  
  // API 配置
  api: {
    baseURL: '/api',
    timeout: 10000
  }
};

// 业务配置
export const businessConfig = {
  // 材料类型选项
  materialTypes: ['面料', '五金', '复合', '织袋', '塑料袋', '里布', '其他'],
  
  // 分页配置
  pagination: {
    defaultPageSize: 50,
    maxPageSize: 1000
  },
  
  // 导出配置
  excel: {
    maxExportRows: 10000
  }
};
