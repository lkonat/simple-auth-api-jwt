"use strict";
((exports) => {
  class Page {
    constructor(args) {
      this.name = args.name;
      this.router = args.router;
    }
    setRouter(router){
      this.router = router;
    }
    setProps(props) {
      this.props = props;
    }
    show(){
      this.container = $(`<div style="width:100%; height:100%;"></div>`);
      this.view = $(`<div style="width:100%; height:100%; position:relative; "></div>`);
      this.container.append(this.view);
      this.render();
      return this.container;
    }
    refresh() {
      let loc = window.location;
      this.router.render(loc.pathname + loc.search);
    }
    render() {
      this.view = $(
        `<div style="width:100%; height:100%; position:relative; overflow:scroll; margin:0 auto;border:1px solid whitesmoke;display:table;"><h1>Default Page: ${this.name}</h1></div>`
      );
    }
  }
  class Router {
    constructor({ url, host }) {
      this.url = new URL(document.location);
      this.host = host;
      this.routes = [];
      this.errorViews = {};
      this.allRegisteredLinks = [];
      this.init();
    }
    init(){
      window.addEventListener("popstate",(state)=>{
        this.render();
      });
    }
    route() {
      let calls = arguments;
      let path = calls[0];
      if(typeof path !=="string"){
        throw new Error("require a string as first argument");
      }
      this.routes.push({
        search: path.replace(/\/:(?<id>\S\w*)/g, `/(?<$<id>>.[^\/]*)`).replace(/\//g, "\\/"),
        calls:calls,
        path: path
      });
    }
    error(number, { component }) {
      if (component instanceof Page) {
        this.errorViews[number] = component;
      } else {
        console.error("incorrect component");
      }
    }

   show(component){
     if(component instanceof Page){
       component.setProps({ url: match });
     }else{
       throw new Error("expecting a router page");
     }
   }
    showRoute({route,match},callBack){
      let calls = route.calls;
      let path = route.path;
      let search = route.search;
      const router=()=>{
        let display=(component)=>{
          if(component instanceof Page){
            component.setProps({ url: match });
            component.setRouter(this);
            let view = component.show();
            callBack(view);
          }else if(typeof component==="string"){
            this.render(component);
          }else{
            throw new Error("expecting a router page");
          }
        };
        return {
          render:(component)=>{display(component);}
        }
      };
      let controller = router();
      let idx = 0;
      const next = ()=>{
        idx++;
        if(calls[idx]){
          calls[idx](controller,()=>{
            next();
          });
        }else{
          throw new Error("no view returned");
        }
      };
      next();
    }
    findView({ pathName },callBack) {
      const isMatch = (pathName, search) => {
        let match = pathName.match(search);
        if (!match) {
          return false;
        }
        let exact = match && pathName === match[0];
        let groups = match.groups;
        return { exact, params: groups };
      };
      for (let i = 0; i < this.routes.length; i++) {
        let path = this.routes[i].path;
        let search = this.routes[i].search;
        let calls = this.routes[i].calls;
        let matchExact = true;
        let match = isMatch(pathName, search);
        if (matchExact && match && match.exact) {
          return this.showRoute({route:this.routes[i],match},callBack);
        } else if (!matchExact && match) {
          return this.showRoute({route:this.routes[i],match},callBack);
        }
      }
      callBack(false);
    }

    updateLocation(newLocation) {
      window.history.pushState({}, null, `${newLocation}`);
    }
    render(withPath) {
      this.host.empty();
      const pathName = withPath? withPath.split("?")[0]: new URL(document.location).pathname;
      this.updateLocation(withPath ? withPath : new URL(document.location).href);
      this.findView({ pathName: pathName },(view)=>{
        if(view){
          return this.host.append(view);
        }
        if (this.errorViews[404]) {
          let view404 = this.errorViews[404].render({ url: false });
          return this.host.append(view404);
        }
        if (this.errorViews[500]) {
          let view500 = this.errorViews[500].render({ url: false });
          return this.host.append(view500);
        }
        throw new Error("no page to display")
        return false;
      });
    }
  }
  const SELF = {
    Router:Router,
    Page:Page
  };
  exports.Router = SELF.Router;
  exports.Page= SELF.Page;
})(typeof exports === "undefined" ? (this.Navigation = {}) : exports);
