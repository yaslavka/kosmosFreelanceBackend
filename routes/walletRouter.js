const Router = require('express')
const WalletControllers = require('../controllers/WalletControllers')
const router = new Router()



router.post('/create-pay', WalletControllers.freeKassa)
router.post('/create-payeer-pay', WalletControllers.payeer)
router.get('/success', WalletControllers.redirectAndpyer)
router.get('/success_freeKassa', WalletControllers.redirectAndPay)
router.get('/error',WalletControllers.redirectErr)
router.get('/warning', WalletControllers.redirect)
router.post('/transfer', WalletControllers.transfer)
router.get('/transactions', WalletControllers.transaction)
router.post('/create-withdraw', WalletControllers.withdraw)
router.post('/create-payeer-withdraw', WalletControllers.withdraw)
router.get('/status', WalletControllers.reditAndpyer)



module.exports = router

