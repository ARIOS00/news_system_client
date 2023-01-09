import axios from 'axios'
import store from '../redux/store'

axios.defaults.baseURL='http://52.14.200.96:4000'

axios.interceptors.request.use(function(config){
    store.dispatch({
        type:'change-Loading',
        payload:true
    })
    return config
},function(error){
    return Promise.reject(error)
})

axios.interceptors.response.use(function(response){
    store.dispatch({
        type:'change-Loading',
        payload:false
    })
    return response
},function(error){
    store.dispatch({
        type:'change-Loading',
        payload:false
    })
    return Promise.reject(error)
})