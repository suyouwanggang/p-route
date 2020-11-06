 /**
  * 去掉最后的 "/"
  * @param str 
  */
 function stripExtraTrailingSlash(str:string) {
    while (str.length !== 1 && str.substr(-1) === '/') {
        str = str.substr(0, str.length - 1);
    }
    return str;
}

/**
 * 将  参数字符串变为json 
 * 例如：?name=test&password=ajsdsdf ,返回 {name:'test', password:'ajsdsdf'}
 * @param querystring  
 */
 function parseQuery(querystring:string) {
    if(!querystring ){
        return {};
    }
    if(!querystring.startsWith('?')){
        querystring='?'+querystring;
    }
        
    return JSON.parse('{"' + querystring.substring(1).replace(/&/g, '","').replace(/=/g, '":"') + '"}') as keyData ;
}
export type keyData={
    [key:string]:string;
}
/**
 * 获取匹配路由的动态绑定的参数 
 * 例如<hr/>
 * pattern: '/user/:id/detail/:view' ,uri:'/user/1121/detail/useInfo'  则返回：{id:'1121',view:'useInfo'}
 * @param pattern 路由pattern
 * @param uri  路径
 */
 function parseParams(pattern:string, uri:string) {
    let params:keyData = {}
    const patternArray = pattern.split('/').filter((path) => { return path != '' })
    const uriArray = uri.split('/').filter((path) => { return path != '' })
    patternArray.map((pattern, i) => {
        if (/^:/.test(pattern)) {
            params[pattern.substring(1)] = uriArray[i];
        }
    })
    return params
}
/**
 * 将数据转化为 queryString
 * {a:'1',b:'2','cs':'王刚'} ==> a=1&b=2&cs=%E7%8E%8B%E5%88%9A
 * @param data 
 */
function toQueryString(data:keyData){
    const array:string[]=[];
    for(let key in data){
        array.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
    }
    return array.join('&');
}
const STR='([\\w\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff-]+)';
const STR2='([\\w\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff-]*)';
const cacheRxp=new Map<string,RegExp>();
 function patternToRegExp(pattern:string) {
     if(cacheRxp.has(pattern)){
         return cacheRxp.get(pattern);
     }
     let exp:RegExp;
    if (pattern) {
        exp= new RegExp('^(|/)' + pattern.replace(/:[^\s/]+/g, STR).replace('*',STR2) + '(|/)$');
    } else {
        exp= new RegExp('(^$|^/$)');
    }
    cacheRxp.set(pattern,exp);
    return exp;
}
/**
 * 判断路由是否匹配 
 *  pattern:'/user/:id' uri: '/user/1000' ,  匹配
 *  pattern: '/user/:id/:home' ,pattern:'/user/100/100'  匹配
 *  
 * @param uri 
 * @param pattern 
 */
 function testRoute(pattern:string,uri:string) {
     pattern=stripExtraTrailingSlash(pattern);
     uri=stripExtraTrailingSlash(uri);
    if (patternToRegExp(pattern).test(uri)) {
        return true;
    }
    return false;
}

export type CurrentRoute={
   readonly uri:string;
   readonly searchString:string;
   readonly param:keyData;
}
/**
 * 获取当前 window 的 uri,serchString,param
 * 
 */
function resovleWindowRoute():CurrentRoute{
  const uri=decodeURI(window.location.pathname);
  const queryString=decodeURI(window.location.search);
  return {
    uri:uri,
    searchString:queryString,
    param:parseQuery(queryString)
  }
}
export {stripExtraTrailingSlash,parseQuery, toQueryString, parseParams,testRoute,resovleWindowRoute};