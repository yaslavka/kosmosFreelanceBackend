const ApiError = require("../error/ApiError");
const {BalanceCrypto} = require("../models/TablesExchange/tableBalanceCrypto");
const {Wallet} = require("../models/TablesExchange/tableWallet");
const { User } = require("../models/models");

class TinkoffControllers {

  async success(req, res, next) {
    let { Success, Amount, OrderId} = req.query;
    let arr = OrderId.split(':')
    let username = (arr[1]).trim()
    if (Success){
      let update = {};
      if (username && Amount) {
        Amount = (+Amount) / 100
        const user = await User.findOne({
          where: { username: username },
        });
        const walletRUBId = await Wallet.findOne({where:{name: 'RUR'}})
        const walletRUBBalance = await BalanceCrypto.findOne({
          where: {
            userId: user.id,
            walletId: walletRUBId.id
          }
        });
        if (Amount){
          update = {balance: (+walletRUBBalance.balance)+ Amount}
        }
        await BalanceCrypto.update(update, { where: { id: walletRUBBalance.id } });
      }
    }

    const url = "https://kosmoss.host/leader";
    return res.redirect(url);
  }

}

module.exports = new TinkoffControllers();


