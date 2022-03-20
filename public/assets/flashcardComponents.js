((exports)=>{
  class FlashcardCard {
    constructor({data,host}) {
      this.data = data;
      this.host = host;
      this.container = document.createElement(`div`);
      this.container.style =`width:100%;height:100%; border:1px solid dodgerblue;`;
      this.host[0].appendChild(this.container);
      this.states = {};
      this.render();
    }
    setSates(states){
      this.states = {...this.states,...states};
      this.container.innerHTML ="";
      this.render();
    }
    render(){

    }
  }
  class BasicCard extends FlashcardCard{
    constructor(args) {
      super(args);
    }
    save({spaceId,itemId,changes}){
      return new Promise((resolve, reject)=>{
        APIService.updateItem({spaceId,itemId,changes}).then((res)=>{
          return resolve(res);
        }).catch((err)=>{
          return reject(err);
        });
      });
    }
    render(){
      if(this.states.editing){
        this.menuView = document.createElement(`div`);
        this.menuView.style="display:flex; flex-direction:row-reverse;";
        let saveBtn = document.createElement(`button`);
        saveBtn.innerHTML ="Save";
        this.menuView.appendChild(saveBtn);
        this.titleInput = document.createElement("input");
        this.titleInput.setAttribute("type","text");
        this.titleInput.setAttribute("value",this.data.title);
        this.titleInput.style =`width:100%;`;
        this.textareaInput = document.createElement("textarea");
        this.textareaInput.setAttribute("value",this.data.text);
        this.textareaInput.style =`width:100%;`;

        let holder = document.createElement(`div`);
        holder.style=`width:100%; height:100%;dispay:grid; grid-template-rows:max-content max-content auto; grid-template-columns:auto;`;
        holder.appendChild(this.menuView);
        holder.appendChild(this.titleInput);
        holder.appendChild(this.textareaInput);
        this.container.appendChild(holder);
        saveBtn.addEventListener("click",async(e)=>{
          let title = this.titleInput.value;
          let text = this.textareaInput.value;
          let changes  = {
            item_name:title,
            title,
            text,
            score:0,
            pos:11
          };
          console.log(this.data,changes);
        try {
          let saved = await this.save({
            spaceId:this.data.space_id,
            itemId:this.data.item_id,
            changes:changes
          });
          console.log(saved);
          // this.setSates({editing:false});
        } catch (e) {
          console.log("saving error",e);
        }
        });
      }else{
        this.menuView = document.createElement(`div`);
        this.menuView.style="display:flex; flex-direction:row-reverse;";
        let editBtn = document.createElement(`button`);
        editBtn.innerHTML ="Edit";
        this.menuView.appendChild(editBtn);
        this.frontview = document.createElement(`div`);
        this.frontview.innerHTML = `${this.data.title}`
        this.backView = document.createElement(`div`);
        this.backView.innerHTML = `body ${this.data.text}`;

        let holder = document.createElement(`div`);
        holder.style=`width:100%; height:100%;dispay:grid; grid-template-rows:max-content max-content auto; grid-template-columns:auto;`;
        holder.appendChild(this.menuView);
        holder.appendChild(this.frontview);
        holder.appendChild(this.backView);
        this.container.appendChild(holder);
        editBtn.addEventListener("click",(e)=>{
          this.setSates({editing:true});
        });
      }
    }
  }


  class Cart {
    constructor({host,cards}) {
      this.host = host;
      this.container = $(`<div style="width:100%;"></div>`);
      this.host.append(this.container);
      this.cEvents = {};
      this.cards = cards?cards:[];
      this.controllers = {};
      this.render();
    }
    on(ev,call){
      this.cEvents[ev]= call;
    }
    fireEvent(ev,args){
      if(this.cEvents[ev]){
        this.cEvents[ev](args);
      }
    }
    selectItem(id){
      for(let elt in this.controllers){
        this.controllers[elt].view?.css({"outline":"none"});
      }
      if(this.controllers[id]){
        this.controllers[id].view?.css({"outline":"1px solid dodgerblue"});
        this.fireEvent("selection",this.controllers[id].data);
      }
    }
    render(){
      this.container.empty();
      this.controllers ={};
      let box = $(`<div style="width:1000px; display:flex; flex-direction:row; gap:1px; padding:10px; border:1px solid lightgrey; margin:0 auto; overflow:scroll;"></div>`);
      this.container.append(box);
      let width =200;
      let height = 100;
      console.log({cards:this.cards});
      for(let i=0; i< this.cards.length; i++){
        let title = this.cards[i]?.item_name;
        let id = this.cards[i]?.item_id;
        let one = $(`<div style="display:flex;flex-basis:${width}px; flex-grow: 0;flex-shrink: 0; cursor:pointer; border:1px solid lightgrey; width:${width}px; height:${height}px;align-items:center; justify-content:center; color:grey; ">${title?title:i}</div>`);
        this.controllers[id] = {data:this.cards[i],view:one};
        box.append(one);
        one.click(()=>{
          this.selectItem(id);
        });
      }
    }
    addNewCard(args){
      let items = Array.isArray(args.item)?args.item:[args.item];
      if(("at" in args) && args.at>=0){
        this.cards.splice(args.at, 0, ...items);
      }else{
        this.cards =[...this.cards,...items];
      }
      this.render();
    }
  }

  class Display {
    constructor({host}) {
      this.host = host;
      this.container = $(`<div></div>`);
      this.host.append(this.container);
    }
  }
  class Tools {
    constructor({host,menus}) {
      this.host = host;
      this.container = $(`<div></div>`);
      this.host.append(this.container);
      this.menus = menus;
      this.cEvents = {};
      this.render();
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
      let box = $(`<div style="display:flex; flex-direction:row; gap:7px;"></div>`);
      this.container.append(box);
      for(let i =0;i<this.menus.length; i++){
        let menu = $(`<div style="cursor:pointer;">${this.menus[i].label}<div>`);
        box.append(menu);
        menu.click((e)=>{
          e.stopPropagation();
          this.fireEvent(this.menus[i].name);
        });
      }
    }
  }
  class Board {
    constructor({host,data,cards}) {
      this.host = host;
      this.data = data;
      this.cEvents = {};
      this.cards = cards?cards:[];
      this.menus =[{name:"add_new_card",label:"Add new card"}];
      this.render();
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
      this.box = $(`<div style="width:100%; height:100%;display:grid; grid-template-rows:auto max-content; grid-template-columns:auto; "></div>`);
      this.host.append(this.box);
      this.topArea = $(`<div style="width:100%;display:grid; grid-template-rows:max-content auto; grid-template-columns:auto;"></div>`);
      this.displayArea = $(`<div style="width:100%;"></div>`);
      this.toolArea = $(`<div style="width:100%;"></div>`);
      this.topArea.append(this.toolArea,this.displayArea);
      this.bottomArea = $(`<div style="width:100%;"></div>`);
      this.box.append(this.topArea,this.bottomArea);
      const flashcardId = this.data.item_id;
      const spaceId = this.data.space_id;
      const menus =[{name:"add_new_card",label:"Add new card"}];
      const tools = new Tools({host:this.toolArea,menus:this.menus});
      const cart = new Cart({host:this.bottomArea,cards:this.cards});
      //const display = new Display({host:this.displayArea});
      cart.on("selection",(item)=>{
        console.log(item);
        this.displayArea.empty();
        //fetch Card
        APIService.getSpaceItem({
            spaceId:item.space_id,
            itemId:item.item_id
        }).then((res)=>{
          console.log(res);
          if(res.card && res.card.card_type==="basic"){
            let cardC = new BasicCard({host:this.displayArea,data:res.card});
          }
        }).catch((err)=>{
          console.log(err);
        });
      });
      tools.on("add_new_card",()=>{
        let name = prompt("card title?");
        if(name?.length>=0){
          APIService.createSpaceItem({
            spaceId:spaceId,
            parentId:flashcardId,
            flashcardCard:{
              item_name:name,
              card_type:"basic",
              text:`Hello world`
            }
          }).then((res)=>{
            let items = res.items;
            cart.addNewCard({at:false,item:items});
            console.log("ADDED flashcardCard ITEMS",res);
          }).catch((e)=>{
            console.log(e);
          });
        }
      });
    }
  }
  exports.Board = Board;
})(typeof exports === "undefined" ? (this.FlashCardView = {}) : exports);
