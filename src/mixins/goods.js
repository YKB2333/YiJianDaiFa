export const goods = {
  methods: {
    getTagTitle(item) {
      const title = item.lowestActivityGeneralPrice || item.lowestActivityStrategyPrice ? '限时抢购' : null
      return title
    },
    // 不同状态下的价格关系
    priceTypeReturnValue(data, isInsideActivity = false) {
      // 1内购 2活动 3代发
      if (isInsideActivity) {
        return data.lowestPrice
      } if (data.lowestActivityGeneralPrice || data.lowestActivityStrategyPrice) {
        return this.isStrategy ? data.lowestActivityStrategyPrice : data.lowestActivityGeneralPrice
      } else {
        return this.isStrategy ? data.lowestStrategyPrice : data.lowestPrice
      }
    }
  }
}
