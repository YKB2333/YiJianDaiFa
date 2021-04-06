module.exports = {
  // api请求地址前缀
  baseURL: 'https://df.gz-zhongshang.com/wxmp',
  // 静态资源图片地址
  imagesURL: 'https://yjdf-res.oss-cn-hangzhou.aliyuncs.com/weapp/images',
  // 匹配地址
  posterStrategy: 'https://yjdf-res.oss-cn-hangzhou.aliyuncs.com/weapp/json/poster/strategy.json',
  posterRecommend: 'https://yjdf-res.oss-cn-hangzhou.aliyuncs.com/weapp/json/poster/recommend.json',
  // 资讯栏目ID
  cmsCategoryId: {
    // 首页
    home: {
      banner: '121', // 轮播
      dailySelection: '122' // 每日精选
    },
    mine: {
      help: '132' //帮助中心
    }
  },
  cmsInfoIds: {
    // 内购活动资讯
    inside_shopping_activity: 466,
    new_gift_bag: 505, // 新活动礼包
    rule_explain: 639 // 邀请有礼规则说明
  }
}
