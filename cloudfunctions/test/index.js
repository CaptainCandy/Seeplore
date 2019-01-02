// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  var resp = await cloud.database().collection('tags').update({data:{
    checked:true
  }})
  console.log(resp)

  return {
    wxContext,
    context
  }
}