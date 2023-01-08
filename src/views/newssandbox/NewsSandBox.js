import React from 'react'
import SideMenu from '../../components/sandbox/SideMenu'
import TopHeader from '../../components/sandbox/TopHeader'
import NewRouter from '../../components/sandbox/NewRouter'
import './NewsSandBox.css'
import {Layout } from 'antd'
import './NewsSandBox.css'
const { Content } = Layout;

export default function NewsSandBox() {
  return (
    <Layout>
        <SideMenu></SideMenu>

        <Layout className="site-layout">
            <TopHeader></TopHeader>
            <Content className="site-layout-background"
            style={{
              margin: '24px 16px',
              padding: '12px',
              minHeight: 280,
              overflow: 'auto'
            }}>
              <NewRouter></NewRouter>
            </Content>

        </Layout>
    </Layout>
  )
}
