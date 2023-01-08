import React, { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd';
import {
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
  } from '@ant-design/icons';
import './index.css'
import {withRouter} from 'react-router-dom'
import axios from 'axios'
import store from '../../redux/store';
import graphql from '../../util/graphqlAPI';

const RIGHTS = `
query Query {
    getRights {
      _id
      children {
        _id
        grade
        key
        pagepermission
        rightId
        routepermission
        title
      }
      grade
      key
      pagepermission
      title
    }
  }
`

const { Sider } = Layout;
const { SubMenu } = Menu;

const iconList={
    '/home':<UserOutlined />,
    '/user-manage':<UserOutlined />,
    '/user-manage/list':<UserOutlined />,
    '/right-manage':<UserOutlined />,
    '/right-manage/role/list':<UserOutlined />,
    '/right-manage/right/list':<UserOutlined />,
}

function SideMenu(props) {
    const [collapsed,setCollapsed]=useState(false)
    const [menu,setMenu]=useState([])
    const path=props.location.pathname
    const {role:{rights}}=JSON.parse(localStorage.getItem('token'))

    useEffect(()=>{
        store.subscribe(()=>{
            setCollapsed(store.getState().CollapsedReducer.isCollapsed)
        })
    },[])

    useEffect(()=>{
        // axios({
        //     url:'http://localhost:5000/rights?_embed=children',
        //     method:'GET'
        // }).then(res=>{
        //     console.log(res.data)
        //     setMenu(res.data)
        // })
        async function fetchData(){
            const res = await graphql("Query", RIGHTS)
            setMenu(res.getRights)
        }
        fetchData()
    },[])

    function checkPermission(item){
        return item.pagepermission && rights.checked.includes(item.key)?true:false
    }

    function renderMenu(menuList){
        return menuList.map(item=>{
            if(item.children?.length && checkPermission(item)){
                return <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
                    {renderMenu(item.children)}
                </SubMenu>
            }

            return checkPermission(item) && <Menu.Item key={item.key} icon={iconList[item.key]} onClick={()=>{
                props.history.push(item.key)
            }}>{item.title}</Menu.Item>
        })
    }
      
    return(
        <Sider trigger={null} collapsible collapsed={collapsed}>
            <div style={{display:'flex',height:'100%',flexDirection:'column'}}>
                <div className="logo">{collapsed?'':'News Manager'}</div>
                <div style={{flex:1,overflow:'auto'}}>
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[path]}
                        defaultOpenKeys={['/'+path.split('/')[1]]}
                    >
                        {renderMenu(menu)}
                    </Menu>
                </div>
            </div>
        </Sider>
    )
}

export default withRouter(SideMenu)