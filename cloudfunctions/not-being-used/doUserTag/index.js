// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let userid = (!event.userid) ? wxContext.OPENID : event.userid;
  let remove = event.remove;
  let tagname = event.tagname;

  if (!userid || !tagname) {
    throw new Error('[userid and tagname are a must]');
  }

  try {
    var count = (await db.collection('user-tags').where({
      tagname: tagname, userid: userid
    }).count()).total;

    if (!remove && count == 0) {
      await db.collection('user-tags').add({
        data: {
          tagname: tagname, userid: userid
        }
      });
      return {
        added: true
      }
    }
    else if (remove && count > 0) {
      await db.collection('user-tags').where({
        tagname: tagname, userid: userid
      }).remove();
      return {
        removed: true
      }
    }
    else {
      return {
        unmatched: true
      }
    }
  } catch (err) {
    console.log('//[Error occurs]');
    console.log(err);
    throw (err);
  }

}