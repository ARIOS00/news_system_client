import React, { useEffect, useState } from 'react'
import {Form,Input,Button,message} from 'antd'
import './Login.css'
import axios from 'axios'
import {
    UserOutlined,
    LockOutlined
} from '@ant-design/icons';

import { useLazyQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const LOGIN = gql`
    query Login($userInput: UserInput) {
  login(userInput: $userInput) {
    status
    msg
    res {
      _id
      default
      username
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
    }
  }
}
`

export default function Login(props) {
    const [deg,setDeg]=useState(135)

    function onFinish(values){
        // axios({
        //     url:`http://localhost:5000/users?username=${values.username}&password=${values.password}&roleState=true&_expand=role`,
        //     method:'GET'
        // }).then(res=>{
        //     if(res.data.length===0){
        //         message.error('username or password is incorrect!')
        //     }
        //     else{
        //         console.log(res.data[0])
        //         localStorage.setItem('token',JSON.stringify(res.data[0]))
        //         props.history.push('/')
        //     }
        // })


        // await setUsername(values.username)
        // await setPassword(values.password)

        login({
            variables: {
                userInput: {
                    username: values.username,
                    password: values.password
                }       
            }
        })
        
    }

    const [login, { data }] = useLazyQuery(LOGIN)

    useEffect(()=>{
        if(!data)
            return

        const {status, msg, res} = data.login
        
        if(status === "FAILED"){
            message.error(msg)
        }else if(status === "SUCCESS"){
            localStorage.setItem('token', JSON.stringify(res))
            
            let o = JSON.parse(localStorage.getItem('token'))
            console.log(o)
            props.history.push('/')
        }
    }, [data])

    return (
        <div className='loginBg' style={{background: `linear-gradient(${deg}deg,rgb(3, 25, 125),rgb(0, 7, 33))`}}> 
            <div className='loginModal'>
                <div className='loginTitle'>News Manager</div>
                <Form
                    name='normal_login'
                    className='login-form'
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder='username'/>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder='password'/>
                    </Form.Item>


                    <Form.Item className='buttonContainer'>
                        <Button type="primary" htmlType="submit">
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
  )
}
