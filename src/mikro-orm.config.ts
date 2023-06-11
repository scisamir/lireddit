import { MikroORM } from "@mikro-orm/postgresql";
import { __prod__ } from "./constants";
import { Post } from "./entities/Posts";
import path from "path";

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        glob: '^[\w-]+\d+\.[tj]s$',
    },
    entities: [Post],
    dbName: 'lireddit',
    type: 'postgresql',
    debug: !__prod__,
    user: 'postgres',
    password: 'postgres',
} as Parameters<typeof MikroORM.init>[0];
