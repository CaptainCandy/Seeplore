// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const postid = event.postid;
  const userid = (!event.userid) ? wxContext.OPENID : event.userid;
  const hide = event.hide;

  let r1 = await cloud.database().collection('posts').doc(postid).update({
    data: { status: 0 }
  });
  console.log('resp 1: ',r1);

  if(r1.stats.updated === 1){
    return {
      updated: 1,
      hidden: true
    }
  }else{
    return {
      updated: 0
    }
  }

}