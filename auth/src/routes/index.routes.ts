import { FastifyInstance } from "fastify";
import { login } from "../controllers/authentication.controller";

export async function routes(app: FastifyInstance) {
    // app.post('/org', { onRequest: [verifyJwt] }, registerOrg);
    app.post('/login', login);
  }