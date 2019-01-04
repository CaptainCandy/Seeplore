/**
 * 显示加载
 */
function showLoading() {
  wx.showToast({
    icon: 'loading',
    title: '加载中',
    mask: true
  })
}

/**
 * 隐藏加载
 */
function hideLoading() {
  wx.showLoading({
    title: 'aa',
  })
  wx.hideLoading()
}

/**
 * 加载提示: 文本提示
 * tips：加载完成后服务器返回的message
 */
function progressTips(tips) {
  wx.showToast({
    title: tips,
    icon: 'none',
    duration: 2000
  })
}

let collectInstitution = function(institutionName, userid) {
  const db = wx.cloud.database();
  const actions = db.collection('institution-actions');
  const cond = {
    target: institutionName,
    userid: userid
  }
  const q = actions.where(cond);
  return new Promise((resolve, reject) => {
    q.get().then(
      res => {
        let collected = null;
        let total = res.data.length;
        if (total == 1) {
          let id = res.data[0]._id;
          actions.doc(id).remove().then(console.log);
          collected = false;
          resolve({
            collected
          });
        } else if (total == 0) {
          actions.add({
            data: cond
          }).then(console.log);
          collected = true;
          resolve({
            collected
          });
        } else {
          throw new Error('|| multiple collection records. ||')
        }
      }
    )
  });
};

function getInstitutionList(rankingType, userid) {

  const db = wx.cloud.database();
  return new Promise(
    (resolve, reject) => {
      db.collection('institution-actions').where({
        userid
      }).get().then(
        resp => {
          let targets = new Set(resp.data.map(
            elem => elem.target
          ));
          db.collection('institutions').orderBy(rankingType, 'asc').get().then(
            resp => {
              let lsInstitutions = resp.data.map(
                elem => {
                  return {
                    ranking: elem[rankingType],
                    name: elem.name,
                    country: elem.country,
                    location: elem.location,
                    introduction: elem.introduction,
                    collected: targets.has(elem.name)
                  }
                }
              );
              resolve({
                lsInstitutions
              });
            },
            err => {console.log(err)}
          )
        },
        err => reject
      )
    }
  )

}

const RANK_TYPE = {
  usnews: "rankusnews",
  times: "ranktimes",
  qs: "rankqs"
};

let submitApplication = (agentInfo) => {
  const app = getApp();
  userid = app.globalData.userid;

  const db = wx.cloud.database();
  agentInfo.userid = userid;
  agentInfo.isChecked = false;

  return new Promise(
    (resolve, reject) => {
      db.collection('agent-applications').add({
        data: agentInfo
      }).then(
        resp => {
          console.log(resp._id);
          resolve({
            isSubmitted: true
          });
        },
        err => {
          console.error('|| ERROR! ||', err);
          resolve({
            isSubmitted: false
          })
        }
      )
    }
  )

};

let getMyApplication = () => {
  const app = getApp();
  userid = app.globalData.userid;

  return new Promise(
    (resolve, reject) => {
      wx.cloud.database().collection('agent-applications').where({
        userid
      }).get().then(
        resp => {
          if(resp.data.length == 1){
            resolve({ data: resp.data[0], isSubmitted: true});
          }
          else if(resp.data.length == 0){
            resolve({ isSubmitted: false });
          }else{
            reject(new Error('错误的application记数。'));
          }
        }
      )
    }
  )
};

module.exports = {
  showLoading: showLoading,
  hideLoading: hideLoading,
  progressTips: progressTips,
  collectInstitution,
  getInstitutionList,
  RANK_TYPE,
  submitApplication,
  getMyApplication
}