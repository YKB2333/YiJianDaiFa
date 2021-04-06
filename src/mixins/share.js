import { mapGetters } from 'vuex'

export const share = {
  computed: {
    ...mapGetters(['customerUserInfo']),
    invitationCode() {
      if (this.customerUserInfo && this.customerUserInfo.attribute && this.customerUserInfo.attribute.invitationCode) {
        return this.customerUserInfo.attribute.invitationCode
      }
      return false
    }
  },
  methods: {
    // 生成分享格式的二维码
    createdInvitationCode() {
      // 是 战略客户、和推荐官客户才有邀请码
      let params = null
      if (this.invitationCode) {
        // 不用encodeURIComponent转码、微信他码会转码
        // a => InvitationCode简称(后端定义)
        const code = `a=${this.invitationCode}`
        params = `scene=${code}`
      }
      return params
    },
    // 生成分享格式
    createdSharePage(pageStr, paramsStr) {
      // 返回格式：pages/start?page=PageUrlName&paramsName=XXXXX
      const data = this.fetchCurrentPage() //获取当前页面
      if (data) {
        const findPageUrlName = Object.keys(this.$pageUrl).find(key => this.$pageUrl[key] === data.split('?')[0])
        const path = pageStr || findPageUrlName
        const params = paramsStr || data.split('?')[1]
        return `${this.$pageUrl.START}?page=${path}&${params}`
      }
      return false
    },
    // 当前页面信息
    fetchCurrentPage() {
      const pageList = getCurrentPages()
      const path = pageList[pageList.length - 1]
      return path.$page.fullPath || null
    },
    // 生成当前分享信息对象
    shareMessage(data) {
      const { title, path, imageUrl } = data
      const currentPath = this.createdSharePage() // 默认获取当前页面的地址=>地址格式化
      return {
        title: title,
        path: path || currentPath,
        imageUrl: imageUrl
      }
    }
  }
}