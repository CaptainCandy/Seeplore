// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let [heart, collect, report] = [event.heart, event.collect, event.report];
  let [targetid, userid] = [event.targetid, (!event.userid) ? wxContext.OPENID : event.userid];
  //if (!targetid) {
    let tidlist = event.tidlist;
  //};
  let [post, reply] = [event.post, event.reply];
  if (([post, reply]).every(function (elem) { return !elem; })) {
    throw new Error('You must pass in "post" or "reply" field');
  }
  var actions = post ? db.collection('post-actions') : db.collection('reply-actions');

  var condition = {};
  if (userid) condition.userid = userid;
  if (targetid) condition.targetid = targetid;
  else if(tidlist) condition.targetid = db.command.in(tidlist);

  if (heart) {
    condition.action = 1;
  } else if (collect) {
    condition.action = 2;
  } else if (report) {
    condition.action = -1;
  }

  console.log(condition);

  var ref = actions.where(condition);

  var count = (await ref.count()).total;

  if(!event.count){
    var resp = await ref.get();
    return {
      actions:resp.data,count
    }
  }else{
    return {
      count
    }
  }

}