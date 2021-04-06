
module.exports = {
  imageVersion: 'v20210331',
  timeout: 60 * 1000,
  headersTokenKey: 'Authorization',
  headersSessionKey: 'WX_SESSION_KEY',
  kd100AppId: 'wx6885acbedba59c14',
  orderDeliveryReminder: 'oStkpeU-TPWh6pNYbq7nTTKbbrVp4os215Jy-vwleyE',
  invitationResultNotice: 'aMxogVS26J2EeU-n3Qq1GR73G8Ai1aNR4bDjeEpjDdk',
  rewardToAccountNotice: 'ALVjLb5CwlX8_WcLsTljvIxxFNhnHC6gh2Q7muOg82o',
  notificationCertificationResults: 'gwqIYIQhfn6PuwizTdXViq7Fa499QS1Nsh8FYaKJiSs',
  apiAgent: 'yjdf',
  ...require(`./${process.env.VUE_APP_ENV}`),
  // 关于众上
  aboutZs: 'https://mp.weixin.qq.com/s/mSOgqRGia9br5wrBTEwT5Q'
}
