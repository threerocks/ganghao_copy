import wepy from 'wepy';
import querystring from 'querystring';

export const normalizeBooks = function(books) {
  const ret = [];
  let items = [];
  let len = books.length;
  for (const book of books) {
    if (/http[s]{0,1}\:\/\/.*?\//.test(book.cover)) {
      book.cover = book.cover.replace(/http[s]{0,1}\:\/\/.*?\//, '/');
    }
  }
  for (let i = 0; i < len; i+=3) {
    ret.push(books.slice(i, i+3));
  }
  if (len % 3 > 0) {
    const extra_len = 3 - len % 3;
    for (let i = 0; i < extra_len; i++) {
      ret[ret.length - 1].push({
        empty: true,
      })
    }
  }

  return ret;
};

export const normalizeMemberBooks = function(books, memberBooks, memberBooksInfo) {
  const map = {};
  const arr = [];
  for (const book of books) {
    if (/http[s]{0,1}\:\/\/.*?\//.test(book.cover)) {
      book.cover = book.cover.replace(/http[s]{0,1}\:\/\/.*?\//, '/');
    }
    map['' + book.id] = book;
  }
  let i = 0;
  for (const id of memberBooks) {
    arr.push(Object.assign(map['' + id], memberBooksInfo[i]));
    i++;
  }

  return arr;
};

export const normalizeImages = function(images) {
  const map = {};
  for (const image of images) {
    map[image.name] = image;
  }

  return map;
};


export const random_int = function (minNum, maxNum){  
  const chioces = maxNum - minNum + 1 ;    //可能数的总数  
  return Math.floor(Math.random() * chioces + minNum);  
}

export const checkArr = function(arr1, arr2) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

// 截流函数
let timer = null;
export const debounce = function(func, delay) {
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } 
}

export const normalizeTodayList = function(list) {
  const map = {};
  for (const item of list) {
    const date = item.date;
    if (map[date]) {
      map[date].push(item);
    } else {
      map[date] = [];
      map[date].push(item)
    }
  }

  return map;
};


export const getImageInfo = function (url) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: url,
      success: function (res) {
        resolve(res);
      },
      fail: function (res) {
        reject(new Error(res));
      },
    })
  })
}

export const downloadFile = function (url) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: url,
      success: function(res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          reject(new Error(res))
        }
      },
      fail: function (res) {
        reject(new Error(res));
      },
    })
  })
}

export const canvasToTempFilePath = function (canvasId) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      canvasId,
      success: function(res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        resolve(res.tempFilePath);
      },
      fail: function (res) {
        reject(new Error(res));
      },
    })
  })
}

export const checkAuth = async function () {
  const setting = await wepy.getSetting();
  // 查看是否授权
  return setting.authSetting['scope.userInfo'] ? true : false;
}

export const urlParse = function (url) {
  const str = url.split('?')[1];
  return querystring.parse(str);
}