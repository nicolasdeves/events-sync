import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";
import z from "zod";

export async function login(request: FastifyRequest, reply: FastifyReply) {
    console.log('entrou p fazer login')
    console.log(request.body)
    try {
        const schema = z.object({
            name: z.string(),
            email: z.string(),
            sub: z.string()
          });
        
          const data = schema.parse(request.body);

          let user = await prisma.user.findFirst({ where: { email: data.email }})

          if (!user) {
            user = await prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    googleId: data.sub
                }
            })
          }

        const token = await reply.jwtSign({
        sign: {
            sub: user.id,
            email: user.email,
        },
        });

        const refreshToken = await reply.jwtSign({
        sign: {
            sub: user.id,
            email: user.email,
            expiresIn: '7d',
        },
        });

        return reply
        .status(200)
        .setCookie('refreshToken', refreshToken, {
            path: '/',
            httpOnly: true,
            sameSite: true,
            secure: true,
        })
        .send({
            token,
        });
          
    } catch (error) {
        console.log(error)
    }
}