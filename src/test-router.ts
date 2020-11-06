import { RouteDefine, Router } from "./router-helper/router";

var list2:Array<RouteDefine>=[
    {pattern:'*',name:'not-found'},
    {pattern:'/home',name:'home',children:[
        {pattern:'',name:'home-default'},
        {pattern:'/index',name:'home-index'},
        {pattern:'/info',name:'home-info'},
        {pattern:'/user',name:'home-user',children:[
            {pattern:'/:id',name:'home-user-id-main',children:[
                {pattern:'/property',name:'home-user-id-property'},
                {pattern:'/work',name:'home-user-id-work'},
            ]},
        ]}
    ]},
];

var router2=new Router(list2);

