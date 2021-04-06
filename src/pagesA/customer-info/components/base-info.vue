<template>
  <van-cell-group :border="false">
    <!-- 基本资料 -->
    <van-cell>
      <view slot="title">
        <view class="row center-y">
          <text class="circle"></text>
          <text class="vantitle fs32">基本资料</text>
        </view>
      </view>
    </van-cell>
    <van-cell>
      <view slot="title">
        <view :class="['row center-y', {'disabled': ['enable', 'underReview', 'disabled'].includes(userStatus)}]">
          <text class="required w16">*</text>
          <text class="vantitle">姓名</text>
          <input
            :value="saveForm.name"
            @input="(e) => removerSpaces(e, 'name')"
            type="text"
            maxlength="10"
            placeholder="请输入"
            placeholder-style="color:#D8D8D8;"
          />
        </view>
      </view>
    </van-cell>
    <van-cell>
      <view slot="title">
        <view :class="['row center-y', {'disabled': ['enable', 'underReview', 'disabled'].includes(userStatus)}]">
          <text class="w16"></text>
          <text class="vantitle">性别</text>
          <view v-if="['enable', 'underReview', 'disabled'].includes(userStatus)" class="fw400">
            {{ genderList.find(e => e.key == saveForm.gender).value || '' }}
          </view>
          <view
            v-else
            v-for="(item, index) in genderList"
            :key="index"
            @click="clickTag(item.key, 'gender')"
            :class="['tag', {'tagActive': saveForm.gender == item.key}]"
          >{{ item.value }}</view>
        </view>
      </view>
    </van-cell>
    <van-cell v-if="isCompanyType">
      <view slot="title">
        <view :class="['row center-y', {'disabled': ['underReview', 'disabled'].includes(userStatus)}]">
          <text class="w16"></text>
          <text class="vantitle">职位</text>
          <input
            type="text"
            :value="saveForm.position"
            @input="(e) => removerSpaces(e, 'position')"
            @click="actions('position')"
            placeholder="请输入"
            placeholder-style="color:#D8D8D8;"
            :disabled="['enable', 'underReview', 'disabled'].includes(userStatus)"
          />
          <van-icon name="arrow" v-if="['enable'].includes(userStatus)"/>
        </view>
      </view>
    </van-cell>
    <van-cell use-label-slot="true">
      <view slot="title">
        <view :class="['row center-y', {'disabled': ['underReview', 'disabled'].includes(userStatus)}]">
          <text class="required w16">*</text>
          <text class="vantitle">邮箱</text>
          <input
            type="text"
            v-model="saveForm.email"
            @input="onChangeInputEmail"
            @click="actions('email')"
            placeholder="请输入"
            placeholder-style="color:#D8D8D8;"
            :disabled="['enable', 'underReview', 'disabled'].includes(userStatus)"
          />
          <van-icon name="arrow" v-if="['enable'].includes(userStatus)"/>
        </view>
      </view>
      <view slot="label" class="noPaddginCell">
        <van-cell
          :value="item"
          title=" "
          v-for="(item,index) in emailList"
          :key="index"
          @click="setEmail(item)"
        />
      </view>
    </van-cell>
  </van-cell-group>
</template>
<script>
import constEmailList from '@/const/email';
import { mapGetters } from 'vuex';
import { authentication } from '@/mixins/auth'

export default {
  name: 'CustomerInfo',
  data() {
    return {
      genderList: [
        { key: 1, value: '男' },
        { key: 2, value: '女' }
      ],
      saveForm: this.value,
      emailList: []
    };
  },
  mixins: [authentication],
  props: {
    value: {
      type: Object,
      required: true
    },
    isCompanyType: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    saveForm: {
      handler: function(val) {
        this.$emit('input', val)
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isDisable() {
      return this.userInfo.customerId && this.userInfo.ncCode
    }
  },
  mounted() {},
  methods: {
    removerSpaces({ detail: { value } }, key) {
      const isSpaces = /\s+/g
      const status = isSpaces.test(value)
      if (status) {
        value = value.replace(isSpaces, '')
        this.saveForm[key] = null
        this.$nextTick(() => {
          this.saveForm[key] = value
        })
      } else {
        this.saveForm[key] = value
      }
    },
    // 生成默认邮箱列表
    onChangeInputEmail(e) {
      const email = e.detail.value;
      const searchList = [];
      // 获取@后面的字符进行页面匹配
      if (email.includes('@')) {
        const value = email.split('@');
        const lsit = constEmailList.filter((item) => item.includes(value[1]));
        lsit.forEach((item) => {
          searchList.push(`${value[0]}${item}`);
        });
      } else {
        // 生成所有的列表
        constEmailList.forEach((item) => {
          searchList.push(`${email}${item}`);
        });
      }
      if (this.saveForm.email == searchList[0] || email == '' || searchList.length == 0) {
        this.emailList = [];
        return
      }
      this.emailList = searchList;
    },
    setEmail(item) {
      setTimeout(() => {
        this.saveForm.email = item;
        this.emailList = []
      }, 50);
    },
    clickTag(key, type) {
      if (type === 'gender') {
        this.saveForm.gender = key;
      }
    },
    actions(key) {
      this.$emit('action', key)
    }
  }
};
</script>

<style lang="scss" scoped>
view,
text {
  box-sizing: border-box;
}
.vantitle {
  display: inline-block;
  width: 180rpx;
  overflow: hidden;
  font-weight: bold;
  margin-right: 28rpx;
  margin-left: 8rpx;
}
.tag {
  box-sizing: border-box;
  display: inline-block;
  min-width: 116rpx;
  background-color: #eeecec;
  border-radius: 25rpx;
  color: #707070;
  font-size: 26rpx;
  text-align: center;
  margin-right: 32rpx;
  border: 1rpx solid #fff;
  padding: 6rpx 26rpx;
}
.tagActive {
  background: rgba(87, 180, 180, 0.1);
  color: #57b4b4;
  border: 1rpx solid #57b4b4;
}
.circle {
  border: 4rpx solid $uni-color-theme;
  border-radius: 50%;
  width: 16rpx;
  height: 16rpx;
}
.required {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff3750;
  vertical-align: top;
}
.disabled {
  pointer-events: none;
  opacity: 0.7;
}
.opacity1 {
  opacity: 1
}
.noPaddginCell {
  /deep/ .van-cell {
    padding: 18rpx 0 !important;
    display: flex;
    justify-content: flex-start;
  }
  /deep/ .van-cell__title {
    flex: none;
    display: inline-block;
    width: 180rpx;
    overflow: hidden;
    font-weight: bold;
    margin-right: 28rpx;
    margin-left: 24rpx;
  }
  /deep/ .van-cell__value {
    text-align: left;
  }
}
/deep/ .van-cell {
  padding: 30rpx 32rpx;
}
/deep/ .van-cell__title {
  font-weight: bold;
  font-size: 28rpx;
  color: #262626;
  line-height: 36rpx;
}
/deep/ .van-cell:after {
  border-bottom: 2rpx solid #f4f4f4;
}
/deep/ input {
  color: #707070 !important;
  z-index: 0;
  font-weight: normal;
  flex: 1;
}
</style>