
// 客户端API-promise包装

// 下载文件
export const uniDonwloadFile = (url) => {
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: res => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          reject(`下载失败${res.statusCode}`)
        }
      },
      fail: (error) => {
        reject(error.errMsg)
      }
    })
  })
}

// 保存图片
export const uniSaveImage = (tempFilePath) => {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        resolve('保存成功')
      },
      fail: () => {
        reject('保存失败')
      }
    })
  })
}
