((exports)=>{
  class RoadMapItems {
    constructor({viewId,roadmapStartDate,roadmapEndDate,startDate,endDate,label,oneDayPx,unitHeight,section,color}) {
      this.section = section;
      this.viewId = viewId;
      this.color = color;
      this.roadmapStartDate = roadmapStartDate;
      this.roadmapEndDate = roadmapEndDate;
      this.startDate = startDate;
      this.endDate = endDate;
      this.label = label;
      this.oneDayPx = oneDayPx;
      this.unitHeight = unitHeight;
      this.monthStr  =["","Jan","Feb","Mar", "Apr","May", "Jun", "Aug", "Jul", "Sep", "Oct", "Nov", "Dec"];
    }
    getSection(){
      return this.section;
    }
    getPixels(){
      let roadMapStartTs = new Date(this.roadmapStartDate).getTime();
      let start =((new Date(this.startDate).getTime()-roadMapStartTs)/(1000*60*60*24))+1;
      let end =((new Date(this.endDate).getTime()-roadMapStartTs)/(1000*60*60*24))+1;
      let width = (end - start)+1;
      return {
        start:start*this.oneDayPx,
        end:end*this.oneDayPx,
        width:width*this.oneDayPx
      }
    }
    pixelsToMetric({left,width}){
      const dateStr = (date)=>{
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let str2month = month;
        month = month>=10?month:`0${month}`;
        day = day>=10?day:`0${day}`;
        let str = `${year}-${month}-${day}`;
        let str2 = `${this.monthStr[str2month]}-${day}`;
        return {str,str2};
      }
      let newStartNday = Math.ceil(left/this.oneDayPx);
      let newEndNday = Math.ceil(((left+width))/this.oneDayPx) -1;
      let nDaysDiff = (newEndNday - newStartNday);
      let roadMapStartDate = new Date(this.roadmapStartDate);
      let startDate1 = new Date(this.roadmapStartDate);
      let startDate2 = new Date(this.roadmapStartDate);
      let starDateX = startDate1.setDate(startDate1.getDate()+newStartNday);
      let endDateX = startDate2.setDate(startDate2.getDate()+(newEndNday));
      let A = dateStr(startDate1);
      let B = dateStr(startDate2);
      return {startDate:A.str,endDate:B.str,str:`${A.str2} to ${B.str2} ${nDaysDiff+1} days`};
    }
    getNumdays(){
      let roadMapStartTs = new Date(this.roadmapStartDate).getTime();
      let start =((new Date(this.startDate).getTime()-roadMapStartTs)/(1000*60*60*24))+1;
      let end =((new Date(this.endDate).getTime()-roadMapStartTs)/(1000*60*60*24))+1;
      let width = (end - start);
      return {
        start,
        end,
        width
      }
    }
    updateMetrics({left,width}){
      const {startDate,endDate} = this.pixelsToMetric({left,width});
      this.startDate = startDate;
      this.endDate = endDate;
    }
    display({host,top}){
      if(this.view){
        this.view.remove();
      }
      let pixels = this.getPixels();
      let left = pixels.start;
      let endNDay = pixels.end;
      let width = pixels.width;
      this.view = $(`<div class="map-items" data-id="${this.viewId}" style="position:absolute; top:${top}px; left:${left}px; width:${width}px; height:${this.unitHeight}px; background-color:lightblue; color:black; text-align:center; cursor:pointer;overflow:hidden;margin:0px; outline:0.5px solid black;">${this.label}</div>`);
      this.left = $(`<div class="stretchable stretchable-w" style="width:10px;height:100%; background-color:transparent; position:absolute; top:0px; left:0px; cursor:w-resize;margin:0px;"></div>`);
      this.right = $(`<div class="stretchable stretchable-e" style="width:10px; height:100%; background-color:transparent;position:absolute; top:0px; right:0px;cursor:e-resize;margin:0px;"></div>`);
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
     this.box = $(`<div class="roadmap-section-box" style=" margin:0px;width:100%; -webkit-user-select: none; -ms-user-select: none;user-select: none; padding:0px;"></div>`);
     this.header = $(`<div style="padding-left:3px;"><span class="roadmap-section-header">${this.name}</span></div>`);
     this.container = $(`<div class="roadmap-section-container" style="min-height:30px; width:100%; position:relative;-webkit-user-select: none; -ms-user-select: none;user-select: none;margin:0px;padding:0px;"></div>`);
     this.box.append(this.header,this.container);
     this.host.append(this.box);
     this.lines =[];
     this.items = [];
   }
   refresh(){
     this.placeAllItems();
   }
   placeAllItems(){
     this.lines =[];
     for(let i =0; i<this.items.length; i++){
       this.placeOneItem({item:this.items[i]});
     }
     this.render();
   }
   placeOneItem({item}){
     const findAvailableRow = ({startNDay,endNDay,label})=>{
       for(let i =0; i< this.lines.length; i++){
         let rowItems = this.lines[i];
         let here = (()=>{
           for(let j =0; j<rowItems.length; j++){
             let item = rowItems[j];
             let numDays = item.getNumdays();
             let itemStartNDay = numDays.start;
             let itemEndNDay = numDays.end;
             if((startNDay>=itemStartNDay && startNDay<=itemEndNDay)  || (endNDay>=itemStartNDay && endNDay<=itemEndNDay)  || (itemStartNDay>=startNDay && itemStartNDay<=endNDay) || (itemEndNDay>=startNDay && itemEndNDay<=endNDay) ){
               return false;
             }
           }
           return true;
         })();
         if(here){
           return i;
         }
       }
       return null;
     };

     let numDays = item.getNumdays();
     let startNDay = numDays.start;
     let endNDay = numDays.end;
     let availableRow = findAvailableRow({startNDay,endNDay,label:item.label});
     if( availableRow !== null && availableRow>=0){
       this.lines[availableRow].push(item);
     }else{
       this.lines.push([item]);
     }
   }
   addItems({items}){
     if( Array.isArray(items)){
       this.items = this.items.concat(items);
     }else{
       this.items.push(items);
     }
     this.placeAllItems();
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
   }
 }


 class SVGScreenLayers {
   constructor({host,roadmapStartDate,oneDayPx,background}) {
     this.background = background;
     this.roadmapStartDate = roadmapStartDate;
     this.oneDayPx = oneDayPx;
     this.host = host;
     this.svgns = "http://www.w3.org/2000/svg";
     this.screen = $(`<svg style=" -webkit-user-select: none; -ms-user-select: none;user-select: none;pointer-events: none; margin:0px; padding:0px; width:100%; height:100%;background-color:${this.background?this.background:"transparent"}; position:absolute; top:0px; left:0px;" ></svg>`);
     this.fontSize = 12;
   }
   init(){
     this.host.append(this.screen);
   }
   clear(){
       this.screen.empty();
   }
   drawTimeLine({height,width,label, x,color,className}){
     const lineHeight =height?height:parseInt(this.screen.css("height"));
     let rectWidth = width?width: this.oneDayPx;
     const screen = this.screen[0];
     let item = document.createElementNS(this.svgns,"g");
     screen.appendChild(item);
     let line= document.createElementNS(this.svgns,"rect");
     item.appendChild(line);
     line.setAttribute('x', x);
     line.setAttribute('y', 0);
     line.setAttribute('width',rectWidth);
     line.setAttribute('height',lineHeight);
     line.setAttribute('style', `fill:${color?color:"rgba(225,100,100,0.2)"};`);
     if(className){
       line.setAttribute('class', className);
     }
     if(label){
        let labelText = label.text;
        let color = label.color;
        let labelY = label.top?40:label.middle?lineHeight/2:label.bottom?lineHeight-10:40;
        let text = document.createElementNS(this.svgns,"text");
        item.appendChild(text);
        text.textContent = labelText;
        let distToEnd = Math.abs(x- this.screen.width());
        let distToStart = Math.abs(0 -x);
        let closeToStart = distToStart<distToEnd;
        text.setAttribute('x',closeToStart?x+this.oneDayPx:x-text.getBBox().width);
        text.setAttribute('y', labelY);
        text.setAttribute('style', `font-size:${this.fontSize}px;font-family: monospace, monospace;`);
        if(label.className){
          text.setAttribute('class', label.className);
        }
     }
     return item;
   }
 }
  class ScreenLayer extends SVGScreenLayers{
    constructor(args) {
      super(args);
      this.screen = $(`<svg class="screen-layer1" style=" -webkit-user-select: none; -ms-user-select: none;user-select: none;pointer-events: none; margin:0px; padding:0px; width:100%; height:100%;background-color:${this.background?this.background:"transparent"}; position:absolute; top:0px; left:0px;" ></svg>`);
      this.init();
    }
    showToday(){
      let roadMapStartTs = new Date(this.roadmapStartDate).getTime();
      let nDayPassed =((new Date().getTime()-roadMapStartTs)/(1000*60*60*24));
      let x = Math.round((nDayPassed*this.oneDayPx)/this.oneDayPx) * this.oneDayPx;
      this.todayLine =  this.drawTimeLine({
          x,
          label:{text:"Today",top:true, className:"today-label"},
          className:"today-line"
      });
    }
  }
  class ScreenEventLayer extends SVGScreenLayers{
    constructor(args) {
      super(args);
      this.screen = $(`<svg class="screen-event-layer" style=" -webkit-user-select: none; -ms-user-select: none;user-select: none;pointer-events: none; margin:0px; padding:0px; width:100%; height:100%;background-color:${this.background?this.background:"transparent"}; position:absolute; top:0px; left:0px;" ></svg>`);
      this.init();
    }
    drawTimeLine(args){
      this.clear();
      super.drawTimeLine(args);
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
      this.background = "white";
      this.labelColor = "lightblue";
      this.box = $(`<div class="meter-box" style="padding:0px; margin:0px;position:relative; width:${this.width}px; height:${this.height}px;"></div>`);
      this.screen = $(`<svg class="meter-screen" style=" -webkit-user-select: none; -ms-user-select: none;user-select: none;pointer-events: none;margin:0px; padding:0px; width:100%; height:100%;background-color:transparent; position:absolute; top:0px; left:0px;" ></svg>`);
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
      const showRepers =({text,from,to,y,screen})=>{
        for(let i =from; i<to; i+=this.oneDayPx){
          let rect = document.createElementNS(this.svgns,"rect");
          screen.appendChild(rect);
          let w = Math.round(this.oneDayPx/2.5);
          rect.setAttribute('x', i+( (this.oneDayPx/2) - Math.ceil(w/2)));
          rect.setAttribute('y', y+10);
          rect.setAttribute('width', w);
          rect.setAttribute('height', lineHeight-2);
          rect.setAttribute('style', `fill: ${color}; font-size:${this.fontSize}px;`);
          rect.setAttribute('class',"meter-repers");
        }
      }
      const showMonth= ({i,text,x,y,howManyDay})=>{
        let item = document.createElementNS(this.svgns,"text");
        let rect = document.createElementNS(this.svgns,"rect");
        screen.appendChild(item);
        screen.appendChild(rect);
        item.textContent = text;
        item.setAttribute('x',(x)+((howManyDay*this.oneDayPx)/2));
        item.setAttribute('y', y);
        item.setAttribute('style', `font-size:${this.fontSize}px;`);
        item.setAttribute('class',"meter-months");

        rect.setAttribute('x', x);
        rect.setAttribute('y', y+3);
        rect.setAttribute('width', this.oneDayPx);
        rect.setAttribute('height', lineHeight);
        rect.setAttribute('style', `font-size:${this.fontSize}px;`);
        rect.setAttribute('class',"meter-repers");
        showRepers({text,from:x+this.oneDayPx,y,to:(x+(howManyDay*this.oneDayPx)),screen});
      }
      const lastDay= ({x,y})=>{
        let rect = document.createElementNS(this.svgns,"rect");
        screen.appendChild(rect);
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', this.oneDayPx);
        rect.setAttribute('height', lineHeight);
        rect.setAttribute('style', `font-size:${this.fontSize}px;`);
        rect.setAttribute('class',"meter-repers");
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

  class RoadmapController {
    constructor({host,startDate,endDate}) {
      this.theme = "dark";
      this.roadmapStartDate =startDate;
      this.roadmapEndDate =endDate;
      this.unitHeight=20;
      this.oneDayPx = 5;
      this.host = host;
      this.sections = {};
      this.items = {};
      this.height = 700;
      this.scrollPadding = 10;
      let mapNday = (new Date(this.roadmapEndDate).getTime() - new Date(this.roadmapStartDate).getTime())/(1000*60*60*24);
      this.roadmapWidth = (mapNday+2)* this.oneDayPx;
      console.log("width", this.roadmapWidth/this.oneDayPx)
      this.init();
    }
    convertToDate({start, width}){
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
      let left = start;
      let roadMapStartTs = new Date(this.roadmapStartDate).getTime();
      let startNDayTs = (Math.ceil(left/this.oneDayPx)*(1000*60*60*24)) + roadMapStartTs;
      let endNDayTs = (Math.ceil((left+width)/this.oneDayPx)*(1000*60*60*24)) + roadMapStartTs;
      let w = Math.ceil((endNDayTs -startNDayTs)/(1000*60*60*24));
      let startDay = new Date(startNDayTs);
      let endDay = new Date(endNDayTs);
      let starDate = dateStr(startNDayTs);
      let endDate = dateStr(endNDayTs);
      return {starDate,endDate,str:`${starDate} to ${endDate} ${w} days`};
    }
    init(){
      this.mainContainer = $(`<div class="roadmap-main-container theme-${this.theme}" style="max-width:${this.roadmapWidth}px; margin:0 auto;"></div>`);
      this.host.append(this.mainContainer);
      this.topContainer = $(`<div style="width:100%;"></div>`);
      this.scrollArea = $(`<div class="roadmap-scroll-area" style="overflow:scroll; width:100%;  padding:0px; padding-bottom:${this.scrollPadding}px;"></div>`);
      this.renderArea = $(`<div class="roadmap-renderArea" style="padding:0px;margin:0; position:relative; width:${this.roadmapWidth}px;"></div>`);
      this.meterContainer = $(`<div class="roadmap-meter-container" style="padding:0px;width:100%;margin:0;"></div>`);
      this.mapsContainer = $(`<div class="roadmap-map-container" style="padding:0px;margin:0px;width:100%; height:${this.height -this.scrollPadding}px; overflow:scroll;"></div>`);
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
          if (evt.target?.classList?.contains('stretchable')) {
            let estDir = evt.target.classList.contains('stretchable-e');
            let westDir = evt.target.classList.contains('stretchable-w');
            const {screenX,screenY} = evt;
            let view = $(evt.target).parent(".map-items");
            let viewId = view.data("id");
            let controller = this.items[viewId];
            $(".map-item-selected").removeClass("map-item-selected");
            view.addClass("map-item-selected");
            let width = view.width(), left = view[0].offsetLeft;
            dragElement = {
              type:"stretchable",
              view:view,
              target:evt.target,
              startWidth:width,
              startLeft:left,
              startX:screenX,
              startY:screenY,
              left,
              width,
              controller,
              section:controller?.getSection(),
              dir:estDir?"e":"w"
            };
          }else if (evt.target?.classList?.contains('map-items')) {
            const {screenX,screenY} = evt;
            let view = $(evt.target);
            let viewId = view.data("id");
            let controller = this.items[viewId];
            $(".map-item-selected").removeClass("map-item-selected");
            view.addClass("map-item-selected");
            let width = view.width(), left = view[0].offsetLeft;
            dragElement = {
              type:"movable",
              view:view,
              startWidth:width,
              startLeft:left,
              startX:screenX,
              startY:screenY,
              left,
              width,
              controller,
              section:controller?.getSection(),
            };
          }
      }
      const drag =(evt)=>{
        const {screenX,screenY} = evt;
        if(dragElement){
          evt.preventDefault();
          let dist = screenX - dragElement.startX;
          dragElement.distanceX =screenX - dragElement.startX;
          dragElement.distanceX=Math.round(dragElement.distanceX/this.oneDayPx)*this.oneDayPx; //make it setp
          if(dragElement.type === "stretchable"){
            if(dragElement.dir === "e"){
              let newWidth = (dragElement.startWidth + dragElement.distanceX);
              if(newWidth>=1 && (dragElement.startLeft+ newWidth)<this.roadmapWidth){
                dragElement.view.css( "width", `${newWidth}px`);
                dragElement.width = newWidth;
                let newDates = dragElement.controller?.pixelsToMetric({left:parseInt(dragElement.view.css("left")),width:parseInt(dragElement.view.css("width"))});
                this.screenEventLayer.drawTimeLine({
                  x:(parseInt(dragElement.view.css("left"))+(newWidth-this.oneDayPx)),
                  label:{text:`${newDates.str}`, className:"moving-label", top:true},
                  className:"moving-lines"
                });
              }
            }else if (dragElement.dir === "w") {
              let newLeft = (dragElement.startLeft + dragElement.distanceX);
              let newWidth = (dragElement.startWidth - dragElement.distanceX);
              if(newLeft>=1 && newWidth>=1){
                dragElement.width = newWidth;
                dragElement.left = newLeft;
                dragElement.view.css({
                  left:`${newLeft}px`,
                  width:`${newWidth}px`
                });
                let newDates = dragElement.controller?.pixelsToMetric({left:parseInt(dragElement.view.css("left")),width:parseInt(dragElement.view.css("width"))});
                this.screenEventLayer.drawTimeLine({
                  x:(newLeft),
                  label:{text:`${newDates.str}`, className:"moving-label", top:true},
                  className:"moving-lines"
                });
              }
            }
          }else if (dragElement.type === "movable") {
            const {screenX,screenY} = evt;
            let newLeft = (dragElement.startLeft + dragElement.distanceX);
            if(newLeft>=1 && newLeft+dragElement.startWidth<this.roadmapWidth){
              dragElement.view.css({
                left:`${newLeft}px`
              });
              dragElement.left = newLeft;
              let newDates = dragElement.controller?.pixelsToMetric({left:parseInt(dragElement.view.css("left")),width:parseInt(dragElement.view.css("width"))});
              this.screenEventLayer.drawTimeLine({
                x:parseInt(dragElement.view.css("left")),
                label:{text:`${newDates.str}`, className:"moving-label", top:true},
                className:"moving-lines"
              });
            }
          }
        }else{
          let isStrechable  =evt.target?.classList?.contains('stretchable');
          let isMapItem= evt.target?.classList?.contains('map-items');

          if(isStrechable || isMapItem){
            let view = isStrechable?$(evt.target).parent(".map-items"):$(evt.target);
            let width = view.width(), left = view[0].offsetLeft, top=view[0].offsetTop;
            let viewId = view.data("id");
            let controller = this.items[viewId];
            let newDates = controller?.pixelsToMetric({left:left,width:width});
            this.screenEventLayer.drawTimeLine({
              x:left,
              height:30,
              width:width,
              label:{text:`${newDates.str}`, className:"hover-label", top:true},
              className:"hover-lines"
            });
          }else{
            this.screenEventLayer.clear();
          }
        }
      }
      const endDrag =(evt)=>{
        evt.preventDefault();
        evt.stopPropagation();
        if(dragElement){
          let controller = dragElement.controller;
          let section  = dragElement.section;
          let sectionController = this.sections[section];
          let newWidth =dragElement.width;
          let newLeft =dragElement.left;
          if(newLeft && newWidth){
            controller.updateMetrics({left:newLeft,width:newWidth});
            sectionController?.refresh();
          }
        }
        dragElement = null;
        this.screenEventLayer.clear();
      }
      let view = document;
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
        let {label,startDate,endDate,color} = items[i];
        let viewId = makeId();
        this.items[viewId] = new RoadMapItems({
          viewId:viewId,
          color:color,
          section:section,
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
      this.sections[section] = sectionController;
    }
  }
  exports.controller = RoadmapController;
})(typeof exports === "undefined" ? (this.Roadmap= {}) : exports);
