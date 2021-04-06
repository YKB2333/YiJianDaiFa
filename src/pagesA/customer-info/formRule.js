export function rules(data) {
  return new Promise((resolve) => {
    const regEmail = /^[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,6}$/; // 邮箱
    const identifyNumber = /^[A-Z0-9]{15}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/
    if (data) {
      const showToast = (title) => {
        uni.showToast({ title: title, duration: 2000, icon: 'none' });
      }
      if (!data.name) {
        showToast('姓名不能为空')
      } else if (!data.email) {
        showToast('邮箱不能为空')
      } else if (!regEmail.test(data.email)) {
        showToast('邮箱格式不正确')
      } else if (data.enterpriseType == '0' && !data.customerName) {
        showToast('公司名称不能为空')
      } else if (data.enterpriseType == '0' && !data.taxNumber) {
        showToast('请输入纳税人登记号')
      } else if (data.enterpriseType == '0' && data.taxNumber && !identifyNumber.test(data.taxNumber)) {
        showToast('请输入正确的纳税人登记号')
      } else if (!data.invitationCode) {
        showToast('请输入邀请码')
      } else if (data.enterpriseType == '0' && !data.businessLicenses.length) {
        showToast('请上传营业执照')
      } else if (data.enterpriseType == '0' && data.businessLicenses.length && data.licenseType === 0 && !data.businessLicenses.find(e => e.keys == 'license')) {
        showToast('请上传营业执照')
      } else if (data.enterpriseType == '0' && data.businessLicenses.length && data.licenseType === 1 && !data.businessLicenses.find(e => e.keys == 'license_personal')) {
        showToast('请上传营业执照')
      } else if (data.enterpriseType == '0' && data.businessLicenses.length && data.licenseType === 1 && !data.businessLicenses.find(e => e.keys == 'license_code')) {
        showToast('请上传机构组织机构代码证')
      } else {
        resolve(true)
      }
      resolve(false)
    } else {
      uni.showToast({ title: '异常', duration: 2000, icon: 'none' });
      resolve(false)
    }
  })
}
