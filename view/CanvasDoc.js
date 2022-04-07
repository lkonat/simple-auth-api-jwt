((exports)=>{
class Node {
  constructor(args) {
    this.children = [];
    this.cEvents = {};
  }
  parent(node){
    this.parent = node;
  }
  on(evt, call){
    this.cEvents[evt] = call;
  }
  fireEvent(evt,args){
    if(this.cEvents[evt]){
      this.cEvents[evt](args);
    }
  }
  emitAction(evt){
    this.fireEvent("click", evt);
  }
  append(){
    for(let i =0; i< arguments.length; i++){
      arguments[i].parent(this);
      this.children.push(arguments[i]);
    }
  }
}

class Rect extends Node{
  constructor(args) {
    super(args);
    this.className = args.className;
    this.id = args.id;
    this.x1 = args.x;
    this.y1 = args.y;
    this.width = args.width;
    this.height = args.height;
  }
  setPos(args){
    if("x" in args){
      this.x1 = args.x;
    }
    if("y" in args){
      this.y1 = args.y;
    }
    CANVAS_DOC?.update();
  }
  getPos(){
    return {x:this.x1,y:this.y1};
  }
  hasClass(name){
    return this.className.indexOf(name) !==-1;
  }
  triggerEvent(evt){
    this.fireEvent(evt.type, evt);
  }
  setDimension(){
    this.offsetX=this.parent && this.parent.offsetX?this.parent.offsetX +this.x1:this.x1;
    this.offsetY=this.parent && this.parent.offsetY?this.parent.offsetY +this.y1:this.y1;
    this.x2 = this.offsetX + this.width;
    this.y2 = this.offsetY + this.height;
  }
  getEventTarget(evt){
    const {offsetX,offsetY} = evt;
    let allTargets = [];
    for(let i =0; i< this.children.length; i++){
      let targets = this.children[i].getEventTarget(evt);
      if(targets){
        allTargets = allTargets.concat(targets);
      }
    }
    let x = offsetX;
    let y = offsetY;
    let isTarget = this.offsetX <= x && x <= this.x2 && this.offsetY <= y && y <= this.y2;
    if(isTarget){
      allTargets.push(this);
    }
    return allTargets;
  }
  draw({ctx}){
    ctx.rect(this.offsetX ,this.offsetY, this.width, this.height);
    // ctx.fill();
    ctx.stroke();
  }
  showChildren({parent,ctx}){
    for(let i =0; i< this.children.length; i++){
      this.children[i].show({parent,ctx});
    }
  }
  show({parent,ctx}){
    this.parent = parent;
    this.setDimension();
    this.draw({ctx});
    this.showChildren({parent:this,ctx});
  }
}


class CEvent {
  constructor({original,type}) {
    this.type = type;
    this.original = original;
    this.propagating = true;
  }
  stopPropagation(){
    this.propagating = false;
  }
}

class DocLayers {
  constructor({main,host,height,width,style}) {
    this.main = main;
    this.cEvents = {};
    this.host = host;
    this.height = height;
    this.width = width;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if(style){
      for(let st in style){
        this.canvas.style[st] = style[st];
      }
    }
    this.canvas.style.position = `absolute`;
    this.canvas.style.top = `0px`;
    this.canvas.style.left = `0px`;
    this.host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    if(this.main){
      this.canvas.addEventListener('click', (evt)=>{this.fireEvent("any",{type:evt.type,evt:evt})});
      this.canvas.addEventListener('mousedown', (evt)=>{this.fireEvent("any",{type:evt.type,evt:evt})});
      this.canvas.addEventListener('mousemove',(evt)=>{this.fireEvent("any",{type:evt.type,evt:evt})});
      this.canvas.addEventListener('mouseup',(evt)=>{this.fireEvent("any",{type:evt.type,evt:evt})});
      this.canvas.addEventListener('mouseleave', (evt)=>{this.fireEvent("any",{type:evt.type,evt:evt})});
    }else{
      this.canvas.style.pointerEvents="none";
    }
  }
  on(evt, call){
    this.cEvents[evt] = call;
  }
  fireEvent(evt,args){
    if(this.cEvents[evt]){
        this.cEvents[evt](args);
    }
  }
}
class Doc{
  constructor() {
    this.children = [];
    this.cEvents = {};
    this.layers = [];
  }
  getContext(){
    return this.layers[0].ctx;
  }
  init({host,width, height,nLayers}){
    if(!host){
      throw new Error(`need host`);
    }else{
      this.nLayers = nLayers && nLayers>0?nLayers:1;
      this.host = host;
      this.height = height;
      this.width = width;
      this.box = document.createElement("div");
      this.box.style.width = this.width+"px";
      this.box.style.height = this.height+"px";
      this.box.style.position = `relative`;
      this.host.appendChild(this.box);
      for(let i =0; i< this.nLayers; i++){
        let layer = new DocLayers({main:i?false:true,host:this.box,height:this.height,width:this.width, style:{backgroundColor:"transparent"}});
        this.layers.push(layer);
        layer.on("any",({type,evt})=>{
          this.fireEvent(type,evt);
        });
      }
      this.setDimension();
    }
  }
  setDimension(){
    this.offsetX=this.layers[0].canvas.offsetLeft;
    this.offsetY=this.layers[0].canvas.offsetTop;;
    this.x2 = this.offsetX + this.width;
    this.y2 = this.offsetY + this.height;
  }
  on(evt, call){
    this.cEvents[evt] = call;
  }
  fireEvent(evt,args){
    if(this.cEvents[evt]){
      this.cEvents[evt](args);
    }
  }
  append(args){
    for(let i =0; i< arguments.length; i++){
      this.children.push(arguments[i]);
    }
    this.show({ctx:this.getContext()});
  }
  getEventTarget(evt){
    this.setDimension();
    const {screenX,screenY} = evt;
    let x = evt.clientX;
    let y = evt.clientY;
    let isTarget = this.offsetX <= x && x <= this.x2 && this.offsetY <= y && y <= this.y2;
    if(isTarget){
      let allTargets = [];
      for(let i =0; i< this.children.length; i++){
        let targets = this.children[i].getEventTarget(evt);
        if(targets?.length>0){
          allTargets = allTargets.concat(targets);
        }
      }
      allTargets.push(this);
      if(allTargets.length>0){
        let idx = 0;
        let cEvent = new CEvent({original:evt,type:evt.type});
        while(cEvent.propagating && idx<=allTargets.length){
          if(allTargets[idx]?.triggerEvent){
            allTargets[idx]?.triggerEvent(cEvent);
          }
          idx++;
        }
        // return this.fireEvent(evt.type,{target:allTargets[0]});
        return allTargets[0];
      }
    }
    return false;
  }
  update(){
      this.show();
  }
  show(){
    let ctx = this.getContext();
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.beginPath();
    for(let i =0; i< this.children.length; i++){
      this.children[i].show({ctx:ctx,parent:this});
    }
  }
}
const CANVAS_DOC = new Doc();
exports.DocLayers = DocLayers;
exports.Rect = Rect;
exports.controller = CANVAS_DOC;
})(typeof exports === "undefined" ? (this.CanvasDoc= {}) : exports);
