const Router = require('express')
const WalletControllers = require('../controllers/WalletControllers')
const router = new Router()



router.post('/create-pay', WalletControllers.freeKassa)
router.post('/create-payeer-pay', WalletControllers.payeer)
router.get('/success', WalletControllers.redirect)
router.get('/error',WalletControllers.redirect)
router.get('/warning', WalletControllers.redirect)
router.post('/transfer', WalletControllers.transfer)
router.get('/transactions', WalletControllers.transaction)



module.exports = router

