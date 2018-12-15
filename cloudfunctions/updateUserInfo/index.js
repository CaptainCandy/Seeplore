// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  
  const wxContext = cloud.getWXContext()
  let openid = wxContext.OPENID;
  let userid = event.userid;
  let updates = ['here is update.'];
  
  //const userCollection = cloud.database().collection('users');
  /*cloud.callFunction({
    name: 'test',
    data:{
      whereFrom: 'cloud'
    }
  }).then(ret=>{
    return {cld: ret.result};
  })*/
  const res = await cloud.callFunction({
    // 要调用的云函数名称
    name: 'test',
    // 传递给云函数的参数
    data: {
      whereFrom: 'cloud'
    }
  }) 
  return res.result;

  return {
    upd: updates
  }
}