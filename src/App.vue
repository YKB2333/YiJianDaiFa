<script>
import TYPES from '@/store/types'

export default {
  onLaunch: function() {
    console.log('App Launch');
    uni.getSystemInfo({
      success: (e) => {
        this.$store.commit(TYPES.SET_SYSTEM_INFO, e)
      },
      fail: (e) => {
        console.log(e)
      }
    })
  },

  onHide: function() {
    this.$store.commit(TYPES.SET_NEED_TO_CHECK_LOGIN, true)
    console.log('App Hide');
  }
};
</script>

<style lang='scss'>
/*每个页面公共css */
@import "./static/scss/index.scss";
page{
  background-color: #F6F6F6;
}
</style>
