import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import { verificaToken } from '../middlewares/verificaToken'

const prisma = new PrismaClient()
const router = Router()

const dadoSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  usuarioId: z.number(),
})

router.get("/", async (req, res) => {
  try {
    const dados = await prisma.dado.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        nome: true,
        descricao: true,
        usuarioId: true,
        usuario: {
          select: {
            nome: true,
            email: true
          }
          }
      }
    })

    res.status(200).json(dados)
  } catch (error) {
    res.status(500).json({erro: error})
  }
})


router.post("/", verificaToken, async (req, res) => {

  const valida = dadoSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const dado = await prisma.dado.create({
      data: valida.data
    })
    res.status(201).json(dado)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.delete("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params

  try {
    const dado = await prisma.dado.delete({
      where: { id: Number(id) }
    })

    await prisma.log.create({
      data: { 
        descricao: `Exclusão de Dados: ${id}`, 
        complemento: `Usuário: ${req.userLogadoNome}`,
        usuarioId: req.userLogadoId
      }
    })

    res.status(200).json(dado)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  const valida = dadoSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const dado = await prisma.dado.update({
      where: { id: Number(id) },
      data: valida.data
    })
    res.status(201).json(dado)
  } catch (error) {
    res.status(400).json({ error })
  }
})

export default router
