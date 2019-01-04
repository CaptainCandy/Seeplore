const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/*
 * 发布post：在数据库添加新贴的记录，并添加post-tag的联系。
 * 如果用户输入的tag目前不存在于数据库中，则向tags collection添加一个空的tag。
 * 如果用户输入的tag是一个别名标签，则保存到数据库的应该为跳转后的标签。
 */

exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  let userid = (!event.userid) ? wxContext.OPENID : event.userid;
  let [title, abstract, content] = [event.title, event.abstract, event.content];
  let [tags] = [event.tags];

  const ctags = db.collection('tags');
  const cposts = db.collection('posts');

  let postid; // 若声明在try语句块内部，finally语句块内部将无法访问。

  try {
    if (tags) {
      if (!(tags instanceof(Array))) {
        throw new Error('|| tags must be an array. ||');
      }
      rtags = [];
      for (let i = 0; i < tags.length; ++i) {

        /*
        */
        try {
          let resp = await ctags.doc(tags[i]).get();
          if (resp.data.redirect) { //如果是redirect
            tags[i] = resp.data.redirect;
          };
        } catch (err) {
          console.error(`|| ${tags[i]} 标签不存在。 ||`); //新建标签。
          await ctags.add({
            data: {
              _id: tags[i],
              description: '这是一个用户产生的标签。'
            }
          });
        }
      };
    }

    console.log('现在向数据库添加帖子。');
    postid = (await cposts.add({
      data: {
        title,
        abstract,
        content,
        authorID: userid, //_id in 'user' collection
        createTime: new Date(),
        heartCount: 0,
        status: 1 // -1 草稿 1 发布 0 隐藏
      }
    }))._id;

    if (tags) {
      console.log('现在向数据库添加标签帖子联系。');
      for (let tag of tags) {
        console.log(tag);
        await db.collection('post-tags').add({
          data: {
            postid: postid,
            tag: tag
          }
        })
      }
    }

    if (tags) {
      console.log('现在向数据库添加标签帖子联系。');
      for (let tag of tags) {
        wx.cloud.callFunction({
          name: 'doPostTag',
          data: {
            tag: tags[i],
            postid,
            undo: false
          }
        })
      }
    }

  } catch (error) {
    console.error('|| we caught an error. ||');
    console.error(error);
    throw error;
  } finally {
    return {
      postid
    }
  }

}