// 判断设备为移动端还是pc端
const isWap = () => {
  const userAgent = navigator.userAgent;
  const agentList = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
  let flag = false
  if(agentList.includes(userAgent)) {
    flag = true
  } else {
    let width = document.documentElement.clientWidth || document.body.clientWidth
    if(width < 800) {
      flag = true
    }
  }
  return flag
}


/** 判断客户端：Android，IOS，PC */
const judgeClient = () => {
  let u = navigator.userAgent
  let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 //判断是否是 android终端
  let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //判断是否是 iOS终端
  if (isAndroid) {
    return 'Android'
  } else if (isIOS) {
    return 'IOS'
  } else {
    return 'PC'
  }
}

/** 是否是刘海屏 */
const isiPhoneX = () => {
  return (
    (judgeClient() === 'IOS' &&
      ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) ||
        (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT))) ||
    (D_HEIGHT === XSMAX_HEIGHT && D_WIDTH === XSMAX_WIDTH) ||
    (D_HEIGHT === XSMAX_WIDTH && D_WIDTH === XSMAX_HEIGHT) ||
    (D_HEIGHT === p12_HEIGHT && D_WIDTH === p12_WIDTH) ||
    (D_HEIGHT === p12_WIDTH && D_WIDTH === p12_HEIGHT) ||
    (D_HEIGHT === p12_MAX_HEIGHT && D_WIDTH === p12_MAX_WIDTH) ||
    (D_HEIGHT === p12_MAX_WIDTH && D_WIDTH === p12_MAX_HEIGHT)
  )
}

const safeBottomHeight = () => {
  return isiPhoneX() ? 44 : 0
}

const safeTopHeight = () => {
  return isiPhoneX() ? 22 : 0
}

const statusBarHeight = () => {
  return judgeClient() === 'IOS' ? (isiPhoneX() ? 44 : 20) : 0
}

export default {
  isWap,
  judgeClient,
  isiPhoneX,
  safeBottomHeight,
  safeTopHeight,
  statusBarHeight
}
