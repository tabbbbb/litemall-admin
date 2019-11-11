import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/user/list',
    method: 'get',
    params: query
  })
}

export function listAddress(query) {
  return request({
    url: '/address/list',
    method: 'get',
    params: query
  })
}

export function listCollect(query) {
  return request({
    url: '/collect/list',
    method: 'get',
    params: query
  })
}

export function listFeedback(query) {
  return request({
    url: '/feedback/list',
    method: 'get',
    params: query
  })
}

export function listFootprint(query) {
  return request({
    url: '/footprint/list',
    method: 'get',
    params: query
  })
}

export function listHistory(query) {
  return request({
    url: '/history/list',
    method: 'get',
    params: query
  })
}
export function addressByUserId(query) {
  return request({
    url: '/address/address',
    method: 'get',
    params: query
  })
}

export function requestAdminIds(query) {
  return request({
    url: '/admin/adminIds',
    method: 'put',
    params: query
  })
}


export function updateUserLevel(query) {
  return request({
    url: '/user/userLevel',
    method: 'put',
    params: query
  })
}

