import React, { useEffect, useState } from 'react'
import UserList from '../../views/sandbox/user-manage/UserList'
import Home from '../../views/sandbox//home/Home'
import RoleList from '../../views/sandbox/right-manage/RoleList'
import RightList from '../../views/sandbox/right-manage/RightList'
import NotFound from '../../views/sandbox/NotFound/NotFound'
import {HashRouter,Route,Switch,Redirect} from 'react-router-dom'
import NewsAdd from '../../views/sandbox/news-manage/NewsAdd'
import NewsDraft from '../../views/sandbox/news-manage/NewsDraft'
import NewsCategory from '../../views/sandbox/news-manage/NewsCategory'
import Audit from '../../views/sandbox/audit-manage/Audit'
import AuditList from '../../views/sandbox/audit-manage/AuditList'
import Unpublished from '../../views/sandbox/publish-manage/Unpublished'
import Published from '../../views/sandbox/publish-manage/Published'
import Sunset from '../../views/sandbox/publish-manage/Sunset'
import axios from 'axios'
import NewsPreview from '../../views/sandbox/news-manage/NewsPreview'
import NewsUpdate from '../../views/sandbox/news-manage/NewsUpdate'
import {Spin} from 'antd'
import store from '../../redux/store'
import graphql from '../../util/graphqlAPI'

const RIGHTS = `
query GetRights {
    getRights {
      _id
      grade
      key
      pagepermission
      title
    }
  }
`

const CHILDREN = `
query Query {
    getChildrens {
      _id
      grade
      key
      pagepermission
      routepermission
      rightId
      title
    }
  }`

const LocalRouterMap={
    '/home':Home,
    '/user-manage/list':UserList,
    '/right-manage/role/list':RoleList,
    '/right-manage/right/list':RightList,

    '/news-manage/add':NewsAdd,
    '/news-manage/draft':NewsDraft,
    '/news-manage/category':NewsCategory,
    '/news-manage/preview/:id':NewsPreview,
    '/news-manage/update/:id':NewsUpdate,

    '/audit-manage/audit':Audit,
    '/audit-manage/list':AuditList,

    '/publish-manage/unpublished':Unpublished,
    '/publish-manage/published':Published,
    '/publish-manage/sunset':Sunset
}

export default function NewRouter() {
    const [BackRouteList,setBackRouteList]=useState([])
    const {role:{rights}}=JSON.parse(localStorage.getItem('token'))
    const [loading,setLoading]=useState(false)
    useEffect(()=>{
        store.subscribe(()=>{
            setLoading(store.getState().LoadingReducer.isLoading)
        })
    },[])

    function checkRoute(item){
        return LocalRouterMap[item.key] && (item.pagepermission || item.routepermission)
    }

    function checkUserPermission(item){
        return rights.checked.includes(item.key)
    }
    useEffect(()=>{
        // Promise.all([
        //     axios.get('http://localhost:5000/rights'),
        //     axios.get('http://localhost:5000/children')
        // ]).then(res=>{
        //     console.log([...res[0].data,...res[1].data])
        //     setBackRouteList([...res[0].data,...res[1].data])
        // })
        async function fetchData(){
            const res1 = await graphql("GetRights", RIGHTS)
            const res2 = await graphql("Query", CHILDREN)
            setBackRouteList([...res1.getRights,...res2.getChildrens]) 
            // console.log([...res1.getRights,...res2.getChildrens])
        }
        fetchData()
    },[])
    return(
        <Spin size='large' spinning={loading}>
            <Switch>
                {
                    BackRouteList.map(item=>{
                        if(checkRoute(item) && checkUserPermission(item)){
                            return <Route path={item.key} key={item.key} component={LocalRouterMap[item.key]} exact/>
                        }
                        return null
                    })
                }
                <Redirect from='/' to='/home' exact></Redirect>
                <Route path='*' component={NotFound}></Route>
            </Switch>
        </Spin>
    )
}
