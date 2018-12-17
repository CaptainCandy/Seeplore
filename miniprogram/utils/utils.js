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

module.exports = {
  showLoading: showLoading,
  hideLoading: hideLoading,
  progressTips: progressTips
}