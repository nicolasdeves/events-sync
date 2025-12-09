import Fastify from "fastify";
import cookie from "@fastify/cookie";
import dotenv from "dotenv";
import { routes } from "./src/routes/index.routes";
import cors from "@fastify/cors";
import fastifyJwt from "fastify-jwt";

dotenv.config();

const port = Number(process.env.PORT) || 3000;

const fastify =
  Fastify();
  // { logger: true }

fastify.register(cors, {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://nicolas-deves.duckdns.org:5173",
  ],
  credentials: true,
});

fastify.register(cookie, {
  secret: "qualquercoisa",
});

fastify.register(fastifyJwt, {
  secret: "supersecret",
  cookie: {
    cookieName: "token",
    signed: false,
  },
});

fastify.register(routes, { prefix: "/auth" });

fastify.listen(
  { port, host: '0.0.0.0' },
  (error) => {
    if (error) throw error
    console.log(`🔥 Auth service running on port ${port}`)
  }
)
