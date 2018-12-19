// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let [heart, collect, report] = [event.heart, event.collect, event.report];
  let undo = event.undo;
  let userid = event.userid;
  let postid = event.postid;
  
  var condition = { targetid: postid};
  if(userid){//userid仍然应该是必填的。;;
    condition.userid = userid;
  }else{
    condition._openid = wxContext.OPENID;
  }

  if(heart){
    condition.action = 1;
  } else if(collect){
    condition.action = 2;
  } else if (report) {
    condition.action = -1;
  }

  var actions = cloud.database().collection('post-actions');
  var ref = actions.where(condition);

  var count = await ref.count();

  if(count==0 && !undo){
    actions.add({
      data:{
        userid:userid,
        action:condition.action,
        targetid:condition.targetid,
        createTIme: new Date()
      }
    });
  }else if(count==1 && undo){
    ref.remove();
  }else{
    throw new Error('action count not match.')
  }


  return condition;
}