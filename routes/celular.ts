import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import { verificaToken } from '../middlewares/verificaToken'

const prisma = new PrismaClient()
const router = Router()

const celularSchema = z.object({
  marca: z.string(),
  modelo: z.string(),
  memoriaRam: z.number(),
  armazenamento: z.number(),
  preco: z.number(),
  usuarioId: z.number(),
})

router.get("/", async (req, res) => {
  try {
    const celulares = await prisma.celular.findMany({ 
      where: { deleted: false }, 
      orderBy: { id: 'desc' },
      select: {
        id: true,
        marca: true, 
        modelo: true,
        memoriaRam: true,
        armazenamento: true,
        preco: true,
        usuarioId: true,
        deleted: true,
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(celulares)
  } catch (error) {
    res.status(500).json({erro: error})
  }
})


router.post("/", verificaToken, async (req: any, res) => {
  const valida = celularSchema.safeParse(req.body); 
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  try {
    const celular = await prisma.celular.create({ 
      data: { ...valida.data, usuarioId: req.userLogadoId }
    });
    res.status(201).json(celular);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.delete("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params;

  try {
    const celular = await prisma.celular.findFirst({
      where: { id: Number(id), usuarioId: req.userLogadoId }
    });

    if (!celular) {
      return res.status(404).json({ erro: "Celular não encontrado." });
    }

    await prisma.celular.update({
      where: { id: Number(id) },
      data: { deleted: true }
    });

    await prisma.log.create({
      data: {
        descricao: `Exclusão de Celular: ${id}`,
        complemento: `Usuário: ${req.userLogadoNome}`,
        usuarioId: req.userLogadoId
      }
    });

    res.status(200).json({ mensagem: "Celular excluído com sucesso." });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ erro: "Erro ao excluir celular." });
  }
});

router.put("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params

  const valida = celularSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const celular = await prisma.celular.findFirst({
      where: { id: Number(id), usuarioId: req.userLogadoId }
    });

    if (!celular) {
      return res.status(404).json({ erro: "Celular não encontrado." });
    }
    await prisma.celular.update({
      where: { id: Number(id) },
      data: { ...valida.data }
    });
    res.status(200).json({ celular, mensagem: "Celular atualizado com sucesso." });
  } catch (error) {
    res.status(400).json({ error })
  }
})

export default router
