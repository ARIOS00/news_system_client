import React, { useEffect, useState } from 'react';
import { PageHeader, Button, Descriptions } from 'antd';
import axios from 'axios';
import moment from 'moment';
import graphql from '../../../util/graphqlAPI'

const PREVIEW =`
query Query($newsId: String) {
    previewNews(newsId: $newsId) {
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
        roleType
        roleName
        rights {
          checked
          halfChecked
        }
        _id
      }
      roleId
      star
      title
      view
    }
  }
`

export default function NewsPreview(props) {
    const [newsInfo,setNewsInfo]=useState('')
    useEffect(()=>{
        // axios.get(`http://localhost:5000/news/${props.match.params.id}?_expand=category&_expand=role`).then(res=>{
        //     // setNewsInfo(res.data)
        // })
        async function fetchData(id){ 
            const data = await graphql('Query', PREVIEW, {newsId: id})
            setNewsInfo(data.previewNews)
        }
        fetchData(props.match.params.id)
    },[props.match.params.id])

    const auditArr=['unreviewed','in review','passed','not passed']
    const publishArr=['unpublished','in publish','online','offline']
    const colorArr=['grey','orange','lime','red']
    return (
        <div className="site-page-header-ghost-wrapper">
            <PageHeader
                onBack={() => window.history.back()}
                title={newsInfo.title}
                subTitle={newsInfo.category?.title}
            >
            <Descriptions size="small" column={3}>
                <Descriptions.Item label="Creator">{newsInfo.author}</Descriptions.Item>
                <Descriptions.Item label="Creation Time">{moment(newsInfo.createTime).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>
                <Descriptions.Item label="Publish Time">{newsInfo.publishTime?moment(newsInfo.publishTime).format("YYYY-MM-DD HH:mm:ss"):'-'}</Descriptions.Item>
                <Descriptions.Item label="Area">{newsInfo.region}</Descriptions.Item>
                <Descriptions.Item label="Audit State"><span style={{color:colorArr[newsInfo.auditState]}}>{auditArr[newsInfo.auditState]}</span></Descriptions.Item>
                <Descriptions.Item label="Publish State"><span style={{color:colorArr[newsInfo.publishState]}}>{publishArr[newsInfo.publishState]}</span></Descriptions.Item>
                <Descriptions.Item label="Views">{newsInfo.view}</Descriptions.Item>
                <Descriptions.Item label="Stars">{newsInfo.star}</Descriptions.Item>
                <Descriptions.Item label="Comments">{0}</Descriptions.Item>
            </Descriptions>
            <div dangerouslySetInnerHTML={{
                __html:newsInfo.content
            }} className='previewContent'>
            </div>
            </PageHeader>
        </div>
    )
}
