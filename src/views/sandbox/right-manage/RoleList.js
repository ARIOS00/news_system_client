import React, { useEffect, useState } from 'react'
import {Table,Button,Modal,Tree} from 'antd'
import {DeleteOutlined,EditOutlined,ExclamationCircleOutlined} from '@ant-design/icons'
import axios from 'axios'
import graphql from '../../../util/graphqlAPI'
const {confirm} = Modal

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
  }`

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
  }
`

const ROLE_RIGHTS = `
mutation Mutation($roleInput: roleInput) {
    updateRoleRights(roleInput: $roleInput) {
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

const DELETE_ROLE = `
mutation Mutation($roleId: String) {
    deleteRoleById(roleId: $roleId) {
      _id
      roleName
    }
  }`

export default function RoleList() {
    const [dataSource,setDataSource]=useState([])
    const [rightList,setRightList]=useState([])
    const [isModal,setIsModal]=useState(false)

    const [currentRights,setCurrentRights]=useState([])
    const [currentID,setCurrentID]=useState(0)
    const columns=[
        {
            title:'ID',
            dataIndex:'_id',
            render:(id)=>{
                return <b>{id}</b>
            }
        },
        {
            title:'Role',
            dataIndex:'roleName',
        },
        {
            title: 'Operation',
            render:(item)=>{
              return <div>
                    <Button shape='circle' icon={<EditOutlined />} onClick={()=>{
                        setIsModal(true)
                        setCurrentRights(item.rights)
                        setCurrentID(item._id)
                    }
                    }></Button>
                    <span style={{marginLeft:'12px'}}></span>
                  <Button danger shape='circle' icon={<DeleteOutlined />} onClick={()=>{showConfirm(item)}}></Button>                
              </div>
            }
        }
    ]

    function showConfirm(item) {
        confirm({
          title: 'Do you Want to delete these items?',
          icon: <ExclamationCircleOutlined />,
          onOk() {
            deleteItem(item)
          },
        });
    }

    function deleteItem(item){
        setDataSource(dataSource.filter(data=>data.id!==item.id))
        // axios({
        //     url:`http://localhost:5000/roles/${item.id}`,
        //     method:'DELETE'
        // })
        graphql("Mutation", DELETE_ROLE, {
            roleId: item._id
        })
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    async function handleOk(){
        setIsModal(false)
        setDataSource(dataSource.map(item=>{
            if(item._id===currentID){
                return{
                    ...item,
                    rights:currentRights
                }
            }
            return item
        }))
        // axios({
        //     url:`http://localhost:5000/roles/${currentID}`,
        //     method:'PATCH',
        //     data:{
        //         rights:currentRights
        //     }
        // })        
        await graphql("Mutation", ROLE_RIGHTS, {
            roleInput: {
                roleId: currentID,
                rights: {
                    checked: currentRights.checked,
                    halfChecked: currentRights.halfChecked
                }
            }
        })
    }

    function handleCancel(){
        setIsModal(false)
    }

    function onCheck(checkKeys){
        setCurrentRights(checkKeys)
    }
    

    useEffect(()=>{
        // axios({
        //     url:'http://localhost:5000/roles',
        //     method:'GET'
        // }).then(res=>{
        //     setDataSource(res.data)
        //     console.log("res", res.data)
        // })

        async function fetchData(){
            const data = await graphql('GetRoles', ROLES)
            setDataSource(data.getRoles)
        }
        fetchData()

    },[])

    useEffect(()=>{
        // axios({
        //     url:'http://localhost:5000/rights?_embed=children',
        //     method:'GET'
        // }).then(res=>{
        //     setRightList(res.data)
        // })
        // 
        async function fetchData(){
            const data = await graphql('GetRights', RIGHTS)
            setRightList(data.getRights)
        }
        fetchData()
    },[])

    return (
        <div>
            <Table dataSource={dataSource} columns={columns} rowKey={item=>{return item._id}}></Table>
            <Modal title='Right Distribution' visible={isModal} onOk={handleOk} onCancel={handleCancel}>
                <Tree 
                    checkable 
                    checkStrictly={true}
                    checkedKeys={currentRights} 
                    treeData={rightList}
                    onCheck={onCheck}
                ></Tree>
            </Modal>
        </div>
    )
}
