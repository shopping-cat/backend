import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import hpp from 'hpp'
import helmet from 'helmet'
import cors from 'cors'
import apolloFormatError from './lib/apolloFormatError'
import { createContext } from './context'

import schedulerRoute from './routes/scheduler'
import deliveryRoute from './routes/delivery'

import { schema as adminSchema } from './schemas/admin'
import { schema as appSchema } from './schemas/app'
import { schema as sellerSchema } from './schemas/seller'
import expressErrorLogger from './lib/expressErrorLogger'


require('dotenv').config()

// express 설정
const app = express()

// 환경별 미들웨어
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')) //log 용
  app.use(hpp()) // 보안
  app.use(helmet()) // 보안
} else {
  app.use(morgan('dev')) //log 용
}
// 기타 미들웨어
const CORS_WHITE_LIST = ['https://shoppingcat.kr', 'https://seller.shoppingcat.kr', 'https://admin.shoppingcat.kr', 'http://localhost:3000']
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (CORS_WHITE_LIST.includes(origin || '')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(expressErrorLogger)

// routing
app.use('/scheduler', schedulerRoute)
app.use('/delivery', deliveryRoute)

app.get('/isRunning', (req, res) => res.send('Server is running')) // 서버 구동 확인용 router

// graphql
const ApolloServerDefaultConfig = {
  context: createContext,
  formatError: apolloFormatError,
  uploads: { maxFileSize: 10 * 1024 * 1024, maxFiles: 10 },
  playground: process.env.NODE_ENV === 'production' ? false : { settings: { "request.credentials": 'include' } }
}

// apollo 설정
const adminServer = new ApolloServer({
  schema: adminSchema,
  ...ApolloServerDefaultConfig
})

const appServer = new ApolloServer({
  schema: appSchema,
  ...ApolloServerDefaultConfig
})

const sellerServer = new ApolloServer({
  schema: sellerSchema,
  ...ApolloServerDefaultConfig
})

adminServer.applyMiddleware({
  app,
  path: '/graphql/admin',
  cors: false,
})

appServer.applyMiddleware({
  app,
  path: '/graphql/app',
  cors: false
})

sellerServer.applyMiddleware({
  app,
  path: '/graphql/seller',
  cors: false
})


const port = process.env.NODE_ENV === 'production' ? 80 : 8080

const server = app.listen({ port }, () => {
  process.send && process.send('ready')
  console.log(`🚀  Server ready at [http://localhost:${port}${adminServer.graphqlPath}, http://localhost:${port}${appServer.graphqlPath}, http://localhost:${port}${sellerServer.graphqlPath}]`)
})

process.on('SIGINT', () => {
  server.close((err) => {
    console.log('server closed')
    process.exit(err ? 1 : 0)
  })
})