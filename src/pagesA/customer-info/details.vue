<template>
  <view id="page" :class="['hairline-top',{'disabled': ['underReview', 'disabled'].includes(userStatus) }]">
    <!-- 信息审核中 -->
    <view
      v-if="userStatus === 'underReview'"
      style="color:#FF7640;background:#FFF1EB;"
      class="col space-evenly pl28 pt22 h128"
    >
      <view class="row center-y">
        <img class="w44 h44" :src="IMAGE.icon_warn" alt />
        <text class="fs32 ml16">审核中</text>
      </view>
      <view class="fs28">平台将在4小时内处理，请耐心等候！</view>
    </view>

    <!-- 主账号 -->
    <van-tabs
      v-if="isMaster"
      :active="tabActive"
      color="#429881"
      line-width='25'
      @change="onTabsChange"
    >
      <van-tab title="基本资料" :name="0"></van-tab>
      <van-tab title="账号列表" :name="1">
        <view class="bg-white">
          <view class="account row center-y hairline-top hairline-bottom" v-for="item in accountList" :key="item">
            <view class="flex-1">
              <view class="mb14">
                <text class="title">{{ item.userName }}</text>
                <text class="tag">{{ item.isMaster ? '主账号' : '子账号' }}</text>
              </view>
              <view class="fs24 fc-gray">
                <text v-if="item.position" class="mr20 inline-block">{{ item.position }}</text>
                <text v-if="item.mobile">{{ item.mobile }}</text>
              </view>
            </view>
            <view  v-if="!item.isMaster" @click="deleteAccount(item)" class="button" >
              删除
            </view>
          </view>
        </view>
      </van-tab>
    </van-tabs>
    <view class="hairline-top hairline-bottom w-full ptb18 row center-y bg-white accountButton"
      v-if="isMaster && tabActive == 1"
    >
      <button
        @click="siwtchAccountVisible"
        class="h88 l-h88 fc-white br44 bg-theme hairline wpct92"
      >添加子账号</button>
    </view>
    <view v-show="tabActive === 0">
      <!-- 基本资料 -->
      <base-info
        v-model="saveForm"
        v-if="step === 0"
        :isCompanyType="isCompanyType"
        @action="editBaseInput"
      />

      <!-- 标题 -->
      <van-cell custom-class="mt20" v-if="isCompanyType">
        <view slot="title">
          <view class="row center-y">
            <text class="circle"></text>
            <text class="vantitle fs32">公司信息</text>
          </view>
        </view>
      </van-cell>

      <!-- 企业信息步骤1 -->
      <van-cell-group v-if="isCompanyType && step === 0" :border="false">
        <van-cell>
          <view slot="title">
            <view :class="['row center-y', {'disabled': ['enable', 'underReview', 'disabled'].includes(userStatus)}]">
              <text class="required w16">*</text>
              <text class="vantitle">公司名称</text>
              <input
                type="text"
                :value="saveForm.customerName"
                @input="(e) => removerSpaces(e, 'customerName')"
                :disabled="userInfo.customerId"
                placeholder="请输入"
                placeholder-style="color:#D8D8D8;"
              />
            </view>
          </view>
        </van-cell>
        <van-cell>
          <view slot="title">
            <view :class="['row center-y', {'disabled': ['enable', 'underReview', 'disabled'].includes(userStatus)}]">
              <text class="required w16">*</text>
              <text class="vantitle">纳税人登记号</text>
              <input
                type="text"
                :value="saveForm.taxNumber"
                @input="(e) => removerSpaces(e, 'taxNumber')"
                maxlength="20"
                placeholder="请输纳税人登记号"
                placeholder-style="color:#D8D8D8;"
              />
            </view>
          </view>
        </van-cell>
      </van-cell-group>
      <!-- 企业信息步骤2 上传证件-->
      <van-cell-group v-else-if="step === 1" :border="false">
        <van-cell>
          <view slot="title">
            <view class="row center-y">
              <text class="required w16">*</text>
              <text class="vantitle">营业执照类型</text>
              <view
                v-for="(item, index) in licenseType"
                :key="index"
                @click="clickTag(item.key, 'license')"
                :class="['tag',{'tagActive': saveForm.licenseType == item.key}]"
              >{{ item.value }}</view>
            </view>
          </view>
        </van-cell>
        <!-- 企业资料 -->
        <view v-if="!userInfo.customerId" class="row space-around bg-white plr18 ptb40">
          <block v-if="saveForm.licenseType == 0">
            <view
              v-for="(item, index) in ['license']"
              :key="index"
              class="relative br8"
            >
              <view class="w200 h282" style="background:#f6f6f6">
                <image
                  v-if="saveForm.businessLicenses.find(e => e.keys === item)"
                  :src="saveForm.businessLicenses.find(e => e.keys === item).url"
                  @click="lookUploadDetail(String(item))"
                  class="w-h-full"  mode="aspectFill"
                />
                <image v-else :src="uploadList[item].image" @click="onClickUpload(String(item), 'heightFix')"  class="w-h-full" mode="aspectFill"/>
              </view>
              <view v-if="saveForm.businessLicenses.find(e => e.keys === item)" @click="removeUploadImage(String(item))" class="absolute w40 h40" style="right: -10rpx; top: -10px">
                <image :src="IMAGE['upload_icon_error']" mode="aspectFill" class="w-h-full"/>
              </view>
              <view class="fs24 fc-gray text-center mt24">{{ uploadList[item].title }}</view>
            </view>
          </block>
          <block v-if="saveForm.licenseType == 1">
            <view
              v-for="(item, index) in ['license_personal', 'license_code']"
              :key="index"
              class="relative br8"
            >
              <view class="w340 h214" style="background:#f6f6f6">
                <image
                  v-if="saveForm.businessLicenses.find(e => e.keys === item)"
                  :src="saveForm.businessLicenses.find(e => e.keys === item).url"
                  class="w-h-full"  mode="aspectFill"
                  @click="lookUploadDetail(String(item))"
                />
                <image v-else :src="uploadList[item].image" @click="onClickUpload(String(item), 'heightFix')"  class="w-h-full" mode="aspectFill"/>
              </view>
              <view v-if="saveForm.businessLicenses.find(e => e.keys === item)" @click="removeUploadImage(String(item))" class="absolute w40 h40" style="right: -10rpx; top: -10px">
                <image :src="IMAGE['upload_icon_error']" mode="aspectFill" class="w-h-full"/>
              </view>
              <view class="fs24 fc-gray text-center mt24">{{ uploadList[item].title }}</view>
            </view>
          </block>
        </view>
      </van-cell-group>

      <!-- 邀请信息 -->
      <van-cell custom-class="mt20" v-if="step === 0 && userStatus  === 'notEnable'">
        <view slot="title">
          <view class="row center-y">
            <text class="circle"></text>
            <text class="vantitle fs32">邀请信息</text>
          </view>
        </view>
      </van-cell>
      <van-cell-group v-if="step === 0  && userStatus  === 'notEnable'" :border="false" >
        <van-cell>
          <view slot="title">
            <view :class="['row center-y', {'disabled': ['enable', 'underReview', 'disabled'].includes(userStatus)}]">
              <text class="vantitle">邀请码</text>
              <input
                type="text"
                :value="saveForm.invitationCode"
                @input="(e) => removerSpaces(e, 'invitationCode')"
                @blur="blurInvitationCode"
                placeholder="请输入、没有可不填"
                maxlength="6"
                placeholder-style="color:#D8D8D8;"
              />
            </view>
          </view>
        </van-cell>
      </van-cell-group>

      <!-- 提交审核按钮 -->
      <view
        v-if="['notEnable', 'disabled'].includes(userStatus)"
        class="plr60 mt44"
      >
        <button
          @tap="submit"
          class="h88 l-h88 center-x fc-white br44 bg-theme"
        >{{ submitName }}</button>
        <view v-if="step >= 1" @click="step = 0" class="fs24 mt30 text-center" style="color:#10967B" >返回上一层</view>
      </view>
    </view>

    <!-- 选择照片弹窗 -->
    <upload
      :show="selectImageVisible"
      :keys="uploadKey"
      :image="uploadList[uploadKey].uploadImage"
      :tips="uploadList[uploadKey].tips"
      :apiName="uploadApiPath"
      :mode="uploadMode"
      @success="uploadSuccess"
      @close="closePopup"
    />

    <!-- 添加账号 -->
    <van-dialog
      :async-close="true"
      :show="accountVisible"
      title="添加账号"
      @confirm="addSonAccount"
      @cancel="accountVisible=false"
      use-slot
      show-cancel-button
      confirm-button-color="#34947c"
    >
      <view class="ptb20">
        <van-cell-group :border="false">
          <van-cell>
            <view slot="title" class="row center-y">
              <text class="required w16">*</text>
              <text class="vantitle w110">姓名</text>
              <input
                type="text"
                v-model="account.name"
                maxlength="10"
                placeholder="请输入姓名"
                placeholder-style="color:#D8D8D8;"
              />
            </view>
          </van-cell>
          <van-cell>
            <view slot="title" class="row center-y">
              <text class="required w16">*</text>
              <text class="vantitle w110">手机号</text>
              <input
                type="text"
                v-model="account.mobile"
                maxlength="11"
                placeholder="请输入手机号"
                placeholder-style="color:#D8D8D8;"
              />
            </view>
          </van-cell>
          <van-cell>
            <view slot="title">
              <view class="row center-y">
                <text class="vantitle w110 ml16">职位</text>
                <input
                  type="text"
                  v-model="account.position"
                  placeholder="请输入"
                  placeholder-style="color:#D8D8D8;"
                />
              </view>
            </view>
          </van-cell>
        </van-cell-group>
      </view>
    </van-dialog>

    <!-- 保存状态下的修改 -->
    <van-dialog
      ref="userAdd"
      :show="editProupVisibile"
      :title="editTitleName"
      @confirm="editDialogConfirm"
      @close="editProupVisibile=false"
      use-slot
      show-cancel-button
      confirm-button-color="#34947c"
    >
      <view class="mlr50 ptb60">
        <van-cell-group :border="false">
          <van-cell custom-class="_userEditCell">
            <view slot="title" class="col">
              <input
                type="text"
                v-model="editInputValue"
                placeholder="请输入"
                @input="onChangeInputEmail"
                placeholder-style="color:#D8D8D8;"
              />
            </view>
          </van-cell>
          <view class="col">
            <view v-for="(item,index) in emailList" :key="index" @click="setEmail(item)" class="h68 l-h68 fs24 ml30">{{ item }}</view>
          </view>
        </van-cell-group>
      </view>
    </van-dialog>
  </view>
</template>
<script>
import {
  icon_warn, mine_guohui,
  mine_portrait, mine_portrait_hand,
  mine_protrait_all, mine_home,
  mine_end, license_min, license_big,
  license_personal_min, license_personal_big,
  license_code_min, license_code_big,
  upload_icon_error
} from '@/image-config.js';
import { mapGetters } from 'vuex';
import { rules } from './formRule';
import {
  modifyInfo, login, certificationPersonal,
  certificationCheck, certificationCompany,
  accountPage, accountRemoveSlave,
  addSlave
} from '@/api/user';
import constEmailList from '@/const/email';
import TYPES from '@/store/types'
import upload from '@/pagesA/customer-info/components/upload'
import baseInfo from '@/pagesA/customer-info/components/base-info'
import { authentication } from '@/mixins/auth'
import { deepClone } from '@/utils'
import { DEFAULT_INVITATION_CODE } from '@/const/dictionary'
import { getDictionaryByCode } from '@/api/dictionary'
import { notificationCertificationResults } from '@/config'

export default {
  name: 'details',
  components: {
    upload,
    baseInfo
  },
  mixins: [authentication],
  data() {
    return {
      isMaster: false, // 是否主账号
      accountList: [], // 账户列表
      query: { // 主账号查询对象
        pageIndex: 1,
        pageSize: 10,
        loading: false,
        finished: false,
        error: false
      },
      tabActive: 0, // 管理列表tab默认索引
      IMAGE: {
        icon_warn,
        mine_guohui,
        mine_portrait,
        mine_portrait_hand,
        mine_protrait_all,
        mine_home,
        mine_end,
        license_min,
        license_big,
        license_personal_min,
        license_personal_big,
        license_code_min,
        license_code_big,
        upload_icon_error
      },
      saveForm: {
        name: '',
        gender: '',
        position: '',
        email: '',
        customerName: '',
        taxNumber: '',
        invitationCode: '', // 邀请码
        enterpriseType: '', // 个人or公司类型
        licenseType: 0,
        businessLicenses: [] //企业图片
      },
      defaultInvitationCode: 0, // 默认邀请码
      account: { // 主账号新增用户 对象
        name: '',
        mobile: '',
        position: ''
      },
      genderList: [
        { key: 1, value: '男' },
        { key: 2, value: '女' }
      ],
      licenseType: [
        { key: 0, value: '三证合一' },
        { key: 1, value: '普通营业执照' }
      ],
      selectImageVisible: false, // 选择上传图片开关
      accountVisible: false, // 添加用户开关
      step: 0, // 步骤
      uploadKey: null, // 选择上传文件的key值
      editTitleName: '', // 编辑框标题
      editProupVisibile: false,
      editInputValue: '', // 编辑input框的value值
      emailList: [],
      uploadList: { // 上传文件描述信息对象
        license: {
          image: license_min,
          uploadImage: license_big,
          title: '请上传营业执照',
          fileName: '营业执照',
          tips: "<p>请按照示例图上传“<span style='color:#10967B'>三证合一的营业执照</span>”照片，可清晰显示内容，避免反光，四边完全露出。（将企业依次申请的工商营业执照、组织机构代码证和税务登记证三证合为一证。）</p>"
        },
        license_personal: {
          image: license_personal_min,
          uploadImage: license_personal_big,
          title: '请上传营业执照',
          fileName: '普通营业执照',
          tips: "<p>请按照示例图上传“<span style='color:#10967B'>普通营业执照</span>”照片，可清晰显示内容，避免反光，四边完全露出。（普通营业执照需要上传组织机构代码证信息）</p>"
        },
        license_code: {
          image: license_code_min,
          uploadImage: license_code_big,
          title: '请上传组织机构代码证',
          fileName: '组织机构代码证',
          tips: "<p>请按照示例图上传“<span style='color:#10967B'>组织机构代码证</span>”照片，拍照对焦证件，避免反光，不可遮挡。可清晰显示证件内容，证件四边完全露出。</p>"
        }
      },
      uploadMode: '' // 上传组件、描述图片样式
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'sessionKey', 'temporaryUserInfo', 'isEnable', 'shareInvitationCode', 'customerUserInfo']),
    submitName() {
      if (this.userStatus === 'enable') {
        return '保存'
      } else if (this.userStatus === 'underReview') {
        return '审核中'
      } else if (this.userStatus === 'notEnable' && this.isCompanyType && this.step === 0) {
        return '下一步'
      } else if (this.userStatus === 'notEnable') {
        return '提交审核'
      } else if (this.userStatus === 'disabled') {
        return '被禁用'
      }
      return null
    },
    // 是否为公司类型
    isCompanyType() {
      return this.saveForm.enterpriseType === 0
    },
    // 上传路径
    uploadApiPath() {
      const apiPath = this.isCompanyType ? '/account/certificate/company/upload' : '/account/certificate/personal/upload'
      return apiPath
    }
  },
  onLoad(options) {
    this.fetchDefaultCode()
    // 判断选择的客户类型
    if (options.type === 'enterprise') {
      this.saveForm.enterpriseType = 0
    } else if (options.type === 'personal') {
      this.saveForm.enterpriseType = 1
    }
    // 如果存在用户id => 获取用户信息
    if (this.userInfo.customerId) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      this.$store.dispatch('getBaseInfo').then((result) => {
        this.saveForm = Object.assign(this.saveForm, result)
        const { isMaster, taxNumber, userName, enterpriseType } = result
        this.saveForm.enterpriseType = Number(this.saveForm.enterpriseType)
        this.saveForm.idCard = taxNumber
        this.saveForm.name = userName
        if (this.customerUserInfo && this.customerUserInfo.attribute) {
          this.saveForm.invitationCode = this.customerUserInfo.attribute.parentInvitationCode || ''
        }
        // 如果是主账号查询账号列表
        if (this.userStatus === 'enable' && isMaster && Number(enterpriseType) === 0) {
          this.isMaster = isMaster
          this.fetchAccountPage()
        }
      })
        .finally(() => {
          wx.hideLoading();
        });
    }
  },
  methods: {
    async submit() {
      if (this.userStatus === 'enable') {
        // 保存
      } else if (this.userStatus === 'underReview') {
        // 审核中
      } else if (this.userStatus === 'notEnable' && this.isCompanyType && this.step === 0) {
        // 企业用户类型下一步检验
        this.checkNextStep()
      } else if (this.userStatus === 'notEnable' && this.isCompanyType) {
        // 企业用户类型提交审核
        this.certificationCompany()
      } else if (this.userStatus === 'notEnable' && !this.isCompanyType) {
        // 个人用户类型提交审核
        this.certificationPersonal()
      }
    },
    // 企业类型下一步按钮 检查事件
    async checkNextStep() {
      const { customerName, taxNumber, name, email, enterpriseType } = this.saveForm
      // 检查检验必填信息
      const regEmail = /^[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,6}$/; // 邮箱
      const identifyNumber = /^[A-Z0-9]{15}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/
      const showToast = (title) => {
        uni.showToast({ title: title, duration: 2000, icon: 'none' });
      }

      if (!name) {
        showToast('姓名不能为空')
      } else if (!email) {
        showToast('邮箱不能为空')
      } else if (!regEmail.test(email)) {
        showToast('邮箱格式不正确')
      } else if (!customerName) {
        showToast('公司名称不能为空')
      } else if (enterpriseType == '0' && !taxNumber) {
        showToast('请输入纳税人登记号')
      } else if (enterpriseType == '0' && taxNumber && !identifyNumber.test(taxNumber)) {
        showToast('请输入正确的纳税人登记号')
      } else {
        // 企业用户提前验证
        certificationCheck({
          customerName, taxNumber
        }).then(({ result }) => {
          this.step++
        }).catch((e) => {
          this.throwError(e)
        })
      }
    },
    // 个人用户认证
    async certificationPersonal() {
      const status = await rules(this.saveForm)
      if (!status) return
      await this.$store.dispatch('fetchMessage', [notificationCertificationResults])

      try {
        uni.showLoading({
          title: '提交中',
          mask: true
        });
        await certificationPersonal(this.saveForm)
        // 认证成功跳转
        uni.reLaunch({
          url: `${this.$pageUrl.CUSTOMER_STATUS}?status=success&image=auth_success&message=提交成功，请等待审核`
        })
        await this.updataUserInfo() // 更新用户信息
      } catch (error) {
        uni.hideLoading();
        this.throwError(error)
      }
    },
    throwError(error) {
      const imgageList = {
        CUSTOMER_ENABLE_VALID_ERROR: 'auth_error',
        USER_MASTER_EXISTED_ERROR: 'auth_includes'
      }
      if (!error || !error.code || !imgageList[error.code]) {
        uni.showToast({
          title: error.message || '提交信息失败',
          duration: 2000,
          icon: 'none'
        });
        return
      }
      const images = imgageList[error.code] || 'auth_error'
      uni.reLaunch({
        url: `${this.$pageUrl.CUSTOMER_STATUS}?image=${images}&message=${error.message}`
      })
    },
    // 企业用户认证
    async certificationCompany() {
      const status = await rules(this.saveForm)
      if (!status) return
      await this.$store.dispatch('fetchMessage', [notificationCertificationResults])
      try {
        uni.showLoading({
          title: '提交中',
          mask: true
        });
        const data = deepClone(this.saveForm)
        if (data.licenseType == '0') {
          data.businessLicenses = data.businessLicenses.filter(e => ['license'].includes(e.keys))
        } else if (data.licenseType == '1') {
          data.businessLicenses = data.businessLicenses.filter(e => ['license_personal', 'license_code'].includes(e.keys))
        }
        await certificationCompany(data)
        uni.hideLoading();
        uni.reLaunch({
          url: `${this.$pageUrl.CUSTOMER_STATUS}?status=success&image=auth_success&message=提交成功，请等待审核`
        })
        await this.updataUserInfo() // 更新用户信息
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error.message || '提交信息失败',
          duration: 2000,
          icon: 'none'
        });
        this.throwError(error)
      }
    },
    // 获取主账户列表
    fetchAccountPage(init = false) {
      const { loading, finished, error } = this.query
      if (loading || finished || error) return
      this.query.loading = true
      if (init) {
        this.accountList = []
        this.query = Object.assign({}, this.$options.data().query)
      }
      accountPage(this.query).then(({ result }) => {
        if (!result || !result.list.length) {
          this.query.finished = true
          return
        }
        this.accountList = this.accountList.concat(result.list)
        this.query.error = false
        this.query.pageIndex += 1
      }).catch(err => {
        this.query.error = true
      }).finally(() => {
        this.query.loading = false
      })
    },
    // 更新用户信息
    updataUserInfo() {
      return new Promise(async(resolve, reject) => {
        const code = await this.$store.dispatch('getWxCode')
        login(code).then(({ result }) => {
          this.$store.commit(TYPES.SET_USER_INFO, result)
          resolve(result)
        }).catch((e) => {
          reject(e)
        })
      })
    },
    // 添加子账号确认事件
    addSonAccount(e) {
      if (!this.account.mobile || !this.account.name) {
        uni.showToast({
          title: '请完善添加信息',
          duration: 2000,
          mask: true,
          icon: 'none'
        });
        e.detail.dialog.stopLoading() // 阻止loading
        return
      }
      uni.showLoading({
        title: '添加中',
        mask: true
      });
      addSlave(this.account).then(({ result }) => {
        uni.hideLoading();
        this.fetchAccountPage(true)
        uni.showToast({
          title: '添加成功',
          duration: 2000,
          icon: 'none'
        });
      }).catch((e) => {
        uni.hideLoading();
        uni.showToast({
          title: e.message || '添加失败',
          duration: 2000,
          icon: 'none'
        });
      }).finally(() => {
        this.siwtchAccountVisible()
        this.account = Object.assign({}, this.$options.data().account)
      })
    },
    // 添加子账号 显示弹窗事件
    siwtchAccountVisible() {
      this.accountVisible = !this.accountVisible
    },
    // 删除子账号
    deleteAccount(item) {
      uni.showModal({
        title: '提示',
        content: `是否删除${item.userName}该账号`,
        confirmText: '删除',
        confirmColor: '#d94a48',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中',
              mask: true
            });
            accountRemoveSlave(item.id).then((result) => {
              uni.hideLoading();
              uni.showToast({
                title: '删除成功',
                duration: 2000,
                icon: 'none'
              });
              const index = this.accountList.findIndex(e => e.id === item.id)
              this.accountList.splice(index, 1)
            }).catch((e) => {
              uni.hideLoading();
              uni.showToast({
                title: '删除失败',
                duration: 2000,
                icon: 'none'
              });
            })
          }
        }
      })
    },
    // 主账号table切换事件
    onTabsChange({ detail }) {
      this.tabActive = detail.name
    },
    // 关闭上传弹窗
    closePopup() {
      this.selectImageVisible = false
      this.uploadKey = null
    },
    // 点击弹出对应上传弹框
    onClickUpload(type, mode = 'widthFix') {
      this.selectImageVisible = true
      this.uploadKey = type
      this.uploadMode = mode
    },
    // 图片上传成功回调函数
    uploadSuccess(data) {
      this.selectImageVisible = false
      const { url, keys } = data
      // 如果是企业类型
      if (this.isCompanyType) {
        let result = this.saveForm.businessLicenses.find(e => e.keys === keys)
        data.fileName = this.uploadList[keys].fileName
        if (result) {
          result = data
        } else {
          this.saveForm.businessLicenses.push(data)
        }
        return
      }
      this.saveForm[keys] = url
    },
    // 删除图片
    removeUploadImage(keys) {
      if (this.isCompanyType) {
        const index = this.saveForm.businessLicenses.findIndex(e => e.keys === keys)
        this.saveForm.businessLicenses.splice(index, 1)
        return
      }
      this.saveForm[keys] = null
    },
    lookUploadDetail(keys) {
      let data = [];
      if (this.saveForm[keys]) {
        data.push(this.saveForm[keys])
      }
      if (this.isCompanyType) {
        data = [this.saveForm.businessLicenses.find(e => e.keys === keys).url]
      }
      if (!keys || !data) return
      uni.previewImage({
        urls: data
      })
    },
    // 点击切换标题
    clickTag(key, type) {
      if (type === 'gender') {
        this.saveForm.gender = key;
      }
      if (type === 'license') {
        this.saveForm.licenseType = key
      }
    },
    editBaseInput(key) {
      if (this.userStatus === 'enable') {
        const titles = {
          position: '修改您的职位',
          email: '修改您的邮箱'
        }
        this.editInputValue = this.saveForm[key]
        this.editTitleName = titles[key]
        this.currentEditInputKey = key
        this.editProupVisibile = !this.editProupVisibile
      }
    },
    editDialogConfirm() {
      if (!this.editInputValue) return

      this.saveForm[this.currentEditInputKey] = this.editInputValue
      const { position, email } = this.saveForm
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      modifyInfo({ position, email }).then(({ result }) => {
        uni.hideLoading();
        uni.showToast({
          title: '修改成功',
          duration: 2000,
          icon: 'none'
        });
      }).catch((e) => {
        uni.hideLoading();
        uni.showToast({
          title: e.message || '修改失败',
          duration: 2000,
          icon: 'none'
        });
      })
    },
    // 邮箱input框动态匹配
    onChangeInputEmail(e) {
      if (this.currentEditInputKey === 'position') return
      const email = e.detail.value;
      const searchList = []
      if (email.includes('@')) {
        const value = email.split('@')
        const lsit = constEmailList.filter(item => item.includes(value[1]))
        lsit.forEach(item => {
          searchList.push(`${value[0]}${item}`)
        });
      } else {
        constEmailList.forEach(item => {
          searchList.push(`${email}${item}`)
        });
      }
      if (this.saveForm.email == searchList[0] || email == '' || searchList.length == 0) {
        this.emailList = []
        return
      }
      this.emailList = searchList.splice(0, 7)
    },
    // 复制邮箱
    setEmail(item) {
      this.saveForm.email = item
      this.editInputValue = item
      this.emailList = []
    },
    // 清除空格
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
    fetchDefaultCode() {
      getDictionaryByCode(DEFAULT_INVITATION_CODE).then(({ result }) => {
        const code = this.shareInvitationCode || result.value
        if (!this.saveForm.invitationCode && this.userStatus === 'notEnable') {
          this.saveForm.invitationCode = code
        }
        this.defaultInvitationCode = code
      })
    },
    // 离开邀请码判断逻辑是否为空
    blurInvitationCode() {
      if (!this.saveForm.invitationCode && this.userStatus === 'notEnable') {
        this.saveForm.invitationCode = this.defaultInvitationCode
      }
    }
  },
  onReachBottom() {
    if (this.saveForm.isMaster) {
      this.fetchAccountPage()
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
/deep/ .van-tabs__line {
  background: #429881 !important;
}
.account {
  padding: 34rpx 0;
  width: 92%;
  margin: 0 auto;
  .title {
    font-size:32rpx;
    font-weight: bold;
    color: #242629;
  }
  .tag {
    font-size: 24rpx;
    color: #FF7640;
    background: rgba(255, 118, 64, 0.1);
    border-radius: 26rpx;
    padding: 4rpx 10rpx;
    margin-left: 6rpx;
  }
  .button {
    padding: 4rpx 10rpx;
    color: #71767D;
    border-radius: 28rpx;
    border: 1px solid #C7CACF;
    padding: 6rpx 30rpx;
    font-size: 26rpx;
  }
}

.accountButton {
  position: fixed;
  bottom: 0px;
  left: 0px;
  width: 100%;
  z-index: 999;
}
/deep/ .van-hairline--top-bottom {
  border-bottom: 16rpx solid #F6F6F6 ;
}

</style>
<style>
._userEditCell {
  padding: 14rpx 32rpx !important;
  border-radius: 50rpx !important;
  background: #F6F6F6 !important;
  color:#959CA7 !important;
}
</style>
