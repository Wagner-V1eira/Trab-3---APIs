import express from 'express'
import routesDados from './routes/dados'
import routesUsuarios from './routes/usuarios'
import routesLogin from './routes/login'

const app = express()
const port = 3000

app.use(express.json())

app.use("/dados", routesDados)
app.use("/usuarios", routesUsuarios)
app.use("/login", routesLogin)

app.get('/', (req, res) => {
  res.send('API de Cadastro de Usuários')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})