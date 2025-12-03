import { FastifyInstance } from "fastify";
import { login, refresh, verifyJwt } from "../controllers/authentication.controller";

export async function routes(app: FastifyInstance) {
    // app.post('/org', { onRequest: [verifyJwt] }, registerOrg);
    app.post('/login', login);
    app.post('/refresh', refresh);
    app.post('/verify-jwt', verifyJwt);
}