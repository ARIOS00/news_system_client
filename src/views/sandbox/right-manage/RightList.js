import React, { useEffect, useState } from 'react'
import {Table,Tag,Button,Modal,Popover,Switch} from 'antd'
import {DeleteOutlined,EditOutlined,ExclamationCircleOutlined} from '@ant-design/icons'
import axios from 'axios'
import graphql  from '../../../util/graphqlAPI'
const {confirm} = Modal

const RIGHTS = `
query GetRights {
  getRights {
    _id
    children {
      _id
      grade
      key
      pagepermission
      rightId
      title
    }
    grade
    key
    pagepermission
    title
  }
}`

const DELETE_RIGHT = `
mutation Mutation($rightId: String) {
  deleteRight(rightId: $rightId) {
    _id
  }
}`

const DELETE_CHILDREN = `
mutation Mutation($childrenId: String) {
  deleteChildren(childrenId: $childrenId) {
    _id
  }
}`

const RIGHT_SWITCH = `
mutation Mutation($rightId: String, $pagepermission: Boolean) {
  editableRight(rightId: $rightId, pagepermission: $pagepermission) {
    _id
    pagepermission
  }
}`

const CHILDREN_SWITCH = `
mutation EditableChildren($childrenId: String, $pagepermission: Boolean) {
  editableChildren(childrenId: $childrenId, pagepermission: $pagepermission) {
    _id
    pagepermission
  }
}`



export default function RightList() {
    const [dataSource,setDataSource]=useState([])

    useEffect(()=>{
        // axios({
        //     url:'http://localhost:5000/rights?_embed=children',
        //     method:'GET'
        // }).then(res=>{
        //     res.data.forEach((item)=>{if(item.children?.length===0)item.children=null})
        //     console.log("res", res.data)
        //     setDataSource(res.data)
        // })
        async function fetchData(){
          let data = await graphql("GetRights", RIGHTS)
          let list = data.getRights
          list.forEach((item)=>{if(item.children?.length===0)item.children=null})
          setDataSource(list)
        }
        fetchData()
    },[])

    function showConfirm(item) {
        confirm({
          title: 'Do you Want to delete these items?',
          icon: <ExclamationCircleOutlined />,
        //   content: 'Some descriptions',
          onOk() {
            deleteItem(item)
          },
        //   onCancel() {
        //     console.log('Cancel');
        //   },
        });
      }
    
    function deleteItem(item){
        //update frontend after delete
        let path
        if(item.grade===1){
            setDataSource(dataSource.filter(data=>data._id!==item._id))
            graphql("Mutation", DELETE_RIGHT, {
              rightId: item._id
            })
        }
        else{
            let list=dataSource.filter(data=>data._id===item.rightId)
            list[0].children=list[0].children.filter(data=>data._id!==item._id)
            setDataSource([...dataSource])
            graphql("Mutation", DELETE_CHILDREN, {
              childrenId: item.rightId
            })

        }
        // axios({
        //     url:`http://localhost:5000/${path}/${item.id}`,
        //     method:'DELETE'
        // })
        //update backend data after delete
    }

    function switchMethod(item){
        item.pagepermission=!item.pagepermission
        setDataSource([...dataSource])
        if(item.grade===1){
          // path='rights'
          graphql("Mutation", RIGHT_SWITCH, {
            rightId: item._id,
            pagepermission: item.pagepermission
          })
        }         
        else{
          graphql("EditableChildren", CHILDREN_SWITCH, {
            childrenId: item._id,
            pagepermission: item.pagepermission
          })
        }
        // axios({
        //     url:`http://localhost:5000/${path}/${item.id}`,
        //     method:'PATCH',
        //     data:{
        //         pagepermission:item.pagepermission
        //     }
        // })
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
          title: 'Rights',
          dataIndex: 'title',
        },
        {
          title: 'Right Path',
          dataIndex: 'key',
          render:(item)=>{
            return <Tag color="blue">{item}</Tag>
          }
        },
        {
            title: 'Operation',
            render:(item)=>{
              return <div>
                  <Popover content={
                    <div style={{textAlign:'center'}}>
                        <Switch 
                            checked={item.pagepermission} 
                            onChange={()=>{switchMethod(item)}}>
                        </Switch>
                    </div>} title='Editable' trigger={
                        item.pagepermission===undefined?'':'click'}>
                    <Button shape='circle' icon={<EditOutlined />} disabled={item.pagepermission===undefined}></Button>
                  </Popover>
                  <span style={{marginLeft:'12px'}}></span>
                  <Button danger shape='circle' icon={<DeleteOutlined />} onClick={()=>{showConfirm(item)}}></Button>                
              </div>
          }
        },
      ];
    return (
        <div><Table dataSource={dataSource} columns={columns} pagination={{
            pageSize:4
        }}/></div>       
    )
}
