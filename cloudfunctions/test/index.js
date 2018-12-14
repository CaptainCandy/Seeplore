// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  cloud.database().collection('users').where(
    { _openid: context.OPENID }
  ).get().then(result => {
    if (result.data.length == 0) {
      var isOldUser = true;
      cloud.callFunction({
        name: 'login',
        data: {
          wxUserInfo: event.userInfo
        }
      }).then(retval=>{
        wx.navigateTo({
          url: '../index/index',
        })
        //TODO 将后台返回的用户状态保存到app全局变量
      }).catch(error=>{
        console.log(error)
      })
    }
  });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}