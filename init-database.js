// MongoDB 数据库初始化脚本
// 在 MongoDB Shell 中运行此脚本来初始化数据库

// 切换到 order_management 数据库
use order_management;

// 创建 productionorders 集合
db.createCollection('productionorders');

// 创建 shippingorders 集合
db.createCollection('shippingorders');

// 为 productionorders 创建索引
db.productionorders.createIndex({ factoryName: 1 });
db.productionorders.createIndex({ createdAt: -1 });
db.productionorders.createIndex({ 'materials.type': 1 });

// 为 shippingorders 创建索引
db.shippingorders.createIndex({ customer: 1 });
db.shippingorders.createIndex({ date: -1 });
db.shippingorders.createIndex({ goodsName: 1 });
db.shippingorders.createIndex({ goodsId: 1 });

print('✓ 数据库初始化完成');
print('✓ 集合创建完成');
print('✓ 索引创建完成');
