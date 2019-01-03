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

let collectInstitution = function (institutionName, userid) {
  const db = wx.cloud.database();
  const actions = db.collection('institution-actions');
  const cond = { target: institutionName, userid: userid }
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
          resolve({ collected });
        } else if (total == 0) {
          actions.add({ data: cond }).then(console.log);
          collected = true;
          resolve({ collected });
        } else {
          throw new Error('|| multiple collection records. ||')
        }
      }
    )
  });
};

module.exports = {
  showLoading: showLoading,
  hideLoading: hideLoading,
  progressTips: progressTips,
  collectInstitution: collectInstitution
}