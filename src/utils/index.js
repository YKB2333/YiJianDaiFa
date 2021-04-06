import store from '@/store'
import numbro from 'numbro';

export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

//数据转化
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/**
 * 时间戳转化为年 月 日 时 分 秒
 * number: 传入时间戳
 * format：格式
 * 使用：formatTime(1563896613713, 'Y/M/D h:m')
*/
export function formatTime(timestap, format) {
  if (!timestap) {
    return ''
  }
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  const returnArr = [];

  const date = new Date(timestap);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));
  for (const i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

export function showRecentTime(timestamp) {
  const date = new Date(Number(timestamp))
  const nowDate = new Date()
  if (date.getFullYear() === nowDate.getFullYear() && date.getMonth() === nowDate.getMonth() && date.getDate()) {
    let time = (nowDate.getTime() - date.getTime()) / 1000
    if (time <= 60) {
      return Math.floor(time) + '秒前'
    } else {
      time = time / 60
      if (time < 60) {
        return Math.floor(time) + '分钟前'
      } else {
        time = time / 60
        if (time < 24) {
          return Math.floor(time) + '小时前'
        } else {
          return date.getMonth() + 1 + '月' + date.getDate() + '日'
        }
      }
    }
  } else {
    return date.getMonth() + 1 + '月' + date.getDate() + '日'
  }
}

export function isEmpty(obj) {
  if (Array.isArray(obj) && obj.length == 0) {
    return true
  } else if (typeof obj == 'undefined' || obj == null) {
    return true
  } else if (typeof obj == 'string' && obj.trim() == '') {
    return true
  } else if (typeof obj == 'object' && JSON.stringify(obj) == '{}') {
    return true
  } else {
    return false
  }
}

// 判断是否移动端
export function isMobile() {
  const userAgent = navigator.userAgent
  if ((userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
    return true
  } else {
    return false
  }
}
// 判断是否属于图片类型
export function isImageType(url) {
  return /\.(gif|jpg|jpeg|bmp|png|bmp|pic)$/.test(url)
}
export function formatFileSize(fileSize) {
  if (fileSize < 1024) {
    return fileSize + 'B';
  } else if (fileSize < (1024 * 1024)) {
    let temp = fileSize / 1024;
    temp = temp.toFixed(2);
    return temp + 'KB';
  } else if (fileSize < (1024 * 1024 * 1024)) {
    let temp = fileSize / (1024 * 1024);
    temp = temp.toFixed(2);
    return temp + 'MB';
  } else {
    let temp = fileSize / (1024 * 1024 * 1024);
    temp = temp.toFixed(2);
    return temp + 'GB';
  }
}

// 时间格式化
export function formatDate(number, format) { // formatDate('Y/M/D h:m:s')
  number = Number(number)
  if (!number) {
    return ''
  }
  const formatNumber = (n) => {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's']
  const returnArr = []

  const date = new Date(number)
  returnArr.push(date.getFullYear())
  returnArr.push(formatNumber(date.getMonth() + 1))
  returnArr.push(formatNumber(date.getDate()))

  returnArr.push(formatNumber(date.getHours()))
  returnArr.push(formatNumber(date.getMinutes()))
  returnArr.push(formatNumber(date.getSeconds()))

  for (const i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i])
  }
  return format
}

export function formatMoney(val, isDivide = false) { // isDivide: 是否/100   钱 格式化
  if (!val) return '0.00'
  if (isDivide) {
    val = (val / 100).toString().replace(/\$|,/g, '')
  } else {
    val = val.toString().replace(/\$|,/g, '')
  }
  if (isNaN(val)) {
    return '0.00'
  }
  const sign = (val == (val = Math.abs(val)))
  val = Math.floor(val * 100 + 0.50000000001)
  let cents = val % 100
  val = Math.floor(val / 100).toString()
  if (cents < 10) {
    cents = '0' + cents
  }
  for (let i = 0; i < Math.floor((val.length - (1 + i)) / 3); i++) {
    val = val.substring(0, val.length - (4 * i + 3)) + ',' + val.substring(val.length - (4 * i + 3))
  }
  return (((sign) ? '' : '-') + val + '.' + cents)
}

export function linkPage(type, url, data) {
  // 需要跳转的 tabBar 页面的路径 (代码包路径)（需在 app.json 的 tabBar 字段定义的页面），路径后不能带参数。
  if (type == 'switchTab') {
    wx.switchTab({
      url: url
    })
  }
  // 以下方法：路径后可以带参数。参数与路径之间使用?分隔，参数键与参数值用=相连，不同参数用&分隔；如 'path?key=value&key2=value2'
  //关闭所有页面， 需要跳转的应用内页面路径 (代码包路径)，
  if (type == 'reLaunch') {
    wx.reLaunch({
      url: `${url}?${data}`
    })
  }
  //关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面
  if (type == 'redirectTo') {
    wx.redirectTo({
      url: `${url}?${data}`
    })
  }
  //保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。使用 wx.navigateBack 可以返回到原页面。小程序中页面栈最多十层。
  if (type == 'navigateTo') {
    wx.navigateTo({
      url: `${url}?${data}`
    })
  }
}
export function navigateTo(path, params) {
  const url = params ? `${path}?${params}` : path
  wx.navigateTo({
    url
  })
}

// 节流函数
export function throttles(fn, delay) {
  let timer
  const delays = delay || 200
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null
      }, delays)
      fn.apply(this, args)
    }
  }
}
// 手机号码隐藏中间部分
export function formatMobile(value) {
  return value.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

// 手机号码校验
export function validPhone(phone) {
  return (/^1[3456789]\d{9}$/.test(phone))
}

// 防抖函数
export function debounce(fn, delay) {
  let timer
  const delays = delay || 200
  // 使用闭包，保证每次使用的定时器是同一个
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      // 结束之后清除定时器
      clearTimeout(timer)
    }, delays)
  }
}

export function isNoCodeMoney(val) {
  if (!store.getters.ncCode) {
    return '认证后查看价格'
  }
  return val
}

// 邮箱校验
export function validEmail(val) {
  const regEmail = /^[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,6}$/
  return regEmail.test(val)
}

/**
 *  计算思路
 *  时间差 = 期限时间 - 当前时间
 *  天数 = 时间差 / 一天的时间（60秒 x 60分钟 x 24小时） 注意：（取整，小数部分给 小时 来计算）
 *  小时 = 时间差 减去 天数的时间，剩下的时间除以 小时（60秒 x 60分）  注意：（取整，小数部分给 分钟 来计算）
 *  分钟 = 时间差 减去 天数加小时的时间， 剩下的时间除以 分钟 (60秒)
 */
export function filterDeadline(time) {
  const deadlineDate = time
  const newDate = Date.now()
  const getTime = parseInt((deadlineDate - newDate) / 1000);
  if (getTime < 0) {
    return {
      day: 0,
      hour: 0,
      minute: 0
    }
  }
  const day = parseInt(getTime / 3600 / 24); //  天数
  const hour = parseInt((getTime - (day * 3600 * 24)) / 3600) //  小时
  const minute = parseInt((getTime - ((day * 3600 * 24) + hour * 3600)) / 60) //  分钟
  function checkTime(time) {
    return time < 10 ? `0${time}` : time
  }
  return {
    day: checkTime(day),
    hour: checkTime(hour),
    minute: checkTime(minute)
  }
}

export function toThousandFilter(value, mantissa = 2, company = 5) {
  const number = value || 0
  const map = {
    5: '万',
    6: '十万',
    7: '百万',
    8: '千万',
    9: '亿'
  }
  const formattedData = (number, percent) => parseFloat(number / percent).toString().split('.')
  const lengths = parseInt(number).toString().length
  if (lengths >= company) {
    const num = formattedData(number, 10000);
    if (num[1] && mantissa) {
      return `${num[0]}.${num[1].substr(0, mantissa)}${map[company]}`;
    } else {
      return `${num[0]}${map[company]}`;
    }
  }
  return numbro(number).format({
    thousandSeparated: true,
    trimMantissa: true,
    mantissa: mantissa
  })
}

export function salesFormat(num) {
  if (isEmpty(num)) {
    return 0
  }
  if (num <= 10000) {
    return num
  } else {
    const numbers = Math.floor(num / 10000)
    return numbers + '万'
  }
}

export function formattedMoneyData(number, mantissa = 2) {
  if (!Number(number)) return 0
  if (Math.abs(number).toString().split('.')[0].length < 5) {
    number = number / 10000
    return numbro(number).format({
      thousandSeparated: true,
      mantissa: 4
    })
  }
  number = number / 10000
  return numbro(number).format({
    thousandSeparated: true,
    mantissa: mantissa
  })
}

export function million(value) { //过万处理
  let num;
  if (value > 9999) { //大于9999显示x.xx万
    num = numbro(value).format({
      thousandSeparated: true
    })
  } else {
    num = value || 0
  }
  return num;
}
