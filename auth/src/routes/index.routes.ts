import { FastifyInstance } from "fastify";
import { allUsers, login, me, refresh, verifyJwt } from "../controllers/authentication.controller";

export async function routes(app: FastifyInstance) {
    app.post('/login', login);
    app.post('/refresh', refresh);
    app.post('/verify-jwt', verifyJwt);
    app.get('/me', { preHandler: [verifyJwt] }, me)
    app.get('/allUsers', { preHandler: [verifyJwt] }, allUsers)
}