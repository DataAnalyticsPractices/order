import mongoose from 'mongoose';
import ProductionOrder from './server/models/ProductionOrder.js';
import ShippingOrder from './server/models/ShippingOrder.js';

const MONGODB_URI = 'mongodb://localhost:27017/order_management';

// 示例生产订单数据
const sampleProductionOrders = [
  {
    factoryName: '宏达制衣厂',
    goodsInfo: 'T恤衫 - 白色',
    amount: 1000,
    pricePerItem: 15,
    totalProductionPrice: 15000,
    materials: [
      {
        type: '面料',
        comment: '纯棉面料 - 信达布料厂',
        price: 5000,
        date: new Date('2024-02-01')
      },
      {
        type: '五金',
        comment: '拉链、纽扣',
        price: 800,
        date: new Date('2024-02-05')
      }
    ],
    payments: [
      {
        paymentTo: '宏达制衣厂',
        amount: 5000,
        comment: '预付款',
        date: new Date('2024-02-01')
      }
    ],
    createdAt: new Date('2024-02-01')
  },
  {
    factoryName: '永盛服装厂',
    goodsInfo: '牛仔裤 - 蓝色',
    amount: 500,
    pricePerItem: 45,
    totalProductionPrice: 22500,
    materials: [
      {
        type: '面料',
        comment: '牛仔布 - 信达布料厂',
        price: 8000,
        date: new Date('2024-02-10')
      },
      {
        type: '五金',
        comment: '金属扣',
        price: 600,
        date: new Date('2024-02-12')
      },
      {
        type: '里布',
        comment: '口袋里布',
        price: 400,
        date: new Date('2024-02-12')
      }
    ],
    payments: [
      {
        paymentTo: '永盛服装厂',
        amount: 10000,
        comment: '首付款',
        date: new Date('2024-02-10')
      }
    ],
    createdAt: new Date('2024-02-10')
  },
  {
    factoryName: '锦绣手袋厂',
    goodsInfo: '手提包',
    amount: 300,
    pricePerItem: 28,
    totalProductionPrice: 8400,
    materials: [
      {
        type: '面料',
        comment: 'PU皮革',
        price: 2000,
        date: new Date('2024-02-15')
      },
      {
        type: '五金',
        comment: '拉链、金属扣',
        price: 500,
        date: new Date('2024-02-16')
      },
      {
        type: '里布',
        comment: '内衬布料',
        price: 300,
        date: new Date('2024-02-16')
      },
      {
        type: '塑料袋',
        comment: '包装袋',
        price: 150,
        date: new Date('2024-02-18')
      }
    ],
    payments: [],
    createdAt: new Date('2024-02-15')
  }
];

// 示例发货订单数据
const sampleShippingOrders = [
  {
    customer: '张三贸易公司',
    goodsName: 'T恤衫',
    goodsId: 'TS-001',
    serialNumber: 'SO-20240201-001',
    date: new Date('2024-02-05'),
    quantity: 500,
    pricePerUnit: 25,
    pieceCount: 10,
    totalGoodsPrice: 12500,
    shippingFee: 200,
    totalDue: 12700,
    paymentRecords: [
      {
        deposit: 5000,
        paidAmount: 0,
        comment: '定金',
        date: new Date('2024-02-01')
      },
      {
        deposit: 0,
        paidAmount: 3000,
        comment: '第二次付款',
        date: new Date('2024-02-10')
      }
    ]
  },
  {
    customer: '李四服装店',
    goodsName: '牛仔裤',
    goodsId: 'JE-002',
    serialNumber: 'SO-20240212-002',
    date: new Date('2024-02-12'),
    quantity: 200,
    pricePerUnit: 65,
    pieceCount: 4,
    totalGoodsPrice: 13000,
    shippingFee: 150,
    totalDue: 13150,
    paymentRecords: [
      {
        deposit: 6000,
        paidAmount: 0,
        comment: '定金',
        date: new Date('2024-02-10')
      }
    ]
  },
  {
    customer: '王五百货',
    goodsName: '手提包',
    goodsId: 'BAG-003',
    serialNumber: 'SO-20240218-003',
    date: new Date('2024-02-18'),
    quantity: 100,
    pricePerUnit: 45,
    pieceCount: 2,
    totalGoodsPrice: 4500,
    shippingFee: 100,
    totalDue: 4600,
    paymentRecords: [
      {
        deposit: 2000,
        paidAmount: 2600,
        comment: '全款已付清',
        date: new Date('2024-02-20')
      }
    ]
  },
  {
    customer: '张三贸易公司',
    goodsName: '卫衣',
    goodsId: 'HO-004',
    serialNumber: 'SO-20240220-004',
    date: new Date('2024-02-20'),
    quantity: 300,
    pricePerUnit: 55,
    pieceCount: 6,
    totalGoodsPrice: 16500,
    shippingFee: 180,
    totalDue: 16680,
    paymentRecords: []
  }
];

async function seedDatabase() {
  try {
    // 连接数据库
    console.log('连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ 数据库连接成功');

    // 清空现有数据
    console.log('\n清空现有数据...');
    await ProductionOrder.deleteMany({});
    await ShippingOrder.deleteMany({});
    console.log('✓ 现有数据已清空');

    // 插入生产订单示例数据
    console.log('\n插入生产订单示例数据...');
    const productionResult = await ProductionOrder.insertMany(sampleProductionOrders);
    console.log(`✓ 已插入 ${productionResult.length} 条生产订单`);

    // 插入发货订单示例数据
    console.log('\n插入发货订单示例数据...');
    const shippingResult = await ShippingOrder.insertMany(sampleShippingOrders);
    console.log(`✓ 已插入 ${shippingResult.length} 条发货订单`);

    // 显示统计信息
    console.log('\n=================================');
    console.log('✅ 示例数据导入成功!');
    console.log('=================================');
    console.log(`生产订单总数: ${productionResult.length}`);
    console.log(`发货订单总数: ${shippingResult.length}`);
    
    const totalProductionDue = productionResult.reduce((sum, order) => sum + order.amountDue, 0);
    const totalShippingOwed = shippingResult.reduce((sum, order) => sum + order.amountOwed, 0);
    
    console.log(`\n生产账单总欠款: ¥${totalProductionDue.toFixed(2)}`);
    console.log(`发货货款总欠款: ¥${totalShippingOwed.toFixed(2)}`);
    console.log('\n现在可以启动应用查看示例数据了!');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('\n数据库连接已关闭');
  }
}

// 运行脚本
seedDatabase();
