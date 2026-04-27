<template>
  <div id="app">
    <el-container style="height: 100vh">
      <el-aside width="200px" style="background-color: #545c64">
        <el-menu
          :default-active="$route.path"
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <div style="padding: 20px; text-align: center; color: #fff; font-size: 18px; font-weight: bold;">
            订单管理系统
          </div>
          <el-menu-item index="/production">
            <el-icon><Document /></el-icon>
            <span>生产账单信息</span>
          </el-menu-item>
          <el-menu-item index="/shipping">
            <el-icon><Sell /></el-icon>
            <span>发货货款统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { Document, Sell } from '@element-plus/icons-vue'
import { onErrorCaptured } from 'vue'

// 捕获所有子组件中的错误，防止白屏
onErrorCaptured((err, instance, info) => {
  console.error('捕获到错误:', info, err)
  // 返回false阻止错误继续传播
  return false
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.el-main {
  padding: 20px;
  background-color: #f5f5f5;
}
</style>
