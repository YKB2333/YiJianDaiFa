<template>
  <view v-if="currentList.length"  class="mt60 plr32">
    <view class="row space-between pb16">
      <view>{{ label }}</view>
      <view
        v-if="list.length > maxDisplayQuanity"
        @click="toggle"
        class="row center-y"
      >
        <view class="fs24" style="color: #999999;">{{ checked ? '收起' : '全部' }}</view>
        <van-icon :name="checked ? 'arrow-up' : 'arrow-down'" color="#999999" size="12px" />
      </view>
    </view>
    <view class="row" style="flex-wrap: wrap;">
      <view
        :class="[
          'select-btn ellipsis mt24',
          {'active': selectionList.some(value => value[keyName] === item[keyName])}
        ]"
        v-for="(item, index) in currentList" :key="index"
        @click="actionClick(item)"
      >
        {{ item[valueNmae] }}
      </view>
    </view>
  </view>
</template>

<script>
import vanIcon from '@/wxcomponents/vant/icon/index'

export default {
  name: 'dropdown-list',
  props: {
    // v-model 传入列表
    value: {
      type: [Object, Array],
      default: () => []
    },
    // 收起状态最多展示多少个
    maxDisplayQuanity: {
      type: [Number, String],
      default: 9
    },
    // 数组进行比较的key值-唯一
    keyName: {
      type: String,
      default: 'id'
    },
    // 渲染的名字
    valueNmae: {
      type: String,
      default: 'name'
    },
    // 标题
    label: {
      type: String,
      default: ''
    },
    // 是否多选2
    multiple: {
      type: Boolean,
      default: true
    },
    // 默认值
    defaultIndex: {
      type: [Number, String],
      default: -1
    }
  },
  components: {
    vanIcon
  },
  data() {
    return {
      list: [],
      selectionList: [],
      checked: false
    }
  },
  watch: {
    value: {
      handler(newValue) {
        if (newValue) {
          this.list = newValue
          // 默认数组下表
          if (this.defaultIndex > -1) {
            this.selectionList = [this.list[this.defaultIndex]]
          }
        }
      },
      immediate: true
    }
  },
  computed: {
    // 获取当前展示数组
    currentList() {
      let result = this.list || []
      if (!this.checked && this.list) {
        result = this.list.slice(0, this.maxDisplayQuanity)
      }
      return result
    }
  },
  methods: {
    actionClick(item) {
      // 多选
      if (this.multiple) {
        const findIndex = this.selectionList.findIndex(e => e[this.keyName] == item[this.keyName])
        if (findIndex === -1) {
          this.selectionList.push(item)
        } else {
          this.selectionList.splice(findIndex, 1)
        }
      } else {
        // 单选
        if (this.selectionList[0] === item) {
          this.selectionList = []
        } else {
          this.selectionList = [item]
        }
      }
      this.$emit('action', item, this.selectionList)
    },
    // 切换展开关闭状态
    toggle() {
      this.checked = !this.checked
    },
    reset() {
      this.selectionList = []
    }
  }
}
</script>

<style lang="scss" scoped>
.active {
  color:#10967B !important;
  background: rgba(16, 150, 123, 0.1) !important;
  border-radius: 13px !important;
  border: 1px solid #10967B !important;
}
.select-btn {
  width: 32%;
  height: 52rpx;
  margin-right: 1%;
  text-align: center;
  line-height: 52rpx;
  background: #F5F6F9;
  border-radius: 26rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #242629;
  border: 1px solid transparent;
  box-sizing: border-box;
}

</style>
