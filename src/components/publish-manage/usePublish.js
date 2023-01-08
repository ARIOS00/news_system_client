import {useEffect,useState} from 'react'
import axios from 'axios'
import graphql from '../../util/graphqlAPI'

const NEWS = `
query GetNewsByAuthorAndSate($input: newsFilter) {
  getNewsByAuthorAndSate(input: $input) {
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
    _id
    publishState
    region
    publishTime
    roleId
    star
    title
    view
  }
}
`

const SUNSET =`
mutation Mutation($newsSunsetId: ID) {
    newsSunset(id: $newsSunsetId) {
      title
      author
      publishState
    }
  }
`

const DELETE = `
mutation Mutation($newsDeleteId: String) {
    newsDelete(newsDeleteId: $newsDeleteId) {
      _id
      auditState
      author
    }
  }`

const PUBLISH = `
mutation NewsPublish($newsPublishId: String) {
    newsPublish(newsPublishId: $newsPublishId) {
      _id
      auditState
      publishTime
      publishState
      title
    }
  }
`

export default function usePublish(type){
    const {username}=JSON.parse(localStorage.getItem('token'))
    const [dataSource,setDataSource]=useState([])
    useEffect(()=>{
    //   axios(`http://localhost:5000/news?author=${username}&publishState=${type}&_expand=category`).then(res=>{
    //     setDataSource(res.data)
    //   })
        async function fetchData(){
            const data = await graphql("GetNewsByAuthorAndSate", NEWS, {
                input: {
                    author: username,
                    publishState: type
                }
            })
            setDataSource(data.getNewsByAuthorAndSate)
        }
        fetchData()
    },[username,type])

    async function handlePublish(id){
        // setDataSource(dataSource.filter(item=>item.id!==id))
        const res = await graphql("NewsPublish", PUBLISH, {
            newsPublishId: id
        })
        alert("news is published successfully!")
    }

    async function handleSunset(id){
        setDataSource(dataSource.filter(item=>item.id!==id))
        // axios.patch(`http://localhost:5000/news/${id}`,{
        //     'publishState':3,
        // }).then(res=>{
        //     alert("news sunsets successfully!")
        // })
        const res = await graphql("Mutation", SUNSET, {
            newsSunsetId: id
        })
        if(res)
            alert("news sunsets successfully!")
    }

    async function handleDelete(id){
        setDataSource(dataSource.filter(item=>item.id!==id))
        // axios.delete(`http://localhost:5000/news/${id}`).then(res=>{
        //     alert("news delete successfully!")
        // })

        const res = await graphql("Mutation", DELETE, {
            newsDeleteId: id
        })
        if(res)
            alert("news delete successfully!")
    }
    return {
        dataSource,
        handlePublish,
        handleSunset,
        handleDelete
    }
}