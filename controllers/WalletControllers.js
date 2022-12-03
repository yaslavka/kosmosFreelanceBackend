const ApiError = require("../error/ApiError");
const jwt_decode = require("jwt-decode");
const freekassa = require("freekassa-node");
const bcrypt = require("bcrypt");
const { stringify } = require("querystring");
var sha256 = require("js-sha256").sha256;


const { User, Transaction, Winthdraw } = require("../models/models");

class WalletControllers {
    async withdraw(req, res, next){
        const { amount, password, system, wallet } = req.body;
        const { authorization } = req.headers;
        const token = authorization.slice(7);
        const decodeToken = jwt_decode(token);
        const user = await User.findOne({
            where: { username: decodeToken.username },
        });
        if (!user.finance_password){
            return next(ApiError.internal("Создайте пароль"));
        }
        let updateMinus
        let comparePassword = bcrypt.compareSync(password, user.finance_password);
        if (!comparePassword) {
            return next(ApiError.internal("Неверный пароль"));
        }
        if (parseInt(user.balance) < parseInt(amount)){
            return next(ApiError.internal("Не хватает средств"));
        }
        updateMinus = { balance: parseInt(user.balance) - parseInt(amount) };
        await User.update(updateMinus, {where:{id:user.id}})
        const item = await Winthdraw.create({
            amount, system, wallet
        })
        return res.json(item);
    }
    async transaction(req, res, next){
        const {transaction} = req.query
        const { authorization } = req.headers;
        const token = authorization.slice(7);
        const decodeToken = jwt_decode(token);
        const user = await User.findOne({
            where: { username: decodeToken.username },
        });
        const trans =await Transaction.findAll({ where: { userId: user.id } })

        return res.json({items:trans})
    }
    async transfer(req, res, next){
        let updateMinus
        const { amount, password, username } = req.body;
        const { authorization } = req.headers;
        const token = authorization.slice(7);
        const decodeToken = jwt_decode(token);
        const user = await User.findOne({
            where: { username: decodeToken.username },
        });
        if (!user.finance_password){
            return next(ApiError.internal("Создайте пароль"));
        }
        let comparePassword = bcrypt.compareSync(password, user.finance_password);
        if (!comparePassword) {
            return next(ApiError.internal("Неверный пароль"));
        }
        if (user.balance < amount){
            return next(ApiError.internal("Не хватает средств"));
        }
        updateMinus = { balance: parseInt(user.balance) - parseInt(amount) };
        await User.update(updateMinus, {where:{id:user.id}})
        const userForTransfer = await User.findOne({
            where: { username },
        });
        if (!userForTransfer){
            return next(ApiError.internal("Нет такого пользователья"));
        }
        let update = {locale: parseInt(userForTransfer.locale) + parseInt(amount)}
        await User.update(update, {where:{id:userForTransfer.id}})
        return res.json(update);
    }
  async freeKassa(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const decodeToken = jwt_decode(token);
    const user = await User.findOne({
      where: { username: decodeToken.username },
    });
    const { amount } = req.body;

    const result = freekassa(
      {
          m: "23862",
          oa: amount,
          i:'',
          currency: "RUB",
          em:'',
          pay:'PAY',
          phone:'',
          o: user.username
          
      },
      ".B(n//X{-QAdW}@"
    );
    return res.json(result);
  }
  async payeer(req, res, next) {
      const { authorization } = req.headers;
      const token = authorization.slice(7);
      const decodeToken = jwt_decode(token);
      const user = await User.findOne({
          where: { username: decodeToken.username },
      });
      const amountReq = req.body.amount;
      const amount = `${amountReq}.00`;
      const shopId = 1787141506;
      const secretKey = "0Lve8A9AzmKqeXne";
      const orderId = user.username;
      const currency = "RUB";
      const callbackUrls = {
          success_url: "https://kosmos_project/api/wallet/success",
          fail_url: "https://kosmos_project/api/wallet/error",
          status_url: "https://kosmos_project/api/wallet/warning",
      };
      const description =
          "0J7Qv9C70LDRgtCwINCyINC80LDQs9Cw0LfQuNC90LUg0JrQvtGB0LzQvtGB";
      const hash = [shopId, orderId, amount, currency, description];
      hash.push(secretKey);
      const sign = sha256(hash.join(":")).toUpperCase();

      const queryParams = {
          m_shop: shopId,
          m_orderid: orderId,
          m_amount: amount,
          m_curr: currency,
          m_desc: description,
          m_sign: sign,
          m_process: "send",
      };

      return res.json({
          url: `https://payeer.com/merchant/?${stringify(queryParams)}`,
      });
  }
    async redirectAndPay(req, res, next) {
        let { MERCHANT_ORDER_ID, AMOUNT } = req.body;
        AMOUNT = +AMOUNT;
        let update = {};
        console.log(MERCHANT_ORDER_ID && AMOUNT);
        console.log(MERCHANT_ORDER_ID, AMOUNT);
        if (MERCHANT_ORDER_ID && AMOUNT) {
            const user = await User.findOne({
                where: { username: MERCHANT_ORDER_ID },
            });
            if (AMOUNT){
                update = {balance: parseInt(user.balance)+ parseInt(AMOUNT)}
            }
            await User.update(update, { where: { username: MERCHANT_ORDER_ID } });
        }
        const url = "https://kosmoss.host/leader";
        return res.redirect(url);
    }
  async redirectAndpyer(req, res, next) {
        const {m_orderid, m_amount} = req.query
      console.log(m_orderid && m_amount);
      console.log(m_orderid, m_amount);
      let update = {};
      if (m_orderid && m_amount){
          const user = await User.findOne({where:{username: m_orderid},
          });
          if (m_amount){
              update = {balance: parseInt(user.balance)+ parseInt(m_amount)}
          }
          await User.update(update, {where: { username: m_orderid }})
      }
    const url = "https://kosmoss.host/leader";
    return res.redirect(url);
  }
    async reditAndpyer(req, res, next) {
        const {m_orderid, m_amount} = req.query
        console.log(m_orderid && m_amount);
        console.log(m_orderid, m_amount);
        let update = {};
        if (m_orderid && m_amount){
            const user = await User.findOne({where:{username: m_orderid},
            });
            if (m_amount){
                update = {balance: user.balance +m_amount}
            }
            await User.update(update, {where: { username: m_orderid }})
        }
        return res.json(m_orderid);
    }

    async redirect(req, res, next) {

        const url = "https://kosmoss.host/leader";
        return res.redirect(url);
    }
    async redirectErr(req, res, next) {
        const url = "https://kosmoss.host/leader";
        return res.redirect(url);
    }
}

module.exports = new WalletControllers();
