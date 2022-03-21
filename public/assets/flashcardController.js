((exports)=>{

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
      let left = $(`<div style="display:flex; align-items:center; justify-content:center; height:100%;"></div>`);
      let middle = $(`<div><center>View</center></div>`);
      let right = $(`<div style="display:flex; align-items:center; justify-content:center;height:100%;"></div>`);
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
      let box = $(`<div style="width:1000px; display:flex; flex-direction:row; padding-left:10px; padding-bottom:30px;padding-top:30px; border:1px solid lightgrey; margin:0 auto; overflow:scroll;"></div>`);
      this.container.append(box);
      let width =200;
      let height = 100;
      let cards = this.states.cards;
      if(cards && cards.length>0){
        let currentView = false;
        for(let i=0; i< cards.length; i++){
          let title = cards[i]?.item_name;
          let id = cards[i]?.item_id;
          let isCurrent = this.states.idx===i;
          let one = $(`<div style="display:flex;flex-basis:${width}px; flex-grow: 0;flex-shrink: 0; cursor:pointer;  width:${width}px; height:${height}px;align-items:center; justify-content:center; color:grey; ${isCurrent?`outline:3px solid dodgerblue;`:""} ">${title?title:i}</div>`);
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
