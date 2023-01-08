import React, { useEffect, useState } from 'react'
import {Table,Tag,Button,Modal,Popover,Switch} from 'antd'
import axios from 'axios'
const {confirm} = Modal

export default function NewsPublish(props) {

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
            return <Tag color="blue">{item.title}</Tag>
          }
        },
        {
            title: 'Operation',
            render:(item)=>{
                return <div>
                  {props.button(item._id)}           
              </div>
          }
        },
      ];
    return (
        <div><Table dataSource={props.dataSource} columns={columns} pagination={{
            pageSize:5
        }}
        rowKey={item=>item._id}
        /></div>       
    )
}
