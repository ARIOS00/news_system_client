import React, { forwardRef, useEffect, useState } from 'react'
import {Form,Input,Select} from 'antd'
const {Option} = Select

const UserForm=forwardRef((props,ref)=>{
    const [isDisabled,setisDisabled]=useState(false)
    const {role,roleId,region}=JSON.parse(localStorage.getItem('token'))

    function checkRegionDisabled(item){
        //update userinfo
        if(props.isUpdate){
            if(role.roleName==="Senior Administrator"){
                return false
            }
            else{
                return true
            }
        }
        //add new userinfo
        else{
            if(role.roleName==="Senior Administrator"){
                return false
            }
            else{
                return item.value!==region
            }
        }
    }

    function checkRoleDisabled(item){
        if(props.isUpdate){
            if(role.roleName==="Senior Administrator"){
                return false
            }
            else{
                return true
            }
        }
        else{
            if(role.roleName==="Senior Administrator"){
                return false
            }
            else{
                return item.roleName!== "Regional Editor"
            }
        }
    }

    useEffect(()=>{
        setisDisabled(props.isUpdateDisabled)
    },[props.isUpdateDisabled])

    return (
        <Form
            ref={ref}
            layout='vertical'
        >
            <Form.Item
                name='username'
                label='Username'
                rules={[{
                    required:true,
                    message:'cannot be empty!'
                }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name='password'
                label='Password'
                rules={[{
                    required:true,
                    message:'cannot be empty!'
                }]}
            >
                <Input />
            </Form.Item>  

            <Form.Item
                name='region'
                label='Region'
                rules={isDisabled?[]:[{
                    required:true,
                    message:'cannot be empty!'
                }]}
            >
                <Select disabled={isDisabled}>
                    {
                        props.regionList.map(item=>
                            <Option 
                                value={item.value} 
                                key={item._id}
                                disabled={checkRegionDisabled(item)}
                            >{item.value}</Option>
                        )
                    }
                </Select>
            </Form.Item>  

            <Form.Item
                name='roleId'
                label='Role'
                rules={[{
                    required:true,
                    message:'cannot be empty!'
                }]}
            >
                <Select onChange={(value)=>{
                    console.log("!!", value)
                    if(value===1){
                        setisDisabled(true)
                        ref.current.setFieldsValue({
                            region:''
                        })
                    }
                    else{
                        setisDisabled(false)
                    }
                }}>
                    {
                        props.roleList.map(item=>
                            <Option 
                                value={item.roleName} 
                                key={item._id}
                                disabled={checkRoleDisabled(item)}
                            >{item.roleName}</Option>
                        )
                    }
                </Select>
            </Form.Item>  
        </Form>
    )
})

export default UserForm