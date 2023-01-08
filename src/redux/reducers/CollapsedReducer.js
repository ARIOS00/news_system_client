export const CollapsedReducer=(prevState={
    isCollapsed:false
},action)=>{
    let newState={...prevState}
    switch(action.type){
        case "hide-SideMenu":
            newState.isCollapsed=true
            return newState
        case "show-SideMenu":
            newState.isCollapsed=false
            return newState
        default:
            return prevState
    }  
}