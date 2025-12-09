import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";
import z from "zod";

export async function login(request: FastifyRequest, reply: FastifyReply) {
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

          if (user && !user.googleId) {
            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                name: data.name,
                googleId: data.sub
              },
            });
          }

          const token = await reply.jwtSign(
            { sub: user.id, email: user.email },
            { expiresIn: '45m' }               
          );

        const refreshToken = await reply.jwtSign(
            { sub: user.id, email: user.email }, 
            { expiresIn: '7d' }                 
        );

        return reply
        .status(200)
        .setCookie('token', token, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          domain: 'localhost',
        })
        .setCookie('refreshToken', refreshToken, {
            path: '/',
            httpOnly: true,
            sameSite: true,
            secure: false,
            domain: 'localhost',
        })
        .send({
            token,
        });
          
    } catch (error) {
        console.log(error)
    }
}

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
    try {
        const refreshToken = request.cookies.refreshToken;

        console.log(refreshToken)
        if (!refreshToken) {
            return reply.status(401).send({ 
                error: 'Refresh token não encontrado' 
            });
        }

        const decoded = request.server.jwt.verify<{ sub: string; email: string }>(refreshToken);

        const user = await prisma.user.findUnique({ 
            where: { id: Number(decoded.sub) } 
        });

        if (!user) {
            return reply.status(401).send({ 
                error: 'Usuário não encontrado' 
            });
        }

        const token = await reply.jwtSign(
            { sub: user.id, email: user.email }, 
            { expiresIn: '15m' }               
          );
          
          const newRefreshToken = await reply.jwtSign(
            { sub: user.id, email: user.email }, 
            { expiresIn: '7d' }            
          );

        return reply
            .status(200)
            .setCookie('refreshToken', newRefreshToken, {
                path: '/',
                httpOnly: true,
                sameSite: true,
                secure: false,
                domain: 'localhost',
            })
            .send({
                token,
            });

    } catch (error) {
        return reply.status(401).send({ 
            error: 'Refresh token inválido ou expirado' 
        });
    }
}

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    const { sub, email } = request.user as {
      sub: number
      email: string
    }

    return {
      id: sub,
      email,
    }
  } catch (error) {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
}

export async function me(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = request.user as { sub: string };

  console.log(sub);
  
  const user = await prisma.user.findUnique({
    where: { id: Number(sub) },
    select: {
      id: true,
      name: true,
      email: true,
      googleId: true
    },
  });

  if (!user) {
    return reply.status(404).send({ message: 'User not found' });
  }

  return reply.send(user);
}

export async function allUsers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sub } = request.user as { sub: string };

  console.log(sub);
  
  const user = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      googleId: true
    },
  });

  if (!user) {
    return reply.status(404).send({ message: 'User not found' });
  }

  return reply.send(user);
}

export async function quickRegister(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    name: z.string(),
    email: z.string(),
  });

  const data = schema.parse(request.body);

  const emailAlreadyExists = await prisma.user.findFirst({ where: { email: data.email }});

  if (emailAlreadyExists) {
    return reply.status(201).send({ message: 'Email já cadastrado!', dados: data });
  }

  const user = await prisma.user.create({ data })

  return reply.status(201).send({ message: `Usuário ${user.name} cadastrado!`, user });

}

export async function getUser(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    userId: z.coerce.number(),
  });

  const data = schema.parse(request.params);

  const user = await prisma.user.findFirst({ where: { id: data.userId }});
  
  return reply.status(200).send({ message: `Usuário encontrado`, user });

}