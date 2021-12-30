require('dotenv').config()
import 'reflect-metadata'
import express from 'express'
import { createConnection } from 'typeorm'
import { User } from './entities/User'
import { Post } from './entities/Post'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { UserResolver } from './resolvers/user'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import session from 'express-session'
import { COOKIE_NAME, __prod__ } from './constants'
import { Context } from './types/Context'
import cors from 'cors'
import { PostResolver } from './resolvers/post'

const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const SESSION_DB_USERNAME_DEV_PROD = process.env.SESSION_DB_USERNAME_DEV_PROD
const SESSION_DB_PASSWORD_DEV_PROD = process.env.SESSION_DB_PASSWORD_DEV_PROD
const SESSION_SECRET_PRO_DEV = process.env.SESSION_SECRET_PRO_DEV
const PORT = process.env.PORT || 3001

const main = async () => {
  await createConnection({
    type: 'postgres',
    database: 'reddit',
    username: DB_USERNAME,
    password: DB_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [User, Post],
  })

  const app = express()

  // Session cookie store
  const mongoUrl = `mongodb+srv://${SESSION_DB_USERNAME_DEV_PROD}:${SESSION_DB_PASSWORD_DEV_PROD}@reddit.3curr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  await mongoose.connect(mongoUrl)

  console.log('MongoDB connected')

  const corsOptions = {
    origin: `http://localhost:3000`, //Your Client, do not write '*'
    credentials: true,
  }

  app.use(cors(corsOptions))

  app.use(
    session({
      name: COOKIE_NAME,
      store: MongoStore.create({
        mongoUrl,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
        secure: __prod__, // cookie only works in https
        sameSite: 'lax', //protection against CSRF
      },
      secret: SESSION_SECRET_PRO_DEV as string,
      saveUninitialized: false, // don't save the empty session, right from the start
      resave: false,
    })
  )
 
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    
  })

  await apolloServer.start()

  apolloServer.applyMiddleware({ app, cors: false })
  
  app.listen(PORT, () =>
    console.log(
      `Server started on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}`
    )
  )
}

main().catch((error) => console.log(error))
