import React, { useEffect, useRef, useState } from 'react'
import {Table,Tag,Button,Modal,Popover,Switch,Form,Input,Select} from 'antd'
import {DeleteOutlined,EditOutlined,ExclamationCircleOutlined} from '@ant-design/icons'
import axios from 'axios'
import UserForm from '../../../components/user-manage/UserForm'
import graphql from '../../../util/graphqlAPI'
const {confirm} = Modal
const {Option} = Select

const USERS =`
query Query {
  getUsers {
    _id
    default
    password
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
    roleState
    username
  }
}
`

const NEW_USER = `
mutation PostUser($newUserInput: newUserInput) {
  postUser(newUserInput: $newUserInput) {
    _id
    default
    password
    region
    role {
      _id
      rights {
        halfChecked
        checked
      }
      roleName
      roleType
    }
    roleId
    roleState
    username
  }
}`

const REGIONS = `
query GetRegions {
  getRegions {
    _id
    title
    value
  }
}`

const ROLES = `
query GetRoles {
  getRoles {
    _id
    rights {
      checked
      halfChecked
    }
    roleName
    roleType
  }
}
`

const DELETE_USER = `
mutation Mutation($deleteId: String) {
  deleteUser(deleteId: $deleteId) {
    username
  }
}
`

const UPDATE_USER = `
mutation Mutation($newUserInput: newUserInput) {
  updateUser(newUserInput: $newUserInput) {
    _id
    username
  }
}`

const roleMap = new Map()
roleMap.set("Senior Administrator", "639bbf0a68228e4be67ad187")
roleMap.set("Regional Administrator", "639bbf3b68228e4be67af94f")
roleMap.set("Regional Editor", "639bce6a68228e4be687c742")

export default function UserList() {
    //get basic data
    const [roleList,setroleList]=useState([])
    const [regionList,setregionList]=useState([])
    //add user
    const [dataSource,setDataSource]=useState([])
    const [isAddVisable,setisAddVisable]=useState(false)
    const addForm=useRef(null)
    //update user
    const [isUpdateVisable,setisUpdateVisable]=useState(false)
    const [isUpdateDisabled,setisUpdateDisabled]=useState(false)
    const [current,setCurrent]=useState(null)
    const updateForm=useRef(null)

    const {roleId,role,region,username}=JSON.parse(localStorage.getItem('token'))

    useEffect(()=>{
        // axios({
        //     url:'http://localhost:5000/users?_expand=role',
        //     method:'GET'
        // }).then(res=>{
        //     const list=res.data
        //     setDataSource(roleId===1?list:[
        //       ...list.filter(item=>item.username===username),
        //       ...list.filter(item=>item.region===region && item.roleId===3)
        //     ])
        // })

        async function fetchData(){
          const roleName = role.roleName
          const data = await graphql("Query", USERS)
          const list = data.getUsers
          setDataSource(role.roleName==="Senior Administrator"?list:[
            ...list.filter(item=>item.username===username),
            ...list.filter(item=>item.region===region && item.role.roleName==="Regional Editor")
          ])
        }
        fetchData()

    },[])

    useEffect(()=>{
        // axios({
        //     url:'http://localhost:5000/regions',
        //     method:'GET'
        // }).then(res=>{
        //     setregionList(res.data)
        // })
        async function fetchData(){
          const data = await graphql("GetRegions", REGIONS)
          setregionList(data.getRegions)
        }
        fetchData()
    },[])

    useEffect(()=>{
        // axios({
        //     url:'http://localhost:5000/roles',
        //     method:'GET'
        // }).then(res=>{
        //     setroleList(res.data)
        // })
        async function fetchData(){
          const data = await graphql("GetRoles", ROLES)
          setroleList(data.getRoles)
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
    
    async function deleteItem(item){
        setDataSource(dataSource.filter(data=>data._id!==item._id))
        // axios({
        //   url:`http://localhost:5000/users/${item.id}`,
        //   method:'DELETE'
        // })
        await graphql("Mutation", DELETE_USER,{
          deleteId: item._id
        })
    }

    async function addFormOk(){
      addForm.current.validateFields().then(async (value)=>{
        setisAddVisable(false)
        addForm.current.resetFields()
        // axios({
        //   url:'http://localhost:5000/users',
        //   method:'POST',
        //   data:{
        //     ...value,
        //     'roleState':true,
        //     'default':false
        //   }
        // }).then(res=>{
        //   setDataSource([{
        //     ...res.data,
        //     role:roleList.filter(item=>item.id===value.roleId)[0]
        //   },...dataSource])
        // })

        value = {
          ...value,
          roleId: roleMap.get(value.roleId)
        }

        const data = await graphql("PostUser", NEW_USER, {
          newUserInput: value
        })
        let createdUser = data.postUser

        let list = dataSource
        list.push(createdUser)
        setDataSource(list)

      }).catch(err=>{
        console.log(err)
      })
    }

    function updateFormOk(){
      updateForm.current.validateFields().then(async (value)=>{
        console.log(value)
        setisUpdateVisable(false)
        setDataSource(dataSource.map(item=>{
          if(item._id===current._id){
            return {
              ...item,
              ...value,
              role:roleList.filter(data=>data.roleName===value.roleId)[0]
            }
          }
          return item
        }))
        setisUpdateDisabled(!isUpdateDisabled)
        // axios({
        //   url:`http://localhost:5000/users/${current.id}`,
        //   method:'PATCH',
        //   data:value
        // })
        const res = await graphql("Mutation", UPDATE_USER, {
          newUserInput: {
            newUserId: current._id,
            password: value.password,
            username: value.username,
            region: value.region,
            roleId: roleMap.get(value.roleId)
          }
        })
      })
    }

    function handleChange(item){
      item.roleState=!item.roleState
      setDataSource([...dataSource])
      // axios({
      //   url:`http://localhost:5000/users/${item.id}`,
      //   method:'PATCH',
      //   data:{
      //     roleState:item.roleState
      //   }
      // })
      graphql("Mutation", UPDATE_USER,{
        newUserInput:{
          newUserId: item._id,
          roleState: item.roleState
        }
      })
    }

    function handleUpdate(item){
      
      setisUpdateVisable(true)
      setCurrent(item)
      if(item.role.roleName==="Senior Administrator"){
        setisUpdateDisabled(true)
      }
      else{
        setisUpdateDisabled(false)
      }
      setTimeout(()=>{
        console.log("id", item._id)
        updateForm.current.setFieldsValue({
          _id: item._id,
          username:item.username,
          password:item.password,
          region:item.region,
          roleId:item.role.roleName
        })
      },0)
    }
    
    const columns = [
        {
          title: 'Region',
          dataIndex: 'region',
          filters:[
            ...regionList.map(item=>{
              return(
                {
                  text:item.title,
                  value:item.value
                }
              )
            }),
            {
              text:'Global',
              value:'global'
            }
          ],
          onFilter:(value,item)=>{
            if(value==='global')
              return item.region===''
            return item.region===value
          },
          render:(item)=>{
              return <b>{item===''?'Global':item}</b>
          }
        },
        {
          title: 'Role',
          dataIndex: 'role',
          render:(item)=>{
            return item.roleName==='Senior Administrator'?<span style={{color:'red'}}>{item.roleName}</span>:item.roleName
          }
        },
        {
          title: 'Username',
          dataIndex: 'username',
          render:(item)=>{
            return <Tag color="blue">{item}</Tag>
          }
        },
        {
          title: 'User State',
          dataIndex: 'roleState',
          render:(roleState,item)=>{
            return <Switch 
              checked={roleState} 
              disabled={item.default} 
              onChange={()=>{handleChange(item)}}
              ></Switch>
          }
        },
        {
          title: 'Operation',
          render:(item)=>{
            return <div>
                  <Button shape='circle' icon={<EditOutlined />} disabled={item.default} onClick={()=>{handleUpdate(item)}}></Button>
                  <span style={{marginLeft:'12px'}}></span>
                  <Button danger shape='circle' icon={<DeleteOutlined />} onClick={()=>{showConfirm(item)}} disabled={item.default}></Button>                
            </div>
          }
        },
      ];
    return (
        <div>
          <Button onClick={()=>{setisAddVisable(true)}}>Add User</Button>
          <Table dataSource={dataSource} columns={columns} pagination={{
            pageSize:4
        }} rowKey={item=>item._id} />
          {/* add user */}
          <Modal
            visible={isAddVisable}
            title='Add User'
            okText='Confirm'
            cancelText='Cancel'
            onCancel={()=>{setisAddVisable(false)}}
            onOk={()=>{addFormOk()}}
            >
              <UserForm regionList={regionList} roleList={roleList} ref={addForm}></UserForm>
          </Modal>
          {/* update user */}
          <Modal
            visible={isUpdateVisable}
            title='Update User'
            okText='Confirm'
            cancelText='Cancel'
            onCancel={()=>{
              setisUpdateVisable(false)
              setisUpdateDisabled(!isUpdateDisabled)
            }}
            onOk={()=>{updateFormOk()}}
            >
              <UserForm 
                regionList={regionList} 
                roleList={roleList} ref={updateForm} 
                isUpdateDisabled={isUpdateDisabled}
                isUpdate={true}
              ></UserForm>
          </Modal>
        </div>       
    )
}
