import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

function verificaBloqueio(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    prisma.usuario.findFirst({ where: { email } })
      .then(usuario => {
        if (!usuario) {
          return res.status(404).json({ erro: "Usuário não encontrado" });
        }
  
        if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
          const tempoRestante = Math.ceil((usuario.bloqueadoAte.getTime() - new Date().getTime()) / 1000);
          return res.status(403).json({ erro: "Usuário bloqueado, tente novamente em 60 minutos", tempoRestante });
        }
        next();
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ erro: "Erro ao verificar bloqueio" });
      });
  }

  export default verificaBloqueio