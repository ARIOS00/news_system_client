import React, { useEffect, useRef, useState } from 'react'
import {Button, PageHeader,Steps,Form,Input,Select, message} from 'antd'
import axios from 'axios'
import './NewsAdd.css'
import NewsEditor from '../../../components/news-manage/NewsEditor'
import graphql from '../../../util/graphqlAPI'
const {Step}=Steps
const {Option}=Select

const CATEGORIES = `
query Query {
  getCategories {
    _id
    title
  title
    value
  }
}`

const UPDATE_NEWS = `
mutation Mutation($newsId: String, $newsCreateInput: newsCreateInput) {
  newsUpdate(newsId: $newsId, newsCreateInput: $newsCreateInput) {
    _id
    author
    title
    auditState
  }
}`

const GET_NEWS = `
query Query($newsId: String) {
  getNewsById(newsId: $newsId) {
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
    publishTime
    region
    role {
      _id
      rights {
        checked
        halfChecked
      }
      roleName
      roleType
    }
    roleId
    star
    title
    view
  }
}`



export default function NewsUpdate(props) {
  const [currentNum,setCurrentNum]=useState(0)
  const [categoryList,setCategoryLlist]=useState([])
  const [content,setContent]=useState('')
  const [formInfo,setFormInfo]=useState('')
  const [cateId, setCateId]=useState('')
  const [cate, setCate]=useState('')
  const NewsForm=useRef(null)

  const User=JSON.parse(localStorage.getItem('token'))

  function handleNext(){
    switch(currentNum){
      case 0:
        NewsForm.current.validateFields().then(res=>{
          setFormInfo(res)
          setCurrentNum(currentNum+1)
        })
        break
      case 1:
        if(content!=='' && content.trim()!=='<p></p>'){
          setCurrentNum(currentNum+1)
        }else{
          message.error('content can not be empty!')
        }
        break
      default: 
        console.log(formInfo,content)       
    }  
  }

  function handlePrev(){
    setCurrentNum(currentNum-1)
  }

  async function handleSave(auditState){
    // axios.patch(`http://localhost:5000/news/${props.match.params.id}`,{
    //     ...formInfo,
    //     'content':content,
    //     'auditState':auditState,
    //   }
    // ).then(res=>{
    //   props.history.push(auditState===0?'/news-manage/draft':'/audit-manage/list')
    // })
    const data = await graphql("Mutation", UPDATE_NEWS, {
      newsId: props.match.params.id,
      newsCreateInput: {
        ...formInfo,
        categoryId: formInfo.categoryId === cate ? cateId : formInfo.categoryId,
        content: content,
        auditState: auditState,
      }
    })
    props.history.push(auditState===0?'/news-manage/draft':'/audit-manage/list')
  }

  useEffect(()=>{
    // axios.get('http://localhost:5000/categories').then(res=>{
    //   setCategoryLlist(res.data)
    // })
    async function fetchData(){
      const res = await graphql("Query", CATEGORIES)
      setCategoryLlist(res.getCategories)
    }
    fetchData()
  },[])

  useEffect(()=>{
    // axios.get(`http://localhost:5000/news/${props.match.params.id}?_expand=category&_expand=role`).then(res=>{
    //     let {title,categoryId,content}=res.data
    //     NewsForm.current.setFieldsValue({
    //         title,
    //         categoryId
    //     })
    //     setContent(content)
    // })

    async function fetchData(){
      const res = await graphql("Query", GET_NEWS, {
        newsId: props.match.params.id
      })
      const {title, content} = res.getNewsById
      NewsForm.current.setFieldsValue({
          title,
          categoryId: res.getNewsById.category.title
      })
      setCateId(res.getNewsById.categoryId)
      setCate(res.getNewsById.category.title)
      setContent(content)
    }
    fetchData()
  },[props.match.params.id])

  return (
    <div style={{height:'100%'}}>
        <div className='title'>Update your News</div>
        <div className='steps'>
            <Steps current={currentNum}>
                <Step title="Basic Info" description="title & category" />
                <Step title="Content" description="content of news" />
                <Step title="Submission" description="save draft or submit" />
            </Steps>
        </div>
        

        <div className='editArea'>
            <div style={{display:currentNum===0?'block':'none'}}>
                <Form
                    name='NewsAdd'
                    className='login-form'
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
                    ref={NewsForm}
                >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: 'Please input your title!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name="categoryId"
                    rules={[{ required: true, message: 'Please input your category!' }]}
                >
                    <Select>
                    {
                        categoryList.map(item=>{
                        return(
                            <Option value={item._id} key={item._id}>{item.title}</Option>
                        )
                        })
                    }
                    </Select>
                </Form.Item>
                </Form>
            </div>

            <div style={{display:currentNum===1?'block':'none'}}>
                <NewsEditor getContent={(value)=>{
                setContent(value)
                }} content={content}></NewsEditor>
            </div>

            <div style={{display:currentNum===2?'block':'none'}}>
                3
            </div>
        </div>
        <div className='newsbuttonContainer'>
            {
                currentNum<2?<Button type="primary" onClick={handleNext} className="button">Next</Button>:
                <span>
                <Button type="primary" className="button" onClick={()=>{handleSave(0)}}>Save</Button>
                <Button type="danger" className="button" onClick={()=>{handleSave(1)}}>Submit</Button>
                </span>
            }
            {
                currentNum>0 && <Button onClick={handlePrev} className="button">Prev</Button>
            }
        </div>
    </div>
  )
}
