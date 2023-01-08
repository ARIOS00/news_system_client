import axios from 'axios'

export default function graphql(operationName, query, variables){
    return axios.post(`http://localhost:4000/graphql`,{
    operationName: operationName,
    query: query,
    variables: variables
    }).then(res=>{
        return res.data.data
    })
}