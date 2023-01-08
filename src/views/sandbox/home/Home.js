import React, { useEffect, useRef, useState } from 'react'
import {Row,Col,Card,List,Avatar,Drawer} from 'antd'
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import * as Echarts from 'echarts'
import _ from 'lodash'
import axios from 'axios';
import graphql from '../../../util/graphqlAPI'

const NEWSLIST =`
query Query($num: Int, $sortBy: String) {
  newsList(num: $num, sortBy: $sortBy) {
    _id
    category {
      _id
      title
      value
    }
    categoryId
    createTime
    publishState
    publishTime
    region
    roleId
    star
    title
    view
  }
}
`
const BAR = `
query GetNews {
  getNews {
    _id
    author
    category {
      _id
      title
      value
    }
    categoryId
  }
}`

const {Meta}=Card

export default function Home() {
  const [viewList,setViewList]=useState([])
  const [starList,setStarList]=useState([])
  const [allList,setAllList]=useState([])
  const [visible,setVisible]=useState(false)
  const [pieChart,setPieChart]=useState(null)
  const {username,region,role:{roleName}}=JSON.parse(localStorage.getItem('token'))
  const barRef=useRef()
  const pieRef=useRef()

  useEffect(()=>{
    // axios.get("/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=6").then(res=>{
    //   setViewList(res.data)
    // })
    async function fetchData(){
      const data = await graphql("Query", NEWSLIST, {
        num: 6,
        sortBy: "view"
      })
      setViewList(data.newsList)
    }
    fetchData()
  },[])

  useEffect(()=>{
    // axios.get("/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=6").then(res=>{
    //   setStarList(res.data)
    // })
    async function fetchData(){
      const data = await graphql("Query", NEWSLIST, {
        num: 6,
        sortBy: "star"
      })
      setStarList(data.newsList)
    }
    fetchData()
  },[])

  const renderBarView=(obj)=>{
    var myChart = Echarts.init(barRef.current);
    var option = {
      title: {
        text: 'News Category Bar'
      },
      tooltip: {},
      legend: {
        data: ['amount']
      },
      xAxis: {
        data: Object.keys(obj)
      },
      yAxis: {
        minInterval:1
      },
      series: [
        {
          name: 'amount',
          type: 'bar',
          data: Object.values(obj).map(item=>item.length)
        }
      ]
    };
    myChart.setOption(option);
  }

  const renderPieView=(obj)=>{
    var currentList=allList.filter(item=>item.author===username)
    var groupObj=_.groupBy(currentList,item=>item.category.title)
    var list=[]
    for(let i in groupObj){
      list.push({
        name:i,
        value:groupObj[i].length
      })
    }

    var myChart;
    if(!pieChart){
      myChart=Echarts.init(pieRef.current)
      setPieChart(myChart)
    }else{
      myChart=pieChart
    }
    var option;

    option = {
      title: {
        text: `Data from ${username}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Publish Amount',
          type: 'pie',
          radius: '50%',
          data: list,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    option && myChart.setOption(option);

  }

  useEffect(()=>{
    // axios.get("/news?publishState=2&_expand=category").then(res=>{
    //   // renderBarView(_.groupBy(res.data,item=>item.category.title))
    //   // setAllList(res.data)
    // })
    async function fetchData(){
      const data = await graphql("GetNews", BAR)
      renderBarView(_.groupBy(data.getNews, item => {console.log(item);return item.category.title}))
      setAllList(data.getNews)
    }
    fetchData()
  },[])
  return (
    <div>
      <div style={{ padding: '30px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card title="Most Views" bordered={true}>
              <List
                size="small"
                dataSource={viewList}
                renderItem={item => <List.Item><a href={`#/news-manage/preview/${item._id}`}>{item.title}</a></List.Item>}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Most Stars" bordered={true}>
              <List
                size="small"
                dataSource={starList}
                renderItem={item => <List.Item><a href={`#/news-manage/preview/${item._id}`}>{item.title}</a></List.Item>}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              cover={
                <img
                  alt="example"
                  src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                />
              }
              actions={[
                <SettingOutlined key="setting" onClick={()=>{
                  setVisible(true)
                  setTimeout(()=>{
                    renderPieView()
                  },0)                 
                }}/>,
                <EditOutlined key="edit" />,
                <EllipsisOutlined key="ellipsis" />,
              ]}
            >
              <Meta
                avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                title={username}
                description={
                  <div>
                    <b>{region?region:'Global'}</b>
                    <span style={{paddingLeft:'30px'}}>{roleName}</span>
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>

        <Drawer  title="Personal News Info" 
          placement="right" 
          onClose={()=>{setVisible(false)}} 
          visible={visible}
          width='500px'
        >
          <div id="main" 
            style={{width:'100%',height:'400px',marginTop:'30px'}}
            ref={pieRef}
          ></div>
        </Drawer>

        <div id="main" 
          style={{width:'100%',height:'400px',marginTop:'30px'}}
          ref={barRef}
        ></div>
      </div>
    </div>
  )
}
