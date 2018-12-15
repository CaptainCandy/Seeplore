// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  
  let openid = event.openid;
  let userid = event.userid;
  let updates = event.updates;
  let ref = null;
  
  if(!openid && !userid){
    throw {toString:function(){return "neither userid nor openid";}}
    return;
  }else if(userid){
    ref = cloud.database().collection('users').doc(userid);
  }else{
    ref = cloud.database().collection('users').where({
      _openid:openid
    });
  }

  try{
    return await ref.update({
      data: updates
    });
  }catch(err){
    console.error(err);
  }

}