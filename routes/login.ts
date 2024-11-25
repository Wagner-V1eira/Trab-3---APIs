import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'
import verificaBloqueio from "../middlewares/verificaBloqueio"
import { verificaToken } from "../middlewares/verificaToken"

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})

const router = Router()

router.post("/", verificaBloqueio, async (req, res) => {
  const { email, senha } = req.body;

  const mensaPadrao = "Login ou senha incorretos";

  if (!email || !senha) {
    res.status(400).json({ erro: mensaPadrao });
    return;
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email }
    });

    if (usuario == null) {
      res.status(400).json({ erro: mensaPadrao });
      return;
    }

    if (bcrypt.compareSync(senha, usuario.senha)) {
      const token = jwt.sign({
        userLogadoId: usuario.id,
        userLogadoNome: usuario.nome
      },
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      );

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { ultimoAcesso: new Date() } 
      });

      let mensagemBoasVindas = "Bem-vindo! ";
      if (usuario.ultimoAcesso) {
        mensagemBoasVindas += `Seu último acesso ao sistema foi ${usuario.ultimoAcesso.toLocaleString()}`;
      } else {
        mensagemBoasVindas += "Este é o seu primeiro acesso ao sistema";
      }

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { tentativasInvalidas: 0 }
      });

      res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        token,
        mensagemBoasVindas
      });
    } else {
      const tentativas = usuario.tentativasInvalidas + 1;
      let bloqueadoAte: Date | null = null;
      if (tentativas >= 3) {
        bloqueadoAte = new Date();
        bloqueadoAte.setMinutes(bloqueadoAte.getMinutes() + 60);
      }
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          tentativasInvalidas: tentativas,
          bloqueadoAte: bloqueadoAte,
          dataUltimoBloqueio: bloqueadoAte ? new Date() : null
        }
      });
      let tempoRestante: number | null = null;
      if (bloqueadoAte) {
        tempoRestante = Math.ceil((bloqueadoAte.getTime() - new Date().getTime()) / 1000);
      }
      await prisma.log.create({
        data: {
          descricao: "Tentativa de Acesso Inválida",
          complemento: `Funcionário: ${usuario.email}`,
          usuarioId: usuario.id
        }
      });

      res.status(400).json({
        erro: "Login ou senha incorretos",
        tempoRestante
      });
    } 
  } catch (error) {
    res.status(400).json(error);
  }
});


function validaSenha(senha: string): string[] {
  const erros: string[] = [];
  if (senha.length < 8) {
    erros.push("A senha deve ter pelo menos 8 caracteres");
  }
  if (!/[A-Z]/.test(senha)) {
    erros.push("A senha deve conter pelo menos uma letra maiúscula");
  }
  if (!/[a-z]/.test(senha)) {
    erros.push("A senha deve conter pelo menos uma letra minúscula");
  }
  if (!/[0-9]/.test(senha)) {
    erros.push("A senha deve conter pelo menos um número");
  }
  if (!/[^A-Za-z0-9]/.test(senha)) {
    erros.push("A senha deve conter pelo menos um caractere especial");
  }
  return erros;
}

router.put("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params;
  const { senhaAtual, novaSenha } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: Number(id) } });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (!bcrypt.compareSync(senhaAtual, usuario.senha)) {
      return res.status(400).json({ erro: "Senha atual inválida" });
    }

    const erros = validaSenha(novaSenha);
    if (erros.length > 0) {
      return res.status(400).json({ erro: erros.join("; ") });
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(novaSenha, salt);

    await prisma.usuario.update({
      where: { id: Number(id) },
      data: { senha: hash }
    });

    res.status(200).json({ mensagem: "Senha alterada com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});


export default router