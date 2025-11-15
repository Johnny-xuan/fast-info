const mongoose = require('mongoose')

/**
 * 连接 MongoDB 数据库
 */
const connectDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    const options = {
      // 使用新的 URL 解析器
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // 服务器选择超时时间
      serverSelectionTimeoutMS: 5000,
      // Socket 超时时间
      socketTimeoutMS: 45000,
    }

    await mongoose.connect(MONGODB_URI, options)

    console.log('✅ MongoDB connected successfully')
    console.log(`   Database: ${mongoose.connection.db.databaseName}`)
    console.log(`   Host: ${mongoose.connection.host}`)

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('   Please check your MONGODB_URI in .env file')
    process.exit(1)
  }
}

/**
 * 监听数据库连接事件
 */
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to database')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose disconnected from database')
})

/**
 * 优雅关闭数据库连接
 */
const closeDatabase = async () => {
  try {
    await mongoose.connection.close()
    console.log('✅ MongoDB connection closed')
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error)
  }
}

// 处理进程终止信号
process.on('SIGINT', async () => {
  await closeDatabase()
  process.exit(0)
})

module.exports = {
  connectDatabase,
  closeDatabase
}
