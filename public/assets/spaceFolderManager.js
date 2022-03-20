((exports)=>{
  class SpaceItems {
    constructor({host,data}) {
      this.data = data;
      this.cEvents = {};
      this.host = host;
      this.childs =false;
      this.init();
    }
    init(){
      if(this.host){
        this.container = $(`<div style="display:grid; grid-template-rows:auto; grid-template-columns:max-content max-content auto; grid-row-gap:3px;"></div>`);
        this.childContainer = $(`<div style="display:none; padding-left:30px;"></div>`);
        this.host?.append(this.container,this.childContainer);
        this.render();
      }
    }
    setHost(host){
      this.host = host;
      this.init();
    }
    addChild({itemId,spaceItem}){
      this.childContainer.show();
      if(!this.childs){
        this.childs = {};
      }
      if(!this.childs[itemId]){
        this.childs[itemId] = spaceItem;
        this.childs[itemId].setHost(this.childContainer);
        return true;
      }
      return false;
    }
    on(ev,call){
      this.cEvents[ev]= call;
    }
    fireEvent(ev,args){
      if(this.cEvents[ev]){
        this.cEvents[ev](args);
      }
    }
    render(){
      //
    }
  }
  class SpaceFolder extends SpaceItems{
    constructor({host,data}) {
      super({host,data});
    }
    render(){
      this.container.empty();
      let arraowView = $(`<div></div>`);
      let iconView = $(`<div><i class="fa fa-folder" aria-hidden="true"></i></div>`);
      let nameView = $(`<div style="cursor:pointer;">${this.data?.item_name}</div>`);
      this.container.append(arraowView,iconView,nameView);
      nameView.click((e)=>{
        e.stopPropagation();
        if(this.childs){
          this.childContainer.toggle();
        }else{
          this.fireEvent(`select`,this.data);
        }
      });
    }
  }
  class FlashCard extends SpaceItems{
    constructor({host,data}) {
       super({host,data});
    }
    render(){
      this.container.empty();
      let arraowView = $(`<div></div>`);
      let iconView = $(`<div></div>`);
      let nameView = $(`<div style="cursor:pointer; color:grey;">${this.data?.item_name}</div>`);
      nameView.click((e)=>{
        e.stopPropagation();
        this.fireEvent(`select`,this.data);
      });
      this.container.append(arraowView,iconView,nameView);
    }
  }

  class SpaceFolderManager {
    constructor({host}) {
      this.host = host;
      this.container = $(`<div style="width:100%; height:100%;"></div>`);
      this.host.append(this.container);
      this.items = {};
      this.cEvents = {};
    }
    on(ev,call){
      this.cEvents[ev]= call;
    }
    fireEvent(ev,args){
      if(this.cEvents[ev]){
        this.cEvents[ev](args);
      }
    }
    addItem({parentId,item}){
      let host = this.container;
      let parent = false;
      if(parentId){
        if(!this.items[parentId]){
          throw new Error("parent missing");
          return false;
        }
        parent = this.items[parentId];
      }
      let parentFolder = parentId?this.items[parentId]:false;
      if(item.item_type==="folder"){
        if(parent){
          this.items[item.item_id] = new SpaceFolder({data:item});
          parent.addChild({itemId:item.item_id,spaceItem:this.items[item.item_id]});
        }else{
          this.items[item.item_id] = new SpaceFolder({host:this.container,data:item});
        }
      }else if (item.item_type==="flashcard") {
        if(parent){
          this.items[item.item_id] = new FlashCard({data:item});
          parent.addChild({itemId:item.item_id,spaceItem:this.items[item.item_id]});
        }else{
          this.items[item.item_id] = new FlashCard({host:this.container,data:item});
        }
      }
      this.items[item.item_id].on("select",(data)=>{
        this.fireEvent("select",data);
      });
    }
  }
  exports.manager = SpaceFolderManager;
})(typeof exports === "undefined" ? (this.FolderManager = {}) : exports);
