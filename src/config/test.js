module.exports = {
  // api请求地址前缀
  baseURL: 'http://dftest.yanmiya.com:66/wxmp',
  // 静态资源图片地址
  imagesURL: 'http://sptest.yanmiya.com:7084/sr/yjdf_mp/images',
  // 匹配地址
  posterStrategy: 'http://sptest.yanmiya.com:7084/sr/yjdf_mp/poster/strategy.json',
  posterRecommend: 'http://sptest.yanmiya.com:7084/sr/yjdf_mp/poster/recommend.json',
  // 资讯栏目ID
  cmsCategoryId: {
    home: {
      banner: '138', // 首页home页
      dailySelection: '139' // 每日精选
    },
    mine: {
      help: '150' //帮助中心
    }
  },
  cmsInfoIds: {
    // 内购活动资讯
    inside_shopping_activity: 290,
    new_gift_bag: 353, // 新活动礼包
    rule_explain: 370 // 邀请有礼规则说明
  }
}
