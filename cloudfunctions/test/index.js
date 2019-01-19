// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  var resp = await db.collection('users').update({data:{
    "role.isAccoundManager": db.command.remove(),
    "role.isAccountManager": false
  }})
  console.log('|| RESP ||\n')
  console.log(resp)

  return {
    wxContext,
    context
  }
}