// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  let [postid, userid] = [event.postid, (!event.userid) ? wxContext.OPENID : event.userid];

  var posts = db.collection('posts');

  try{
    var qresult = await posts.doc(postid).get();
    
    var thepost = qresult.data;
    console.log(thepost);

    var authorInfo = (await cloud.callFunction({
      name: 'getUserInfo',
      data: {
        userid: userid
      }
    })).result.data;

    var detailpost = {
      postid: thepost._id,
      isMine: thepost.authorID == userid, 
      title: thepost.title,
      content: thepost.content,
      heartCount: thepost.heartCount,
      isHearted: false,//TODO not yet use action collection.
      tags: thepost.tags,
      createTime: thepost.createTime,
      author: authorInfo
    }

    return detailpost;
    
  }catch(error){
    console.error(error);
    throw error;
  }

  return 'nothing';
}