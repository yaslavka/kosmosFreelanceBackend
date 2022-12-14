const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const matrixRouter = require('./matrixRouter')
const newsRouter = require('./newsRouter')
const structureRouter = require('./structureRouter')
const walletRouter = require('./walletRouter')
const StarRouter = require('./starRouter')
const GameRouter = require('./gameRouter')
const InvestRouter = require('./InvestRouter')
const CasinoRouter = require('./casinoRouter')
const MarketRouter = require('./marketRouter')
const OrderRouter = require('./orderRouter')
const ChartRouter = require('./chartRouter')
const ExchangeHistoryRouter = require('./exchangeHistoryRouter')
const settingsRouter = require('./settingsRouter')
const tinkoffRouter = require('./tinkoffRouter')

   
router.use('/user', userRouter)
router.use('/matrix', matrixRouter) 
router.use('/news', newsRouter)
router.use('/structure', structureRouter)
router.use('/wallet', walletRouter)
router.use('/star-trek', StarRouter)
router.use('/', StarRouter)
router.use('/v2', InvestRouter)
router.use('/fullstate', GameRouter)
router.use('/casino', CasinoRouter)
router.use('/marketslist', MarketRouter)
router.use('/orders', OrderRouter)
router.use('/charts', ChartRouter)
router.use('/trade-history', ExchangeHistoryRouter)
router.use('/settings', settingsRouter)
router.use('/registration', settingsRouter)
router.use('/tinkoff', tinkoffRouter)



module.exports = router 