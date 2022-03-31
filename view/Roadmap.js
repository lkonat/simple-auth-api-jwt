((exports)=>{
  class RoadMapItems {
    constructor({viewId,roadmapStartDate,roadmapEndDate,startDate,endDate,label,oneDayPx,unitHeight}) {
      this.viewId = viewId;
      this.roadmapStartDate = roadmapStartDate;
      this.roadmapEndDate = roadmapEndDate;
      this.startDate = startDate;
      this.endDate = endDate;
      this.label = label;
      this.oneDayPx = oneDayPx;
      this.unitHeight = unitHeight;
    }
    getNumdays(args){
      let roadMapStartTs = new Date(this.roadmapStartDate).getTime();
      return {
        start:((new Date(this.startDate).getTime()-roadMapStartTs)/(1000*60*60*24)),
        end:((new Date(this.endDate).getTime()-roadMapStartTs)/(1000*60*60*24)),
      }
    }
    updateMetrics(){
      function dateStr(ts){
        let date = new Date(ts);
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        month = month>=10?month:`0${month}`;
        day = day>=10?day:`0${day}`;
        let str = `${year}-${month}-${day}`;
        return str;
      }
      let left = parseInt(this.view.css("left"));
      let width = parseInt(this.view.css("width"));
      let roadMapStartTs = new Date(this.roadmapStartDate).getTime();
      let startNDayTs = (Math.ceil(left/this.oneDayPx)*(1000*60*60*24)) + roadMapStartTs;
      let endNDayTs = (Math.ceil((left+width)/this.oneDayPx)*(1000*60*60*24)) + roadMapStartTs;

      let startDay = new Date(startNDayTs);
      let endDay = new Date(endNDayTs);
      let starDate = dateStr(startNDayTs);
      let endDate = dateStr(endNDayTs);
      console.log({starDate,endDate});
      // console.log({startDay:startDay.toString(),endDay:endDay.toString(),last:(left+width)/this.oneDayPx,lastCel:Math.ceil(left+width)/this.oneDayPx});

    }
    display({host,top}){
      if(this.view){
        this.view.remove();
      }
      let numDays = this.getNumdays();
      let startNDay = numDays.start;
      let endNDay = numDays.end;
      let width = (endNDay - startNDay)*this.oneDayPx;
      this.view = $(`<div class="map-items" data-id="${this.viewId}" style="position:absolute; top:${top}px; left:${startNDay*this.oneDayPx}px; width:${width}px; height:${this.unitHeight}px; border:1px solid dodgerblue; background-color:whitesmoke; color:black; text-align:center; border-radius:3px;cursor:pointer;overflow:hidden;">${this.label}</div>`);
      this.left = $(`<div class="stretchable stretchable-w" style="width:10px;height:100%; background-color:dodgerblue; position:absolute; top:0px; left:0px; cursor:w-resize;"></div>`);
      this.right = $(`<div class="stretchable stretchable-e" style="width:10px; height:100%; background-color:dodgerblue;position:absolute; top:0px; right:0px;cursor:e-resize;"></div>`);
      this.view.append(this.left,this.right);
      host.append(this.view);
    }
  }
 class RoadMapSection {
   constructor({name,host,roadmapStartDate,roadmapEndDate,unitHeight,oneDayPx}) {
     this.name = name?name:"untitled"
     this.host = host;
     this.roadmapStartDate = roadmapStartDate;
     this.roadmapEndDate = roadmapEndDate;
     this.unitHeight = unitHeight;
     this.oneDayPx = oneDayPx;
     this.box = $(`<div style="outline:1px solid whitesmoke;border-radius:5px;width:100%; -webkit-user-select: none; -ms-user-select: none;user-select: none; margin:0px;padding:0px;"></div>`);
     this.header = $(`<div>${this.name}</div>`);
     this.container = $(`<div style="min-height:30px; width:100%; position:relative;-webkit-user-select: none; -ms-user-select: none;user-select: none;margin:0px;padding:0px;"></div>`);
     this.box.append(this.header,this.container);
     this.host.append(this.box);
     this.lines =[];
     this.render();
   }
   addItems({items}){
     const addOne=({item})=>{
       const findAvailableRow = ({startNDay,endNDay})=>{
         for(let i =0; i< this.lines.length; i++){
           let rowItems = this.lines[i];
           for(let j =0; j<rowItems.length; j++){
             let item = rowItems[j];
             let numDays = item.getNumdays();
             let itemStartNDay = numDays.start;
             let itemEndNDay = numDays.end;
             if((startNDay>=itemStartNDay && startNDay<=itemEndNDay)  || (endNDay>=itemStartNDay && endNDay<=itemEndNDay)){
               continue
             }else{
               return i;
             }
           }
         }
         return null;
       };

       let numDays = item.getNumdays();
       let startNDay = numDays.start;
       let endNDay = numDays.end;
       let availableRow = findAvailableRow({startNDay,endNDay});
       if( availableRow !== null && availableRow>=0){
         this.lines[availableRow].push(item);
       }else{
         this.lines.push([item]);
       }
     }

     items = Array.isArray(items)?items:[items];
     for(let i =0; i<items.length; i++){
       addOne({item:items[i]});
     }
     this.render();
   }
   render(){
     this.container.empty();
     let top = 10;
     for(let i =0; i< this.lines.length; i++){
       let row = this.lines[i];
       for(let j =0; j<row.length; j++){
         let item = row[j];
         item.display({host:this.container,top});
       }
       top+=this.unitHeight+5;
       this.container.css({height:top+this.unitHeight+10});
     }
     console.log({lines:this.lines});
   }
 }


 class SVGScreenLayers {
   constructor({host,roadmapStartDate,oneDayPx,background}) {
     this.background = background;
     this.roadmapStartDate = roadmapStartDate;
     this.oneDayPx = oneDayPx;
     this.host = host;
     this.svgns = "http://www.w3.org/2000/svg";
     this.screen = $(`<svg style=" -webkit-user-select: none; -ms-user-select: none;user-select: none;pointer-events: none; padding:0px; width:100%; height:100%;background-color:${this.background?this.background:"transparent"}; position:absolute; top:0px; left:0px;" ></svg>`);
     this.host.append(this.screen);
     this.fontSize = 12;

   }
   drawTimeLine({label, x,color}){
     const lineHeight = parseInt(this.screen.css("height"));
     const screen = this.screen[0];
     let item = document.createElementNS(this.svgns,"g");
     screen.appendChild(item);
     let line= document.createElementNS(this.svgns,"rect");
     item.appendChild(line);
     line.setAttribute('x', x);
     line.setAttribute('y', 0);
     line.setAttribute('width',this.oneDayPx);
     line.setAttribute('height',lineHeight);
     line.setAttribute('style', `fill:${color?color:"rgba(225,100,100,0.2)"};`);
     if(label){
        let labelText = label.text;
        let color = label.color;
        let text = document.createElementNS(this.svgns,"text");
        item.appendChild(text);
        text.textContent = "today";
        text.setAttribute('x', x - 10);
        text.setAttribute('y', lineHeight/2);//if middle
        text.setAttribute('style', `fill:${color?color:"red"};  font-size:${this.fontSize}px;`);
     }
     return item;
   }
 }
  class ScreenLayer extends SVGScreenLayers{
    constructor(args) {
      super(args);
    }
    showToday(){
      let roadMapStartTs = new Date(this.roadmapStartDate).getTime();
      let nDayPassed =((new Date().getTime()-roadMapStartTs)/(1000*60*60*24));
      this.todayLine =  this.drawTimeLine({
          label:{text:"today", color:"red", top:"middle", left:"middle"},
          x:nDayPassed*this.oneDayPx,
          fill:"rgba(225,100,100,0.2)"
      });
    }
  }
  class ScreenEventLayer extends SVGScreenLayers{
    constructor(args) {
      super(args);
    }
  }
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
      this.background = "lightgrey";
      this.labelColor = "grey";
      this.box = $(`<div style="padding:0px; position:relative; width:${this.width}px; height:${this.height}px; background-color:${this.background}; color:${this.labelColor};"></div>`);
      this.screen = $(`<svg style=" -webkit-user-select: none; -ms-user-select: none;user-select: none;pointer-events: none; padding:0px; width:100%; height:100%;background-color:transparent; position:absolute; top:0px; left:0px;" ></svg>`);
      this.box.append(this.screen);
      this.host.append(this.box);
      this.monthStr  =["","Jan","Feb","Mar", "Apr","May", "Jun", "Aug", "Jul", "Sep", "Oct", "Nov", "Dec"];
      this.fontSize = 12;
      this.draw();
    }
    draw(){
      const screen = this.screen[0];
      const lineHeight =20;
      const color = this.labelColor;
      function nDaysInMonth(month, year) {return new Date(year, month, 0).getDate()};
      const showMonth= ({i,text,x,y})=>{
        let item = document.createElementNS(this.svgns,"text");
        let rect = document.createElementNS(this.svgns,"rect");
        screen.appendChild(item);
        screen.appendChild(rect);
        item.textContent = text;
        item.setAttribute('x',i==1?x:x-this.oneDayPx);
        item.setAttribute('y', y);
        item.setAttribute('style', `fill:${color}; font-size:${this.fontSize}px;`);

        rect.setAttribute('x', x);
        rect.setAttribute('y', y+3);
        rect.setAttribute('width', this.oneDayPx);
        rect.setAttribute('height', lineHeight);
        rect.setAttribute('style', `fill: ${color}; font-size:${this.fontSize}px;`);
      }
      const lastDay= ({x,y})=>{
        let rect = document.createElementNS(this.svgns,"rect");
        screen.appendChild(rect);
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', this.oneDayPx);
        rect.setAttribute('height', lineHeight);
        rect.setAttribute('style', `fill: ${color}; font-size:${this.fontSize}px;`);
      }
      let idx = this.startIdx;
      for(let i=1; i<=12; i++){
        let month= i;
        let text = this.monthStr[month];
        let x = idx, y = this.fontSize;
        showMonth({i,text,x,y});
        let howManyDay = nDaysInMonth (month, this.year);
        idx+=(howManyDay*this.oneDayPx);
      }
      lastDay({x:idx,y:this.fontSize});
    }
  }
  class RoadmapController {
    constructor({host,startDate,endDate}) {
      this.roadmapStartDate =startDate;
      this.roadmapEndDate =endDate;
      this.unitHeight=25;
      this.oneDayPx = 7;
      this.host = host;
      this.sections = {};
      this.items = {};
      this.height = 500;
      this.roadmapWidth = (new Date(this.roadmapEndDate).getTime() - new Date(this.roadmapStartDate).getTime())/(1000*60*60*24)* this.oneDayPx;
      console.log(this.roadmapWidth/this.oneDayPx)
      this.init();
    }
    init(){
      this.mainContainer = $(`<div style="width:100%;"></div>`);
      this.host.append(this.mainContainer);
      this.topContainer = $(`<div style="width:100%;"></div>`);
      this.scrollArea = $(`<div style="overflow:scroll; width:100%; border:1px solid blue; padding:3px; padding-bottom:50px;"></div>`);
      this.renderArea = $(`<div style="padding:0px; position:relative; width:${this.roadmapWidth}px; border:1px solid red;"></div>`);
      this.meterContainer = $(`<div style="padding:0px;width:100%;"></div>`);
      this.mapsContainer = $(`<div style="padding:0px;margin:0px;width:100%; height:300px; overflow:scroll;"></div>`);
      this.scrollArea.append(this.renderArea);
      this.renderArea.append(this.meterContainer,this.mapsContainer);
      this.mainContainer.append(this.topContainer,this.scrollArea);
      // this.bodyContainer = $(`<div style="width:100%;"></div>`);
      // this.mainContainer.append(this.topContainer,this.bodyContainer);
      this.meterView = new MeterView({
        host:this.meterContainer,
        roadmapStartDate:this.roadmapStartDate,
        roadmapEndDate:this.roadmapEndDate,
        unitHeight:this.unitHeight,
        oneDayPx:this.oneDayPx,
        roadmapWidth:this.roadmapWidth,
        height:30,
        year:2022,
        startIdx:0
      });
      this.ScreenLayer = new ScreenLayer({
        host:this.renderArea,
        roadmapStartDate:this.roadmapStartDate,
        roadmapEndDate:this.roadmapEndDate,
        oneDayPx:this.oneDayPx,
      });
      this.ScreenLayer.showToday();
      this.screenEventLayer = new ScreenEventLayer({
        host:this.renderArea,
        roadmapStartDate:this.roadmapStartDate,
        roadmapEndDate:this.roadmapEndDate,
        oneDayPx:this.oneDayPx,
      });
      let dragElement = false;
      const startDrag =(evt)=>{
          if (evt.target.classList.contains('stretchable')) {
            let estDir = evt.target.classList.contains('stretchable-e');
            let westDir = evt.target.classList.contains('stretchable-w');
            const {screenX,screenY} = evt;
            let view = $(evt.target).parent(".map-items");
            dragElement = {
              type:"stretchable",
              view:view,
              target:evt.target,
              startWidth:parseInt(view.css("width")),
              startLeft:parseInt(view.css("left")),
              startX:screenX,
              startY:screenY,
              dir:estDir?"e":"w"
            };
          }else if (evt.target.classList.contains('map-items')) {
            const {screenX,screenY} = evt;
            let view = $(evt.target);
            dragElement = {
              type:"movable",
              view:view,
              startWidth:parseInt(view.css("width")),
              startLeft:parseInt(view.css("left")),
              startX:screenX,
              startY:screenY
            };
          }
      }
      const drag =(evt)=>{
        if(dragElement){
          evt.preventDefault();
          if(dragElement.type === "stretchable"){
            const {screenX,screenY} = evt;
            dragElement.distanceX =screenX - dragElement.startX;
            if(dragElement.dir === "e"){
              let newWidth = (dragElement.startWidth + dragElement.distanceX);
              if(newWidth>=1 && (dragElement.startLeft+ newWidth)<=this.roadmapWidth){
                dragElement.view.css( "width", `${newWidth}`);
              }
            }else if (dragElement.dir === "w") {
              let newLeft = (dragElement.startLeft + dragElement.distanceX);
              let newWidth = (dragElement.startWidth - dragElement.distanceX);
              if(newLeft>=1 && newWidth>=1){
                dragElement.view.css({
                  left:`${newLeft}px`,
                  width:`${newWidth}px`
                });
              }
            }
          }else if (dragElement.type === "movable") {
            const {screenX,screenY} = evt;
            dragElement.distanceX =screenX - dragElement.startX;
            let newLeft = (dragElement.startLeft + dragElement.distanceX);
            if(newLeft>=1 && newLeft+dragElement.startWidth<=this.roadmapWidth){
              dragElement.view.css({
                left:`${newLeft}px`
              });
            }
          }
          // console.log(dragElement.startLeft, dragElement.distanceX, dragElement.dir);
          // console.log(dragElement);
        }
      }
      const endDrag =(evt)=>{
        evt.preventDefault();
        evt.stopPropagation();
        if(dragElement){
          let viewId = dragElement.view.data("id");
          let controller = this.items[viewId];
          controller.updateMetrics();
        }

        dragElement = null;
      }
      let view =document;
      view.addEventListener('mousedown', startDrag);
      view.addEventListener('mousemove',drag);
      view.addEventListener('mouseup', endDrag);
      view.addEventListener('mouseleave', endDrag);

    }
    addItems({section,items}){
      function makeId() {
          var text = "";
          var possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          for (var i = 0; i < 7; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
          }
          return new Date().getTime() + "I" + text;
      }
      if(!section){
        throw new Error("need section name");
      }
      if(!items || !Array.isArray(items)){
        throw new Error("need items");
      }
      let newItems = []
      for(let i =0; i<items.length; i++){
        let {label,startDate,endDate} = items[i];
        let viewId = makeId();
        this.items[viewId] = new RoadMapItems({
          viewId:viewId,
          roadmapStartDate:this.roadmapStartDate,
          roadmapEndDate:this.roadmapEndDate,
          startDate:startDate,
          endDate:endDate,
          label:label,
          unitHeight:this.unitHeight,
          oneDayPx:this.oneDayPx
        });
        newItems.push(this.items[viewId]);
      }
      let sectionController = false;
      if(this.sections[section]){
        sectionController = this.sections[section];
      }else{
        sectionController = new RoadMapSection({
          name:section,
          host:this.mapsContainer,
          roadmapStartDate:this.roadmapStartDate,
          roadmapEndDate:this.roadmapEndDate,
          unitHeight:this.unitHeight,
          oneDayPx:this.oneDayPx
        });
      }
      sectionController.addItems({items:newItems});
    }
  }
  exports.controller = RoadmapController;
})(typeof exports === "undefined" ? (this.Roadmap= {}) : exports);
