const Koa = require('koa')
const dirRouter = require('./app/api/dir')

const app = new Koa()

app.use(dirRouter.routes())

app.listen(3000)