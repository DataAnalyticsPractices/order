# 问题排查指南

## 常见问题及解决方案

### 1. MongoDB 相关问题

#### 问题: "MongoDB 连接失败" 或 "ECONNREFUSED"
**原因:** MongoDB 服务未启动或端口被占用

**解决方案:**
```bash
# 方法1: 启动 MongoDB 服务
net start MongoDB

# 方法2: 手动启动 mongod
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"

# 方法3: 使用提供的脚本
双击运行 start-mongodb.bat
```

#### 问题: "数据目录不存在"
**原因:** 数据存储目录未创建

**解决方案:**
```bash
mkdir C:\data\db
```

#### 问题: MongoDB 服务无法启动
**原因:** 端口 27017 被占用或配置错误

**解决方案:**
```bash
# 1. 检查端口占用
netstat -ano | findstr :27017

# 2. 如果端口被占用,结束进程或使用其他端口
# 在 server/index.js 中修改连接字符串
```

### 2. 依赖安装问题

#### 问题: npm install 失败
**原因:** 网络问题或权限问题

**解决方案:**
```bash
# 方法1: 切换到国内镜像源
npm config set registry https://registry.npmmirror.com

# 方法2: 使用管理员权限运行
以管理员身份打开命令提示符,再运行 npm install

# 方法3: 清除缓存后重试
npm cache clean --force
npm install
```

#### 问题: "Cannot find module 'xxxx'"
**原因:** 依赖未正确安装

**解决方案:**
```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 3. 应用启动问题

#### 问题: 端口 3000 或 5000 被占用
**原因:** 其他程序占用了端口

**解决方案:**
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# 结束进程 (PID 是上面命令显示的进程ID)
taskkill /PID <进程ID> /F

# 或者修改配置使用其他端口
# vite.config.js 中修改前端端口
# server/index.js 中修改后端端口
```

#### 问题: "Cannot GET /api/xxx"
**原因:** 后端服务未启动或路由配置错误

**解决方案:**
1. 确认后端服务已启动 (端口 5000)
2. 检查浏览器控制台的错误信息
3. 确认 vite.config.js 中的代理配置正确

### 4. 前端显示问题

#### 问题: 页面空白或加载失败
**原因:** 前端构建失败或依赖缺失

**解决方案:**
```bash
# 1. 清除缓存
npm cache clean --force

# 2. 重新安装依赖
rm -rf node_modules
npm install

# 3. 重启开发服务器
npm run dev
```

#### 问题: Element Plus 组件不显示
**原因:** Element Plus 样式未正确导入

**解决方案:**
检查 src/main.js 中是否正确导入:
```javascript
import 'element-plus/dist/index.css'
```

### 5. 数据问题

#### 问题: 数据保存失败
**原因:** MongoDB 连接断开或字段验证失败

**解决方案:**
1. 检查 MongoDB 是否运行
2. 查看浏览器控制台错误
3. 确认必填字段已填写
4. 检查服务器终端的错误日志

#### 问题: 数据加载很慢
**原因:** 数据量太大或没有索引

**解决方案:**
```bash
# 运行数据库初始化脚本创建索引
mongosh order_management < init-database.js
```

#### 问题: 想清空所有数据重新开始
**解决方案:**
```bash
# 方法1: 运行测试数据脚本(会先清空数据)
npm run seed

# 方法2: 手动删除数据
mongosh order_management
db.productionorders.deleteMany({})
db.shippingorders.deleteMany({})
```

### 6. Excel 导出问题

#### 问题: 导出按钮没反应
**原因:** 浏览器阻止下载或没有数据

**解决方案:**
1. 检查浏览器是否阻止弹出窗口/下载
2. 确认有数据可以导出
3. 查看浏览器控制台错误

#### 问题: 导出的 Excel 打不开
**原因:** Excel 版本太旧或文件损坏

**解决方案:**
1. 使用 Excel 2016 或更高版本打开
2. 尝试用 WPS 或 Google Sheets 打开
3. 重新导出

### 7. 性能问题

#### 问题: 订单太多,页面卡顿
**解决方案:**
1. 使用筛选条件减少显示的订单数量
2. 考虑增加分页功能
3. 定期导出历史数据后删除旧订单

#### 问题: MongoDB 占用磁盘空间太大
**解决方案:**
```bash
# 压缩数据库
mongosh
use order_management
db.runCommand({ compact: 'productionorders' })
db.runCommand({ compact: 'shippingorders' })
```

### 8. 开发环境问题

#### 问题: Vite HMR (热更新) 不工作
**解决方案:**
1. 重启开发服务器
2. 清除浏览器缓存
3. 检查文件是否在 src 目录下

#### 问题: ESLint 或类型错误
**解决方案:**
本项目未配置 ESLint,如果遇到编辑器提示错误但功能正常,可以忽略

### 9. 网络问题

#### 问题: API 请求超时
**原因:** 网络延迟或服务器响应慢

**解决方案:**
在 src/api/index.js 中增加超时时间:
```javascript
const api = axios.create({
  baseURL: '/api',
  timeout: 30000  // 改为 30 秒
})
```

### 10. 其他问题

#### 如何查看详细错误信息?
1. **浏览器控制台:** F12 打开开发者工具,查看 Console 标签
2. **服务器日志:** 查看运行后端的终端窗口
3. **MongoDB 日志:** 查看 MongoDB 安装目录的 log 文件

#### 如何重置整个项目?
```bash
# 1. 停止所有服务 (Ctrl+C)
# 2. 删除依赖和数据
rm -rf node_modules
rm -rf package-lock.json

# 3. 清空数据库
mongosh order_management
db.dropDatabase()

# 4. 重新开始
npm install
npm run seed
npm start
```

## 获取帮助

如果以上方案都无法解决问题:

1. 检查 Node.js 版本: `node --version` (需要 >= 18)
2. 检查 MongoDB 版本: `mongod --version` (需要 >= 5.0)
3. 查看完整的错误堆栈信息
4. 检查防火墙和杀毒软件设置
5. 尝试在不同的浏览器中打开

## 日志位置

- **MongoDB 日志:** `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`
- **应用日志:** 在运行命令的终端窗口中查看

## 系统要求

- Windows 10/11
- Node.js >= 18.0.0
- MongoDB >= 5.0.0
- 至少 2GB 可用磁盘空间
- 现代浏览器 (Chrome, Edge, Firefox 最新版)
