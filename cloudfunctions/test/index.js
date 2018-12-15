// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  console.error(event.userInfo);
  console.error(event.myUserInfo);
  console.log(event.myUserInfo);

  return {
    status: event.whereFrom,
    wxContext,
    context
  }
}