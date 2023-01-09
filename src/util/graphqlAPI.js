import axios from 'axios'

export default function graphql(operationName, query, variables){
    return axios.post(`http://52.14.200.96:4000/graphql`,{
    operationName: operationName,
    query: query,
    variables: variables
    }).then(res=>{
        return res.data.data
    })
}