import { Constructor, LitElement } from 'lit-element';
import { CurrentRoute, keyData, resovleWindowRoute } from './router-helper';

/**
 * 定义路由导航基础类
 */
export declare class RouterClass{
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
    data:keyData;
    callback?(route:CurrentRoute):void;
    component?:Constructor<HTMLElement>;
    children?:RouteDefine[];
    _parent?:RouteDefine;
}
export class Router{
    private patterMap=new Map<String,RouteDefine>();
    private nameMap=new Map<String,RouteDefine>();
    private routers:RouteDefine[];
    public Router( ...routers: RouteDefine[]){
        this.routers=routers;
    }
    public addRouter(d:RouteDefine){
        this.routers.push(d);
        const iteratorFun=(p:RouteDefine,sub:RouteDefine) =>{
            sub._parent=p;
            if(sub.children){
                sub.children.forEach( sub2 => iteratorFun(sub,sub2));
            }
        }  
        if(d.children){
            d.children.forEach( sub => iteratorFun(d,sub));
        } 
    }
}
const cacheRouteDefinde=new WeakMap();
export function router<TBase extends Constructor<LitElement>>(base:TBase):Constructor<RouterClass> {
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