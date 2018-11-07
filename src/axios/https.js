'use strict'

import axios from 'axios'
import qs from 'qs'
import {
  Message
} from 'element-ui'

// axios 配置
axios.defaults.baseURL = process.env.BASE_URL

axios.defaults.timeout = 30000

axios.interceptors.request.use(config => {
  // loading
  // sessionStorage.setItem('token', 'E89642F61879E494C0BA16DBAC2FD0AF');
  if (sessionStorage.getItem('token') !== undefined) { // 判断是否存在token，如果存在的话，则每个http header都加上token
    config.headers.sessid_id = sessionStorage.getItem('token')
  }
  return config
}, error => {
  return Promise.reject(error)
})

axios.interceptors.response.use(response => {
  return response
}, error => {
  return Promise.resolve(error.response)
})

function checkStatus(response) {
  // loading
  // 如果http状态码正常，则直接返回数据
  if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
    return response
    // 如果不需要除了data之外的数据，可以直接 return response.data
  }
  // 异常状态下，把错误信息返回去
  return {
    status: -404,
    msg: '网络异常'
  }
}

function checkCode(res) {
  // 如果code异常(这里已经包括网络错误，服务器错误，后端抛出的错误)，可以弹出一个错误提示，告诉用户
  if (res.status === -404) {
    Message.error(res.msg)
  }

  if (res.data && res.data.code && res.data.code != 200) {
    if (res.data.code === 'URC0001') { // 未登录
      sessionStorage.removeItem('token')
      setCookie('sessionid', ' ', -1)
      setCookie('userInfo', ' ', -1)
      window.location.href = '/'
    }
    if (res.data.code === 'URC0009') {
      Message.warning({
        message: '用户已存在'
      })
    }
    if (res.data.code === 'URC0010') {
      Message.warning({
        message: '手机号码已存在'
      })
    }
    if (res.data.code === 'URC0012') {
      Message.warning({
        message: '用户不存在'
      })
    }
    //  Message.error({
    //     message: res.data.message
    //   })
  }
  return res
}

function setCookie(name, value, expiredays) {
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + expiredays)
  document.cookie = name + '=' + escape(value) + ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString())
}

export default {
  post(url, params) {
    return axios({
      method: 'post',
      url,
      params: params,
      timeout: 10000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }).then(
      (response) => {
        return checkStatus(response)
      }
      ).then(
      (res) => {
        return checkCode(res)
      }
      )
  },
  get(url, params) {
    return axios({
      method: 'get',
      url,
      params, // get 请求时带的参数
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).then(
      (response) => {
        return checkStatus(response)
      }
      ).then(
      (res) => {
        return checkCode(res)
      }
      )
  },
  postB(url, params) {
    return axios.post(url, params, {
      timeout: 10000
    }).then(
      (response) => {
        return checkStatus(response)
      }
      ).then(
      (res) => {
        return checkCode(res)
      }
      )
  },
  postC(url, params) {
    return axios({
      method: 'post',
      url,
      data: qs.stringify(params),
      timeout: 10000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }).then((response) => {
      return checkStatus(response)
    }).then((res) => {
      return checkCode(res)
    })
  }
}
