// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看
  console.log('beging it!')
  try{
    cloud.database().collection('users').where(
      { _openid: context.OPENID }
    ).get().then(result => {
      console.log('result is: ')
      console.log(result);
    }).catch(error => {
      console.log("cathch it!")
      console.log(error)
    })
    console.log('where is the data?')
  }catch(err){
    console.log('here is outside try:')
    console.log(err)
  }


  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
