import Item from 'antd/lib/list/Item'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {Table,Tag,Button} from 'antd'
import graphql from '../../../util/graphqlAPI'

const NEWS = `
query Query($author: String) {
  getAuditNewsList(author: $author) {
    _id
    auditState
    author
    category {
      _id
      title
      value
    }
    categoryId
    publishState
    region
    roleId
    title
  }
}`

const UNDO = `
mutation Mutation($newsId: String) {
  newsUndo(newsId: $newsId) {
    _id
  }
}`

const PUBLISH = `
mutation Mutation($newsPublishId: String) {
  newsPublish(newsPublishId: $newsPublishId) {
    _id
  }
}`

export default function AuditList(props) {
  const [dataSource,setDataSource]=useState([])
  const {username}=JSON.parse(localStorage.getItem('token'))

  function handleUndo(item){
    setDataSource(dataSource.filter(data=>data._id!==item._id))
    // axios.patch(`http://localhost:5000/news/${item.id}`,{
    //   auditState:0
    // }).then(res=>{
    //   alert("now this news can be found in draft")
    // })
    graphql("Mutation", UNDO, {
      newsId: item._id
    })
    alert("now this news can be found in draft")
  }

  function handleUpdate(item){
    props.history.push(`/news-manage/update/${item._id}`)
  }

  async function handlePublish(item){
    // axios.patch(`http://localhost:5000/news/${item.id}`,{
    //   'publishState':2,
    //   'publishTime':Date.now()
    // }).then(res=>{
    //   props.history.push('/publish-manage/published')
    //   alert("now you can check it in published list")
    // })
    await graphql("Mutation", PUBLISH, {
      newsPublishId: item._id
    })
    props.history.push('/publish-manage/published')
    alert("now you can check it in published list")
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
      title: 'Audit State',
      dataIndex: 'auditState',
      render:(item)=>{
        const auditArr=['unreviewed','in review','passed','not passed']
        const colorList=['grey','orange','lime','red']
        return <Tag color={colorList[item]}>{auditArr[item]}</Tag>
      }
    },
    {
        title: 'Operation',
        render:(item)=>{
          switch(item.auditState){
            case 1:
              return <Button danger onClick={()=>{handleUndo(item)}}>Undo</Button>
            case 2:
              return <Button onClick={()=>{handlePublish(item)}}>Publish</Button>
            default:
              return <Button type='primary' onClick={()=>{handleUpdate(item)}}>Update</Button>
          }
      }
    },
  ];
  useEffect(()=>{
    // axios(`http://localhost:5000/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then(res=>{
    //   setDataSource(res.data)
    // })

    async function fetchData(){
      const res = await graphql("Query", NEWS, {
        author: username
      })
      setDataSource(res.getAuditNewsList)
    }  
    fetchData()

  },[])
  return(
    <div>
      <Table dataSource={dataSource} columns={columns} pagination={{
            pageSize:4
        }}
        rowKey={Item=>Item._id}
      />
    </div>
  )
}
