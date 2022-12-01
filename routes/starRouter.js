const Router = require('express')
const StarControllers = require('../controllers/StarControllers')
const StarsControllers = require('../controllers/StarsControllers')
const router = new Router()



router.post('/buy', StarControllers.buy)
router.post('/update', StarControllers.update)
router.get('/statistic', StarControllers.statistic)
router.get('/list', StarControllers.list)
router.get('/milky-way/statistic', StarsControllers.statistic)
router.post('/milky-way/buy', StarsControllers.buy)
router.get('/milky-way/list', StarsControllers.list)
router.post('/milky-way/update', StarsControllers.update)


module.exports = router