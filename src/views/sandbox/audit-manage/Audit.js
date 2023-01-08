import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Button, Table } from 'antd'
import graphql from '../../../util/graphqlAPI'

const NEWS = `
query Query {
  getAuditNews {
    _id
    auditState
    author
    category {
      title
      _id
      value
    }
    categoryId
    publishState
    createTime
    publishTime
    region
    roleId
    title
  }
}`

const UPDATE_NEWS = `
mutation Mutation($newsId: String, $newsCreateInput: newsCreateInput) {
  newsUpdate(newsId: $newsId, newsCreateInput: $newsCreateInput) {
    auditState
    publishState
  }
}`

export default function Audit() {
  const [dataSource,setDataSource]=useState([])
  const {role, roleId,region,username}=JSON.parse(localStorage.getItem('token'))
  useEffect(()=>{
    const roleObj={
      '1':'superadmin',
      '2':'admin',
      '3':'editor'
    }
    // axios.get(`http://localhost:5000/news?auditState=1&_expand=category`).then(res=>{
    //   const list=res.data
    //   setDataSource(roleObj[roleId]==='superadmin'?list:[...list.filter(item=>item.author===username)],
    //   ...list.filter(item=>item.region===region && roleObj[item.roleId]==='editor'))
    // })
    async function fetchData(){
      const res = await graphql("Query", NEWS)
      const list = res.getAuditNews
      setDataSource(role.roleName=='Senior Administrator'?list:[...list.filter(item=>item.author===username)],
      ...list.filter(item=>item.region===region && role.roleName==="Regional Editor"))
    }
    fetchData()
  },[roleId,region,username])

  async function handlePass(item,auditState,publishState){
    setDataSource(dataSource.filter(data=>data._id!==item._id))
    // axios.patch(`http://localhost:5000/news/${item.id}`,{
    //   auditState,
    //   publishState
    // }).then(res=>{
    //   alert("you can check it in audit list now")
    // })
    await graphql("Mutation", UPDATE_NEWS, {
      newsId: item._id,
      newsCreateInput: {
        auditState,
        publishState
      }
    })
    alert("you can check it in audit list now")
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      render:(title,item)=>{
          return <a href={`#/news-manage/preview/${item._id}`}>{title}</a>
      }
    },
    {
      title: 'Author',
      dataIndex: 'author',
    },

    {
      title: 'Category',
      dataIndex: 'category',
      render:(item)=>{
        return <div>{item.title}</div>
      }
    },
    {
        title: 'Operation',
        render:(item)=>{
          return <div>
          <Button type='primary' onClick={()=>{handlePass(item,2,1)}}>Pass</Button>
          <Button danger onClick={()=>{handlePass(item,3,0)}}>Reject</Button>
        </div>
      }
    },
  ];
  return (
    <div>
      <Table dataSource={dataSource} columns={columns} pagination={{
            pageSize:4
        }}
        rowKey={Item=>Item._id}
      />
    </div>
  )
}
