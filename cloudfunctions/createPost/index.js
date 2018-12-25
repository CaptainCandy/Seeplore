// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let [tags, userid] = [event.tags, (!event.userid) ? wxContext.OPENID : event.userid];
  let [title, abstract, content] = [event.title, event.abstract, event.content];

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}