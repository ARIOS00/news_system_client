import React, { useEffect, useState } from 'react'
import {Table,Tag,Button,Modal,Popover,Switch} from 'antd'
import {DeleteOutlined,EditOutlined,ExclamationCircleOutlined,UploadOutlined} from '@ant-design/icons'
import axios from 'axios'
import Upload from 'antd/lib/upload/Upload'
import graphql from '../../../util/graphqlAPI'
const {confirm} = Modal

const DRAFT = `
query Query($newsDraftFileter: newsDraftFileter) {
  getNewsDraft(newsDraftFileter: $newsDraftFileter) {
    _id
    auditState
    author
    category {
      _id
      title
      value
    }
    categoryId
    content
    createTime
    publishState
    region
    roleId
    star
  star
    title
    view
  }
}`

const DELETE = `
mutation Mutation($newsDeleteId: String) {
  newsDelete(newsDeleteId: $newsDeleteId) {
    _id
  }
}`

const UPLOAD = `
mutation Mutation($newsId: String) {
  newsUpload(newsId: $newsId) {
    _id
    auditState
    author
  }
}`

export default function NewsDraft(props) {
    const [dataSource,setDataSource]=useState([])

    const {username}=JSON.parse(localStorage.getItem('token'))

    useEffect(()=>{
        // axios({
        //     url:`http://localhost:5000/news?author=${username}&auditState=0&_expand=category`,
        //     method:'GET'
        // }).then(res=>{
        //     setDataSource(res.data)
        // })
        async function fetchData(){
          const res = await graphql("Query", DRAFT, {
            newsDraftFileter: {
              author: username,
              auditState: 0
            }
          })
          setDataSource(res.getNewsDraft)
        }
        fetchData()
    },[username])

    function showConfirm(item) {
        confirm({
          title: 'Do you Want to delete these items?',
          icon: <ExclamationCircleOutlined />,
        //   content: 'Some descriptions',
          onOk() {
            deleteItem(item)
          },
        });
      }
    
    function deleteItem(item){
        //update frontend after delete

        setDataSource(dataSource.filter(data=>data._id!==item._id))

        // axios({
        //     url:`http://localhost:5000/news/${item.id}`,
        //     method:'DELETE'
        // })

        //update backend data after delete
        graphql("Mutation", DELETE, {
          newsDeleteId: item._id
        })
    }

    function handleCheck(_id){
      // axios.patch(`http://localhost:5000/news/${id}`,{
      //   auditState:1
      // }).then(res=>{
      //   props.history.push('/audit-manage/list')
      //   alert('you can check the news you uploaded in audit list now')
      // })

      graphql("Mutation", UPLOAD, {
        newsId: _id
      })
      props.history.push('/audit-manage/list')
      alert('you can check the news you uploaded in audit list now')
    }

    const columns = [
        {
          title: 'ID',
          dataIndex: '_id',
          render:(item)=>{
              return <b>{item}</b>
          }
        },
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
          render:(category)=>{
            return category.title
          }
        },

        {
            title: 'Operation',
            render:(item)=>{
              return <div>
        
                  <Button shape='circle' icon={<EditOutlined />} onClick={()=>{
                    props.history.push(`update/${item._id}`)
                  }}></Button>
                  <span style={{marginLeft:'12px'}}></span>
                  <Button danger shape='circle' icon={<DeleteOutlined />} onClick={()=>{showConfirm(item)}}></Button>
                  <span style={{marginLeft:'12px'}}></span>
                  <Button shape='circle' icon={<UploadOutlined />} onClick={()=>{handleCheck(item._id)}}></Button>                  
              </div>
          }
        },
      ];
    return (
        <div><Table dataSource={dataSource} columns={columns} pagination={{
            pageSize:4
        }}
        rowKey={item=>item._id}
        /></div>       
    )
}
