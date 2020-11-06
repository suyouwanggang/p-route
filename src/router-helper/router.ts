import { Constructor, LitElement } from 'lit-element';
import { CurrentRoute, keyData, resovleWindowRoute, testRoute } from './router-helper';

/**
 * 定义路由导航基础类
 */
export declare class RouterComponent{
    /**
     * 定义路由规则
     */
   static routers:RouteDefine[];
    /**
     * 处理路由导航
     * @param route 
     */
     router(route:CurrentRoute):void;
}
type ListenerResult = {
    destory: () => void;
};
/**
 * @returns 返回一个对象，可以删除监听
 * @param el DOM对象
 * @param event 事件类型
 * @param listener 监听
 * @param options 事件监听options
 */
const addEvent = (el: Window|HTMLDocument| Element | SVGAElement, event: string, listener: EventListener, options?: boolean | AddEventListenerOptions): ListenerResult => {
    el.addEventListener(event, listener, options);
    return {
        destory: () => {
            el.removeEventListener(event, listener, options);
        }
    };
};
export type RouteDefine={
    name?:string;
    pattern:string;
    component?:Constructor<HTMLElement>|Promise<Constructor<HTMLElement>>;
    children?:RouteDefine[];
    _parent?:RouteDefine;
}
export class Router{
    private patterMap=new Map<String,RouteDefine>();
    private routers:RouteDefine[];
    constructor(routers: RouteDefine[]){
        this.routers=routers;
        routers.forEach((item) => this.addRouter(item));
    }
    private addRouter(d:RouteDefine){
        this.routers.push(d);
        const iteratorFun=(parent:RouteDefine,sub:RouteDefine) =>{
            sub._parent=parent;
            if(sub.children){
                sub.children.forEach(sub2 => iteratorFun(sub,sub2));
            }else{
                this.cacheRouterPath(sub);
            }
        }  
        if(d.children){
            d.children.forEach(sub => iteratorFun(d,sub));
        }else{
            this.cacheRouterPath(d);
        }
        if(d.pattern=='*'){
            this.default=d;
        }
        if(d.name=='not-found'){
            this.notFound=d;
        }
    }
     default:RouteDefine;
     notFound:RouteDefine;
     private pathCache=new Map<string,RouteDefine>();

    private cacheRouterPath(d:RouteDefine){
        const router=d;
        let path=d.pattern;
        const pathArray:string[]=[];
        if(path){
            pathArray.splice(0,0,path);
        }
        while(d._parent){
            d=d._parent;
            if(d.pattern){
                pathArray.splice(0,0,d.pattern);
            }
        }
        this.pathCache.set(pathArray.join(''),router);
    }

    public matchRouter(path:string):RouteDefine[]|null{
        let found:RouteDefine=null;
        for(let [pattern, route] of this.pathCache){
            //console.log(pattern,route);
            if(testRoute(pattern,path)){
                found=route;
                break ;
            }
        }
        if(found){  
            const result:RouteDefine[]=[];
            result.push(found);
            while(found._parent){
                found=found._parent;
                result.splice(0,0,found);
            }
            return result;
        }
        return null;
    }
    
}

const cacheRouteDefinde=new WeakMap();
export function router<TBase extends Constructor<LitElement>>(base:TBase):Constructor<RouterComponent> {
    return class extends base{
       private _finalizied=false;
       static  routers:Router;

        static get properties(){
            return {
                contextPath:{
                    type:String
                },
                route:{
                    type:String, reflect:true,attribute:'route'
                },
                canceled:{
                    type:Boolean
                }
            }
        }
        route:'';
        canceled:false;
        router(route:CurrentRoute){

        }
        protected routing(){
            const currentRote=resovleWindowRoute();
            const uri=decodeURI(window.location.pathname);
            this.router(currentRote);
        }
        __routeHandler:ListenerResult;
        __routePastHandler:ListenerResult;
        connectedCallback(){
            super.connectedCallback();
            if(this._finalizied){


            }

            this.__routeHandler=addEvent(window,'route',()=>{
                this.routing();
            })
            this.__routePastHandler=addEvent(window,'popstate',()=>{
               window.dispatchEvent(new CustomEvent('route'));
            });
            this.routing();
        }
        disconnectedCallback(){
            super.disconnectedCallback();
            this.__routeHandler.destory();
            this.__routePastHandler.destory();
        }
    };
}