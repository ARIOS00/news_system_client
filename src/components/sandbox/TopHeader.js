import React, { useState } from 'react'
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
  } from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, Avatar } from 'antd';
import { DownOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons';
import {withRouter} from 'react-router-dom'
import store from '../../redux/store';
const { Header } = Layout;

function TopHeader(props) {
    const [collapsed,setCollapsed]=useState(false)
    const {role:{roleName},username}=JSON.parse(localStorage.getItem('token'))

    function reverse(){
        setCollapsed(!collapsed)
        store.dispatch(!collapsed?{type:"hide-SideMenu"}:{type:"show-SideMenu"})
    }

    const menu = (
        <Menu
        >
            <Menu.Item key='/username'>{roleName}</Menu.Item>
            <Menu.Item key='/logout' danger onClick={()=>{
                localStorage.removeItem('token')
                props.history.replace('/login')
            }}>Log out</Menu.Item>
        </Menu>
      )

    return (
            <Header className="site-layout-background" style={{ padding: '0 16px' }}>
                {
                    collapsed?<MenuUnfoldOutlined onClick={reverse} />:<MenuFoldOutlined onClick={reverse} />
                }
                <div style={{float:'right'}}>
                    <span>Hello! <span style={{color:'#1890ff'}}>{username}</span></span>
                    <span style={{paddingRight:'10px'}}></span>
                    <Dropdown overlay={menu}>
                        <Avatar size="large" className='avator' icon={<UserOutlined />} />
                    </Dropdown>
                </div>
            </Header>
    )
}

export default withRouter(TopHeader)