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
    render(){
      if(this.states.editing){
        this.menuView = document.createElement(`div`);
        this.menuView.style="display:flex; flex-direction:row-reverse;";
        let doneBtn = document.createElement(`button`);
        doneBtn.innerHTML ="Done";
        this.menuView.appendChild(doneBtn);
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
        doneBtn.addEventListener("click",(e)=>{
          this.setSates({editing:false});
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
      for(let i=0; i< this.cards.length; i++){
        let title = this.cards[i]?.title;
        let id = this.cards[i]?.card_id;
        let one = $(`<div style="flex-basis:${width}px; flex-grow: 0;flex-shrink: 0; cursor:pointer; border:1px solid lightgrey; width:${width}px; height:${height}px; ">${title?title:i}</div>`);
        this.controllers[id] = {data:this.cards[i],view:one};
        box.append(one);
        one.click(()=>{
          this.selectItem(id);
        });
      }
    }
    addNewCard({at,item}){
      if(at>=0){
        this.cards.splice(at, 0, item);
      }else{
        this.cards.push(item);
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
      this.cards = cards?cards:[
        // {title:"1",type:"basic",id:"1"},
        // {title:"2",type:"basic",id:"2"},
        // {title:"3",type:"basic",id:"3"},
        // {title:"4",type:"basic",id:"4"},
        // {title:"5",type:"basic",id:"5"},
        // {title:"6",type:"basic",id:"6"},
        // {title:"7",type:"basic",id:"7"},
        // {title:"8",type:"basic",id:"8"},
        // {title:"9",type:"basic",id:"9"},
        // {title:"10",type:"basic",id:"10"}
      ];
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
      console.log({falscard:this.data});
      const menus =[{name:"add_new_card",label:"Add new card"}];
      const tools = new Tools({host:this.toolArea,menus:this.menus});
      const cart = new Cart({host:this.bottomArea,cards:this.cards});
      // const display = new Display({host:this.displayArea});
      cart.on("selection",(card)=>{
        console.log(card);
        this.displayArea.empty();
        let cardC = new BasicCard({host:this.displayArea,data:card});
        // display.show(card);
      });
      tools.on("add_new_card",()=>{
        console.log("newCard",this.data);
        let name = prompt("card title?");
        if(name.length>=0){
          APIService.createFlashcardcard({
              flashcardId:flashcardId,
              cardTitle:name,
              cardType:"basic"
          }).then((res)=>{
            console.log("CREATED CARD",res);
            if(res.card){
              cart.addNewCard({at:0,item:res.card});
            }
          }).catch((err)=>{
            console.log(err);
          });
        }
        // cart.addNewCard({at:0,item:{title:"insert",type:'basic'}});
      });

      // APIService.getFlashcardCards({
      //     flashcardId:flashcardId,
      // }).then((res)=>{
      //   console.log("CARDS",res);
      // }).catch((err)=>{
      //   console.log(err);
      // });
    }
  }
  exports.Board = Board;
})(typeof exports === "undefined" ? (this.FlashCardView = {}) : exports);
