((exports)=>{

  class SceneCard {
    constructor({data,host}) {
      this.data = data;
      this.host = host;
      this.container = document.createElement(`div`);
      this.container.style =`width:100%;height:100%;`;
      this.host[0].appendChild(this.container);
      this.states = {};
      this.cEvents = {};
      this.render();
    }
    setStates(states){
      this.states = {...this.states,...states};
      this.container.innerHTML ="";
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

    }
  }
  class BasicCard extends SceneCard{
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

        // APIService.deleteItem({spaceId,itemId}).then((res)=>{
        //   return resolve(res);
        // }).catch((err)=>{
        //   return reject(err);
        // });
      });
    }
    flip(){
        let tmp  = this.flipCard.data();
        if(!tmp?.flip || (tmp?.flip !== 180)){
            let angle = 180;
            this.flipCard.css({transform: `rotateY(${angle}deg)`});
            this.flipCard.data("flip",angle);
        }else{
          this.flipCard.css({transform: `none`});
          this.flipCard.data("flip",false);
        }
    }
    render(){
      if(this.states.editing){
        this.menuView = document.createElement(`div`);
        this.menuView.style="display:flex; flex-direction:row-reverse;gap:5px;";
        let saveBtn = document.createElement(`button`);
        saveBtn.innerHTML ="Save";

        let cancelBtn = document.createElement(`button`);
        cancelBtn.innerHTML ="Cancel";

        this.menuView.appendChild(saveBtn);
        this.menuView.appendChild(cancelBtn);
        this.titleInput = document.createElement("input");
        this.titleInput.setAttribute("type","text");
        this.titleInput.setAttribute("value",this.data.item_name);
        this.titleInput.style =`width:100%;`;
        this.textareaInput = document.createElement("textarea");
        this.textareaInput.value = this.data.text;
        this.textareaInput.style =`width:100%; height:100%;`;
        let textAreaHolder = $(`<div style="width:100%;"></div>`);
        textAreaHolder.append(this.textareaInput);
        let holder = document.createElement(`div`);
        holder.style=`width:100%; height:100%;display:grid; grid-template-rows:max-content max-content auto; grid-template-columns:auto;`;
        holder.appendChild(this.menuView);
        holder.appendChild(this.titleInput);
        holder.appendChild(textAreaHolder[0]);
        this.container.appendChild(holder);
        this.textareaInput.focus();
        cancelBtn.addEventListener("click",()=>{
          this.setStates({editing:false});
        });
        saveBtn.addEventListener("click",async(e)=>{
          let title = this.titleInput.value;
          let text = this.textareaInput.value;
          let changes  = {
            item_name:title,
            title,
            text
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
        this.menuView.style="display:flex; flex-direction:row-reverse; gap:5px;";
        let editBtn = document.createElement(`button`);
        editBtn.innerHTML ="Edit";
        this.menuView.appendChild(editBtn);

        let flipBtn = $(`<button>Flip</button>`);
        this.menuView.appendChild(flipBtn[0]);
        this.frontview = $(`<div style="position:absolute; top:0px; left:0px; width:100%; height:100%; border:1px solid lightgrey;display:flex; align-items:center; justify-content:center;backface-visibility: hidden;">${this.data.item_name}</div>`);
        this.backView = $(`<div style="position:absolute; top:0px; left:0px; width:100%; height:100%; border:1px solid lightgrey;backface-visibility: hidden;transform:rotateY(180deg);background-color:rgb(18,20,20); color:lightgrey;"><p>${this.data.text?this.data.text:"no text yet"}</p></div>`);
        let holder = document.createElement(`div`);
        holder.style=`width:100%; height:100%;display:grid; grid-template-rows:max-content auto; grid-template-columns:auto;`;
        holder.appendChild(this.menuView);


        this.flipCard = $(`<div style="width:100%; position:relative;transition: transform 0.7s;transform-style: preserve-3d;"></div>`);
        this.flipCard.append(this.frontview,  this.backView);
        holder.appendChild(this.flipCard[0]);
        this.container.appendChild(holder);
        editBtn.addEventListener("click",(e)=>{
          this.setStates({editing:true});
        });
        flipBtn.click(()=>{
          this.flip();
        });
        this.flipCard.click(()=>{
          this.flip();
        });
      }
    }
  }
  class SceneView {
    constructor({host,current}) {
      this.states = {current:current};
      this.host = host;
      this.cEvents = {};
      this.container = $(`<div style="width:100%;"></div>`);
      this.host.append(this.container);

    }
    setSates(states){
      this.states = {...this.states,...states};
      this.container.empty();
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
      let box = $(`<div style="width:100%;min-height:400px; display:grid; grid-template-columns:max-content auto max-content; grid-template-rows:auto;padding:10px;"></div>`);
      this.container.append(box);
      let left = $(`<div style="display:flex; align-items:center; justify-content:center; height:100%; color:lightgrey;cursor:pointer;"></div>`);
      let middle = $(`<div></div>`);
      let right = $(`<div style="display:flex; align-items:center; justify-content:center;height:100%;color:lightgrey;cursor:pointer;"></div>`);
      box.append(left,middle,right);
      let prevBtn = $(`<b>Prev</b>`);
      left.append(prevBtn);
      let nextBtn = $(`<b>Next</b>`);
      right.append(nextBtn);
      prevBtn.click((e)=>{
        e.stopPropagation();
        this.fireEvent("prev");
      });
      nextBtn.click((e)=>{
        e.stopPropagation();
        this.fireEvent("next");
      });
      if(this.states.current){
        let item = this.states.current;
        APIService.getSpaceItem({
            spaceId:item.space_id,
            itemId:item.item_id
        }).then((res)=>{
          console.log(res);
          if(res.card && res.card.card_type==="basic"){
            let cardC = new BasicCard({host:middle,data:res.card});
          }
        }).catch((err)=>{
          console.log(err);
        });
      }
    }
  }


  class CartView {
    constructor({host,cards}) {
      this.states = {cards:cards};
      this.host = host;
      this.cEvents = {};
      this.container = $(`<div style="width:100%;"></div>`);
      this.host.append(this.container);
    }
    setSates(states){
      this.states = {...this.states,...states};
      this.container.empty();
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
      let box = $(`<div style="width:100%; max-width:1000px; display:flex; flex-direction:row; gap:5px; padding-left:10px; padding-bottom:30px;padding-top:30px; border:1px solid lightgrey; margin:0 auto; overflow:scroll;"></div>`);
      this.container.append(box);
      let width =80;
      let height = 50;
      let fontSize =7;
      let cards = this.states.cards;
      if(cards && cards.length>0){
        let currentView = false;
        for(let i=0; i< cards.length; i++){
          let title = cards[i]?.item_name;
          let id = cards[i]?.item_id;
          let isCurrent = this.states.idx===i;
          let one = $(`<div style="display:flex;flex-basis:${width}px; flex-grow: 0;flex-shrink: 0; cursor:pointer;  width:${width}px; height:${height}px;align-items:center; justify-content:center; color:black; ${isCurrent?`outline:3px solid dodgerblue;`:""} font-size:${fontSize}px;background-color:whitesmoke;">${title?title:i}</div>`);
          box.append(one);
          one.click((e)=>{
            e.stopPropagation();
            this.fireEvent("selection",i);
          });
          if(isCurrent){
            currentView = one;
          }
        }
        if(currentView){
          let offset = currentView.offset();
          let itemDim = currentView[0].offsetLeft + currentView[0].offsetWidth;
          let boxDim = box[0].offsetWidth;
          let diffDimention = (itemDim -boxDim);
          console.log({diffDimention,box:box[0].scrollLeft});
          let boxOffset = box.offset();
          let number = (offset.left-boxOffset.left);
          if(itemDim >boxDim){
            box.animate({scrollLeft:number},0,"swing");
          }else if (number<0) {
             // box.animate({scrollLeft:number},0,"swing");
          }
        }
      }
    }
  }
  class Controller {
    constructor({host,cards}) {
      this.host = host;
      this.container = $(`<div style="width:100%;"></div>`);
      this.sceneArea = $(`<div style="width:100%;"></div>`);
      this.rackArea = $(`<div style="width:100%;"></div>`);
      this.container.append(this.sceneArea,this.rackArea);
      this.host.append(this.container);
      this.cEvents = {};
      this.cards = cards?cards:[];
      this.currentIdx = 0;
      this.init();
    }
    setCurrent(idx){
      if(idx>=0){
        this.currentIdx = idx;
        this.render();
      }
    }
    init(){
      this.sceneView = new SceneView({host:this.sceneArea});
      this.cartView = new CartView({host:this.rackArea});
      this.cartView .on("selection",(idx)=>{
        this.setCurrent(idx);
      });
      this.sceneView .on("prev",()=>{
        this.prev();
      });
      this.sceneView .on("next",()=>{
        this.next();
      });
      this.render();
    }
    next(){
      if(this.currentIdx<this.cards.length-1){
        this.currentIdx++;
        this.render();
      }
    }
    prev(){
      if(this.currentIdx>0){
        this.currentIdx--;
        this.render();
      }
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
      this.cartView.setSates({cards:this.cards,idx:this.currentIdx});
      this.sceneView.setSates({current:this.cards[this.currentIdx]});
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
  exports.controller = Controller;
})(typeof exports === "undefined" ? (this.FlashcardRack= {}) : exports);
