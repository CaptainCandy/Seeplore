// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let [heart, collect, report] = [event.heart, event.collect, event.report];
  let undo = event.undo;
  let userid = (!event.userid) ? wxContext.OPENID : event.userid;
  let replyid = event.replyid;

  console.log(event);
  console.log('EVENT HERE');

  var condition = { targetid: replyid, userid: userid };

  if (heart) {
    condition.action = 1;
  }
  else if (collect) {
    condition.action = 2;
  }
  else if (report) {
    condition.action = -1;
  }
  else{
    throw new Error('You mush pass in heart/collect/report');
  }

  var actions1 = db.collection('reply-actions');
  var ref = actions1.where(condition);

  var count = (await ref.count()).total;
  console.log('condition HERE, count', count, undo);
  console.log(condition);

  var actions2 = db.collection('reply-actions');
  if (count == 0 && !undo) {
    var resp = await actions2.add({
      data: {
        userid: userid,
        action: condition.action,
        targetid: condition.targetid,
        createTime: new Date()
      }
    });
    console.log(resp);
    //return 'action added';
    if (heart) {
      await db.collection('replies').doc(condition.targetid).update({
        data: {
          heartCount: db.command.inc(1)
        }
      });
    }

    return {
      added: true
    }
  }
  else if (count == 1 && undo) {
    await ref.remove();
    //return 'action removed';
    if (heart) {
      await db.collection('replies').doc(condition.targetid).update({
        data: {
          heartCount: db.command.inc(-1)
        }
      });
    }
    return {
      removed: true
    }
  }
  else {
    //throw new Error('action count not match.')
    return {
      unmatched: true
    }
  }

}