((exports)=>{
  class MeterView {
    constructor({host,year,startIdx,roadmapWidth,height,roadmapStartDate,roadmapEndDate,unitHeight,oneDayPx}) {
      this.year = year;
      this.host = host;
      this.svgns = "http://www.w3.org/2000/svg";
      this.width = roadmapWidth;
      this.height = height;
      this.startIdx =startIdx;
      this.roadmapStartDate = roadmapStartDate;
      this.roadmapEndDate = roadmapEndDate;
      this.unitHeight = unitHeight;
      this.oneDayPx = oneDayPx;
      this.background = "white";
      this.labelColor = "lightblue";
      this.box = $(`<div class="meter-box" style="padding:0px; margin:0px;position:relative; width:${this.width}px; height:${this.height}px;"></div>`);
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.margin =0;
      this.canvas.style.padding =0;
      this.canvas.style.padding =0;
      this.canvas.style.backgroundColor= "transparent";
      this.canvas.style.position= "absolute";
      this.canvas.style.top= "0px";
      this.canvas.style.left= "0px";
      this.ctx = this.canvas.getContext("2d");
      this.box[0].appendChild(this.canvas);
      this.host.append(this.box);
      this.monthStr  =["","Jan","Feb","Mar", "Apr","May", "Jun", "Aug", "Jul", "Sep", "Oct", "Nov", "Dec"];
      this.fontSize = 12;
      this.draw();
    }
    draw(){
      const lineHeight =20;
      const color = this.labelColor;
      function nDaysInMonth(month, year) {return new Date(year, month, 0).getDate()};
      const showRepers =({text,from,to,y,screen})=>{
        for(let i =from; i<to; i+=this.oneDayPx){
          let w = Math.round(this.oneDayPx/2.5);
          this.ctx.fillRect(i+( (this.oneDayPx/2) - Math.ceil(w/2)), y+10, w, lineHeight-2);
        }
      }
      const showMonth= ({i,text,x,y,howManyDay})=>{
        this.ctx.fillStyle = "grey";
        this.ctx.font = `${this.fontSize}px Arial`;
        this.ctx.fillText(text, (x)+((howManyDay*this.oneDayPx)/2), y);
        this.ctx.fillRect(x,  y+3, this.oneDayPx, lineHeight);
        showRepers({text,from:x+this.oneDayPx,y,to:(x+(howManyDay*this.oneDayPx)),screen});
      }
      const lastDay= ({x,y})=>{
        this.ctx.fillRect(x,  y,  this.oneDayPx, lineHeight);
      }
      let idx = this.startIdx;
      for(let i=1; i<=12; i++){
        let month= i;
        let text = this.monthStr[month];
        let x = idx, y = this.fontSize;
        let howManyDay = nDaysInMonth (month, this.year);
        showMonth({i,text,x,y,howManyDay});
        idx+=((howManyDay)*this.oneDayPx);
      }
      lastDay({x:idx,y:this.fontSize});
    }
  }
class Controller {
  constructor({host,startDate,endDate}) {
    this.theme = "dark";
    this.roadmapStartDate =startDate;
    this.roadmapEndDate =endDate;
    this.unitHeight=20;
    this.oneDayPx = 5;
    this.sections = {};
    this.items = {};
    this.height = 700;
    this.scrollPadding = 10;
    let mapNday = (new Date(this.roadmapEndDate).getTime() - new Date(this.roadmapStartDate).getTime())/(1000*60*60*24);
    this.roadmapWidth = (mapNday+2)* this.oneDayPx;
    this.host = host;
    this.box = $(`<div style="max-width:1000px; overflow:scroll; border:1px solid blue; margin:0 auto;"></div>`);
    this.host .append(this.box);
    this.doc = CanvasDoc.controller;
    this.init();
  }
  init(){
    this.box.empty();
    this.meterView = new MeterView({
      host:this.box,
      roadmapStartDate:this.roadmapStartDate,
      roadmapEndDate:this.roadmapEndDate,
      unitHeight:this.unitHeight,
      oneDayPx:this.oneDayPx,
      roadmapWidth:this.roadmapWidth,
      height:30,
      year:2022,
      startIdx:0
    });
    this.doc.init({host:this.box[0], width:this.roadmapWidth, height:500,nLayers:3});
    for(let i =0; i< 100; i++){
      let rect = new CanvasDoc.Rect({x:i+1,y:2,width:10, height:10, id:"1", className:"canvas-node"});
      this.doc.append(rect);
    }
    let rect = new CanvasDoc.Rect({x:1,y:2,width:10, height:10, id:"1", className:"canvas-node"});
    let rect2 = new CanvasDoc.Rect({x:100,y:20,width:10, height:10, id:"2", className:"canvas-node"});
    let rect3 = new CanvasDoc.Rect({x:120,y:20,width:10, height:10, id:"3", className:"canvas-node"});
    let rect4 = new CanvasDoc.Rect({x:320,y:140,width:200, height:220, id:"4", className:"canvas-node"});
    let rect5 = new CanvasDoc.Rect({x:3,y:5,width:150, height:150, id:"5", className:"canvas-node"});

    let dragElement = false;
    const dragStart = (evt)=>{
      const {screenX,screenY} = evt;
      let target = this.doc.getEventTarget(evt);
      if(target && target.hasClass &&  target.hasClass("canvas-node")){
        let pos = target.getPos();
        dragElement = {
          item: target,
          startX:screenX,
          startY:screenY,
          itemStartX:pos.x,
          itemStartY:pos.y,
        };
      }
    }
    const drag = (evt)=>{
      if(dragElement){
        const {screenX,screenY} = evt;
        let target = dragElement.item;
        let distX = screenX - dragElement.startX;
        let distY = screenY - dragElement.startY;
        target.setPos({x:dragElement.itemStartX+distX, y: dragElement.itemStartY+distY });
      }
    }
    const endDrag = (evt)=>{
      dragElement = false;
    }
    // CANVAS_DOC.on("mousedown",()=>{
    //   console.log("mosedown");
    // });
    // CANVAS_DOC.on("mousemove",()=>{ console.log()});
    // CANVAS_DOC.on('mouseup', ()=>{ console.log("mouseup")});
    // CANVAS_DOC.on('mouseleave', ()=>{ console.log("mouseleave")});


    let view = document;
    // view.addEventListener('click', dragStart);
    view.addEventListener('mousedown', dragStart);
    view.addEventListener('mousemove',drag);
    view.addEventListener('mouseup',endDrag);
    view.addEventListener('mouseleave', endDrag);

    // this.doc.on("click",(evt)=>{
    //   let target = evt.target;
    //   console.log("mouse click",target);
    // });

    // setInterval(()=>{
    //   this.doc.show();
    // },1);

  }
}
exports.controller = Controller;
})(typeof exports === "undefined" ? (this.RoadmapCanvas= {}) : exports);
