import wepy from 'wepy';
import global from './global';
import {host, apiVersion, version} from './config'

export default {
  async getUserInfo(refresh, bookId) {
    let cache = global.getUserInfo();
    if (cache && cache.id && cache.unionid && !refresh) {
      return cache;
    } else {
      /* 判断需不需要请求session */
      let userInfo
      if (cache && (cache.unionid || cache.openid_app)) {
        userInfo = {
          unionid: cache.unionid,
          openid: cache.openid_app,
        };
      } else {
        const loginRes = await wepy.login();
        const code = loginRes.code;
        const url = `${host}/api/${apiVersion}/miniprogram/session`;
        const sessionRes = await wepy.request({
          url,
          method: 'POST',
          data: {
            code,
          }
        });
        if (sessionRes.statusCode !== 200) return;
        userInfo = sessionRes.data;
      }
      /* 判断需不需要请求session */
      let userRecord = {};
      if (userInfo) {
        const unionid = userInfo.unionid;
        const openid_app = userInfo.openid;
        let record = {};
        if (unionid) {
          record = await this.getUser(unionid);
        } else {
          record = await this.getUser(null, openid_app);
        }

        if(record.statusCode === 200) {
          const user = {
            openid: userInfo.openid,
            unionid,
          }
          if (!record.data) { // 不存在则创建
            const result = await this.createUser(user);
            userRecord = result.data;
          } else { // 存在的情况下openid_app或unionid不全则补充，否则直接返回
            if (!record.data.openid_app || !record.data.unionid) {
              if (!user.unionid) {
                const setting = await wepy.getSetting();
                // 查看是否授权
                if (setting.authSetting['scope.userInfo']) {
                  const userInfoResult = await wepy.getUserInfo();
                  const url = `${host}/api/${apiVersion}/miniprogram/userinfo`;
                  const realInfo = await wepy.request({
                    url,
                    method: 'POST',
                    data: {
                      encryptedData: userInfoResult.encryptedData,
                      sessionKey: userInfo.session_key,
                      iv: userInfoResult.iv,
                    }
                  });
                  user.unionid = realInfo.data.unionId;
                } else {

                }
              }
              await this.updateUser(record.data.id, user);
            }
            userRecord = record.data;
          }
        } else {
          console.error('api.getUser error');
        }
      }
      userRecord.openid = userInfo.openid;
      global.setUserInfo(userRecord);

      return userRecord;
    }
  },
  async checkSettingStatus() {
    const userSetting = await wepy.getSetting();
    return userSetting;
  },
  getUser(unionId, openid_app) {
    const url = `${host}/api/${apiVersion}/users/info`;
    return wepy.request({
      url,
      method: 'POST',
      data: {
        unionId,
        openid_app,
        version,
      },
    }).then((data) => Promise.resolve(data));
  },
  createUser(user) {
    const url = `${host}/api/${apiVersion}/users`;
    user.openid_app = user.openid;
    return wepy.request({
      url,
      method: 'POST',
      data: user,
    }).then((data) => Promise.resolve(data));
  },
  updateUser(id, user) {
    const url = `${host}/api/${apiVersion}/users/${id}`;
    if (user.openid) user.openid_app = user.openid;
    return wepy.request({
      url,
      method: 'PUT',
      data: user,
    }).then((data) => Promise.resolve(data));
  },
  createJoinUsInfo(data) {
    const url = `${host}/api/${apiVersion}/info`;
    return wepy.request({
      url,
      method: 'POST',
      data,
    }).then((data) => Promise.resolve(data));
  },
  createOfflineInfo(data) {
    const url = `${host}/api/${apiVersion}/offline`;
    return wepy.request({
      url,
      method: 'POST',
      data,
    }).then((data) => Promise.resolve(data));
  },

  updateOfflineInfo(id, data) {
    const url = `${host}/api/${apiVersion}/offline/${id}`;
    return wepy.request({
      url,
      method: 'PUT',
      data,
    }).then((data) => Promise.resolve(data));
  },
  
  getOffline(userId, bookId) {
    const url = `${host}/api/${apiVersion}/offline/condition?userId=${userId}&bookId=${bookId}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getBookmark(start, end) {
    const url = `${host}/api/${apiVersion}/bookmarks/date?start=${start}&end=${end}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getBanners() {
    const url = `${host}/api/${apiVersion}/images/banners`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getCourseStaticImg() {
    const url = `${host}/api/${apiVersion}/images/course`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getCourseInfo(id) {
    const url = `${host}/api/${apiVersion}/courses/${id}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getBooks(by) {
    const url = `${host}/api/${apiVersion}/books?by=${by}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getTodayList(page) {
    const url = `${host}/api/${apiVersion}/today/list/num?page=${page}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getHeadimg(avatarUrl, userId) {
    const url = `${host}/api/${apiVersion}/today/headimg`;
    const data = {
      avatarUrl,
      userId,
    }
    return wepy.request({
      url,
      method: 'POST',
      data,
    }).then((data) => Promise.resolve(data));
  },
  getQRImg(type, id, bookId) {
    const url = `${host}/api/${apiVersion}/today/qr`;
    const data = {
      type,
      id,
    }
    if (bookId) {
      data.bookId = bookId;
    }
    return wepy.request({
      url,
      method: 'POST',
      data,
    }).then((data) => Promise.resolve(data));
  },
  getTodayArticle(id) {
    const url = `${host}/api/${apiVersion}/today/${id}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getMemberImages() {
    const url = `${host}/api/${apiVersion}/images/member`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getJoinImages() {
    const url = `${host}/api/${apiVersion}/images/join`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getCardImages() {
    const url = `${host}/api/${apiVersion}/images/card`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getWolfImages() {
    const url = `${host}/api/${apiVersion}/images/wolf`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getNoCourseImg(bookId) {
    const url = `${host}/api/${apiVersion}/images/course/no?bookId=${bookId}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getLessonList(bookId) {
    const url = `${host}/api/${apiVersion}/lessons?book_id=${bookId}&base=1`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getLesson(id, base) {
    let url = `${host}/api/${apiVersion}/lessons/${id}`;
    if (base) url = url + `?base=${base}`
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getStarCount(type, id, ids) {
    let url = `${host}/api/${apiVersion}/star?type=${type}`;
    if (id) {
      url = url + `&id=${id}`;
    }
    if (ids) {
      url = url + `&ids=${ids}`;
    }
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  updateStar(type, id, count) {
    const url = `${host}/api/${apiVersion}/star`;
    const data = {
      type,
      id,
      count,
    }
    return wepy.request({
      url,
      method: 'POST',
      data,
    }).then((data) => Promise.resolve(data));
  },
  getReadCount(type, id) {
    const url = `${host}/api/${apiVersion}/read?type=${type}&id=${id}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getVipCount() {
    const url = `${host}/api/${apiVersion}/miniprogram/vip/count`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  updateReadCount(type, id, count) {
    const url = `${host}/api/${apiVersion}/read`;
    const data = {
      type,
      id,
      count,
    }
    return wepy.request({
      url,
      method: 'POST',
      data,
    }).then((data) => Promise.resolve(data));
  },
  getLessonByBookId(bookId) {
    const url = `${host}/api/${apiVersion}/lessons/book?bookId=${bookId}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  unifiedorder(data) {
    const url = `${host}/api/${apiVersion}/miniprogram/unifiedorder`;
    return wepy.request({
      url,
      method: 'POST',
      data,
    }).then((data) => Promise.resolve(data));
  },
  paymentSuccess(data) {
    const url = `${host}/api/${apiVersion}/miniprogram/pay/success`;
    return wepy.request({
      url,
      method: 'POST',
      data,
    }).then((data) => Promise.resolve(data));
  },
  getVipInfo(userId, trial) {
    let url = `${host}/api/${apiVersion}/miniprogram/vip?userId=${userId}`;
    if (trial) url = url + `&trial=1`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  deleteVipInfo(userId) {
    const url = `${host}/api/${apiVersion}/miniprogram/vip`;
    const data = {
      userId,
    };
    return wepy.request({
      url,
      method: 'DELETE',
      data,
    }).then((data) => Promise.resolve(data));
  },
  getPurchaseRecordInfo(bookId, userId) {
    const url = `${host}/api/${apiVersion}/miniprogram/purchase?bookId=${bookId}&userId=${userId}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },

  getCouponAvailable(userId) {
    const url = `${host}/api/${apiVersion}/coupons/available?userId=${userId}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getCouponPurchase(userId, price, productId) {
    const url = `${host}/api/${apiVersion}/coupons/available/purchase?userId=${userId}&price=${price}&productId=${productId}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  setCouponUsed(id) {
    const url = `${host}/api/${apiVersion}/coupons/${id}/use`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getCoupon(id) {
    const url = `${host}/api/${apiVersion}/coupons/${id}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getTrialConfig() {
    const url = `${host}/api/${apiVersion}/trial/config`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getTrialInfo(id) {
    const url = `${host}/api/${apiVersion}/trial/${id}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  createTrial(cardId, userId) {
    const url = `${host}/api/${apiVersion}/trial`;
    const data = {
      cardId,
      userId,
    };
    return wepy.request({
      url,
      method: 'POST',
      data,
    }).then((data) => Promise.resolve(data));
  },
  updateTrial(id, days) {
    const url = `${host}/api/${apiVersion}/trial`;
    const data = {
      id,
      days,
    };
    return wepy.request({
      url,
      method: 'PUT',
      data,
    }).then((data) => Promise.resolve(data));
  },
  drawCoupon(id, userId) {
    const url = `${host}/api/${apiVersion}/coupons/${id}/draw?userId=${userId}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  getBoughtProducts(userId) {
    const url = `${host}/api/${apiVersion}/miniprogram/bought?userId=${userId}`;
    return wepy.request(url).then((data) => Promise.resolve(data));
  },
  // clearMsg() {
  //   return wepy.clearStorage();
  // },
}
