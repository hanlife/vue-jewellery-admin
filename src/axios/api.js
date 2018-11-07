import $http from './http.js'


export const login = function (data) {
    return $http.get('/login', data)
}