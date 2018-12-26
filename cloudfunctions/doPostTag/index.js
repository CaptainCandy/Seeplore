// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let [postid, userid] = [event.postid, (!event.userid) ? wxContext.OPENID : event.userid];
  let remove = event.remove;
  let tagname = event.tagname;

  if(!postid || !tagname){
    throw new Error('[postid and tagname are a must]');
  }

  try{
    var count = ( await db.collection('post-tags').where({
      tagname: tagname, postid: postid
    }).count() ).total;

    if(!remove && count==0){
      await db.collection('post-tags').add({
        data:{
          tagname: tagname, postid: postid
        }
      });
      return {
        added: true
      }
    }
    else if(remove && count>0){
      await db.collection('post-tags').where({
        tagname: tagname, postid: postid
      }).remove();
      return {
        removed: true
      }
    }
    else{
      return {
        unmatched: true
      }
    }
  }catch(err){
    console.log('//[Error occurs]');
    console.log(err);
    throw(err);
  }

}