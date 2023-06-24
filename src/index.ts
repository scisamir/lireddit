import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { __prod__ } from './constants';
import { MyContext } from './types';
// import cors from 'cors';

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();

    // Initialize store and client.
    const redisClient = createClient();
    redisClient.connect().catch(console.error);

    const redisStore = new (RedisStore as any)({
        host: 'localhost',
        port: 6379,
        ttl: 260,
        disableTouch: true,
        client: redisClient,
        prefix: "myapp:",
    });

    // CORS
    // app.set("trust proxy", 1);
    // app.use(
    //     cors({
    //         origin: process.env.CORS_ORIGIN,
    //         credentials: true,
    //     })
    // );

    // Initialize sesssion storage.
    app.use(
        session({
            name: 'qid',
            store: redisStore,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365, // 10 yrs
                httpOnly: true,
                sameSite: 'lax', //csrf
                secure: __prod__,
            },
            resave: false,
            saveUninitialized: false,
            secret: "scisamirscisamirscisamir",
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({  req, res  }): MyContext => ({ em: orm.em, req, res }),
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    });
};

main().catch((err) => {
    console.error(err);
});
