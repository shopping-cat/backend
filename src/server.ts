import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import hpp from 'hpp'
import helmet from 'helmet'
import cors from 'cors'
import formatError from './utils/formatError'
import { createContext } from './context'

import { schema as adminSchema } from './schemas/admin'
import { schema as appSchema } from './schemas/app'
import { schema as sellerSchema } from './schemas/seller'

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
app.use(cors({ origin: process.env.FRONT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.get('/isRunning', (req, res) => res.send('Server is running')) // 서버 구동 확인용 router

const ApolloServerDefaultConfig = {
  context: createContext,
  formatError,
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

app.listen({ port }, () => {
  console.log(`🚀  Server ready at [http://localhost:${port}${adminServer.graphqlPath}, http://localhost:${port}${appServer.graphqlPath}, http://localhost:${port}${sellerServer.graphqlPath}]`)
})