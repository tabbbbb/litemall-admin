import request from '@/utils/request'

export function listDirect(query) {
  return request({
    url: '/direct/list',
    method: 'get',
    params: query
  })
}


export function createDirect(data) {
  console.log(data)
  return request({
    url: '/direct/create',
    method: 'post',
    data
  })
}


export function updateDirect(data) {
  return request({
    url: '/direct/update',
    method: 'post',
    data
  })
}

export function deleteDirect(data) {
  return request({
    url: '/direct/delete',
    method: 'post',
    data
  })
}
