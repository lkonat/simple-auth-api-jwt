((exports)=>{
  class SvgElements {
    constructor(args) {
      this.id = args.id;
      this.cEvents = {};
      this.states = {...args};
      this.svgns = "http://www.w3.org/2000/svg";
      this.host = args.host?args.host:false;
      if(this.host){
        this.init();
      }
    }
    setHost(host){
      this.host = host;
      this.init();
      this.render();
    }
    init(){
      //will init
    }
    setStates(states){
      this.states = {...this.states,...states};
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
    highlight(){

    }
  }


  class Circle extends SvgElements{
    constructor(args) {
      super(args);
    }
    init(){
      if(this.item){
        $(this.item).remove();
      }
      this.item = document.createElementNS(this.svgns, 'circle');
      this.item.classList?.add("selectable");
      this.item.setAttribute('id',this.id);
      this.item.classList.add("draggable");
      this.host.appendChild(this.item);
      this.item.addEventListener("click",(e)=>{
        e.stopPropagation();
        this.fireEvent("click",this);
      });
    }
    getPos(){
      return{
        x:this.item.getAttribute("cx"),
        y:this.item.getAttribute("cy")
      };
    }
    render(){
       const {x,y,r,id,style} = this.states;
       // this.item.setAttribute('id',id);
       this.item.setAttribute('cx', x);
       this.item.setAttribute('cy', y);
       this.item.setAttribute('r', r);
       this.item.setAttribute('style', style);
    }
    highlight(){
      let selected =this.item.classList.contains("selected");
      if(!selected){
          this.item.classList?.add("selected");
      }
    }
  }

  class Rect extends SvgElements{
    constructor(args) {
      super(args);
    }
    init(){
      if(this.item){
        $(this.item).remove();
      }

      this.item = document.createElementNS(this.svgns, 'rect');
      this.host.appendChild(this.item);
      this.group = document.createElementNS(this.svgns,"g");
      this.text = document.createElementNS(this.svgns,"text");
      this.host.appendChild(this.text);
      // this.rect = document.createElementNS(this.svgns, 'rect');
      // this.group.appendChild(this.text);
      // // this.group.appendChild(this.rect);
      // this.item.appendChild(this.group);

      this.str = "This is the root text";
      this.item.classList?.add("selectable");
      this.item.setAttribute('id',this.id);
      this.item.classList.add("draggable");
      this.text.textContent = this.str;
      this.item.addEventListener("click",(e)=>{
        e.stopPropagation();
        this.fireEvent("click",this);
      });
    }
    getPos(){
      return{
        x:this.item.getAttribute("x"),
        y:this.item.getAttribute("y")
      };
    }
    render(){
       let {x,y,width,height,style} = this.states;
       let text = this.str;
       let textDim = text.length*7;
       width = textDim;
       this.item.setAttribute('x', x);
       this.item.setAttribute('y', y);
       this.item.setAttribute('width', width);
       this.item.setAttribute('height', height);
       this.item.setAttribute('rx', 20);
       this.item.setAttribute('style', style);

       this.text.setAttribute('x', x);
       this.text.setAttribute('y', y+(height/2));
       this.text.setAttribute('style', 'fill: black; stroke:black; stroke-width: 1px;');

    }
    highlight(){
      let selected =this.item.classList.contains("selected");
      if(!selected){
          this.item.classList?.add("selected");
      }
    }
  }
  class Line extends SvgElements{
    constructor(args) {
      super(args);
    }
    init(){
      if(this.item){
        $(this.item).remove();
      }
      this.g = document.createElementNS(this.svgns,"g");
      this.text=document.createElementNS(this.svgns,"text");
      this.item = document.createElementNS(this.svgns, 'line');
      this.item.classList?.add("selectable");
      // this.item.classList.add("draggable");
      this.item.setAttribute('id',this.id);
        this.host.appendChild(this.g);
      this.g.appendChild(this.item);
      this.g.appendChild(this.text);
      this.g.setAttribute('style', 'fill: white; stroke:grey; stroke-width: 1px;');
      this.text.setAttribute('style', 'fill: red;');
      this.text.textContent = this.id;
      this.item.addEventListener("click",(e)=>{
        e.stopPropagation();
        this.fireEvent("click",this);
      });
    }
    render(){
       const {x1,y1,x2,y2,id,style} = this.states;
       this.item.setAttribute('id',id);
       this.item.setAttribute('x1', x1);
       this.item.setAttribute('y1', y1);

       this.item.setAttribute('x2', x2);
       this.item.setAttribute('y2', y2);
       this.item.setAttribute('style', style);

       // this.g.setAttribute('x', x2-20);
       // this.g.setAttribute('y', y2-10);

       this.text.setAttribute('x', x2-20);
       this.text.setAttribute('y', y2-10);
    }
    highlight(){
      let selected =this.item.classList.contains("selected");
      if(!selected){
          this.item.classList?.add("selected");
      }
    }
  }

  class Node {
    constructor({data,x,y,id}) {
      this.id = id;
      this.states = {...data,x:x,y:y,id};
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
    init(){
      this.view = new Circle({id:this.id,host:this.host,x:0,y:0,r:10,style:'fill: white; stroke: dodgerblue; stroke-width: 3px;z-index:1;cursor:pointer;'});
      this.view.on("click",()=>{
        this.fireEvent("click",this);
      });
      this.render();
    }
    getPos(){
      return this.view.getPos();
    }
    setStates(states){
      this.states = {...this.states,...states};
      this.render();
    }
    setHost(host){
      this.host = host;
      this.init();
    }
    addChild(node){
      if(!this.childs){
        this.childs = [];
      }
      this.childs.push(node);
    }
    highlight(){
      if(this.view){
        this.view.highlight();
      }
    }
    render(){
      this.view?.setStates(this.states);
    }
  }


  // class Node {
  //   constructor({data,x,y,id}) {
  //     this.id = id;
  //     this.states = {...data,x:0,y:0,width:100,height:30};
  //     this.cEvents = {};
  //   }
  //   on(ev,call){
  //     this.cEvents[ev]= call;
  //   }
  //   fireEvent(ev,args){
  //     if(this.cEvents[ev]){
  //       this.cEvents[ev](args);
  //     }
  //   }
  //   init(){
  //     this.view = new Rect({id:this.id,host:this.host,x:0,y:0,width:100,height:30,style:'fill: white; stroke: dodgerblue; stroke-width: 3px;z-index:1;cursor:pointer;'});
  //     this.view.on("click",()=>{
  //       this.fireEvent("click",this);
  //     });
  //     this.render();
  //   }
  //   getPos(){
  //     return this.view.getPos();
  //   }
  //   setStates(states){
  //     this.states = {...this.states,...states};
  //     this.render();
  //   }
  //   setHost(host){
  //     this.host = host;
  //     this.init();
  //   }
  //   addChild(node){
  //     if(!this.childs){
  //       this.childs = [];
  //     }
  //     this.childs.push(node);
  //   }
  //   highlight(){
  //     if(this.view){
  //       this.view.highlight();
  //     }
  //   }
  //   render(){
  //     this.view?.setStates(this.states);
  //   }
  // }


  class Edge {
    constructor({id,from,to}) {
      this.from = from;
      this.to = to;
      this.id = id;
      this.cEvents = {};
      this.states ={};
    }
    on(ev,call){
      this.cEvents[ev]= call;
    }
    fireEvent(ev,args){
      if(this.cEvents[ev]){
        this.cEvents[ev](args);
      }
    }
    init(){
      this.view = new Line({id:this.id,host:this.host,style:'stroke:grey;stroke-width:1;z-index:0;'});
      this.view.on("click",()=>{
        this.fireEvent("click",this);
      });
      this.render();
    }
    setStates(states){
      this.states = {...this.states,...states};
      this.render();
    }
    setHost(host){
      this.host = host;
      this.init();
    }
    addChild(node){
      if(!this.childs){
        this.childs = [];
      }
      this.childs.push(node);
    }
    highlight(){
      if(this.view){
        this.view.highlight();
      }
    }
    render(){
      let A = this.from.getPos();
      let B = this.to.getPos();
      let w = 7;
      let y1=parseInt(A.y),y2=parseInt(B.y),x1=parseInt(A.x),x2=parseInt(B.x);
      if((x1+w)<x2){
        x2 =x2-w;
        x1 = x1+w;
      }else if ((x1-w) >x2) {
        x2 =x2+w;
        x1 = x1-w;
      }

      if((y1+w)<y2){
        y2 =y2-w;
        y1 = y1+w;
      }else if ((y1-w) >y2) {
        y2 =y2+w;
        y1 = y1-w;
      }
      this.view?.setStates({x1,y1,x2,y2,id:this.id});
    }
  }



  class Controller {
    constructor({host}) {
      this.host = host;
      this.states = {};
      this.cEvents ={};
      this.root =false;
      this.nodes = {};
      this.edges ={};
      this.svgns = "http://www.w3.org/2000/svg";
      this.init();
    }
    setStates(states){
      this.states = {...this.states,...states};
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

    pan(dx, dy) {
      this.transformMatrix[4] += dx;
      this.transformMatrix[5] += dy;

      var newMatrix = "matrix(" +  this.transformMatrix.join(' ') + ")";
      this.svg.setAttributeNS(null, "transform", newMatrix);
    }
    zoom(e) {
        e.stopPropagation();

        let delta = e.wheelDelta,
            container = document.querySelector('svg .main-container'),
            scaleStep = delta > 0 ? 1.25 : 0.8;

        if (scale * scaleStep > maxScale) {
            scaleStep = maxScale / scale;
        }

        if (scale * scaleStep < minScale) {
            scaleStep = minScale / scale;
        }

        scale *= scaleStep;

        let box = svg.getBoundingClientRect();
        let point = svg.createSVGPoint();
        point.x = e.clientX - box.left;
        point.y = e.clientY - box.top;

        let currentZoomMatrix = container.getCTM();

        point = point.matrixTransform(currentZoomMatrix.inverse());

        let matrix = svg.createSVGMatrix()
            .translate(point.x, point.y)
            .scale(scaleStep)
            .translate(-point.x, -point.y);


        let newZoomMatrix = currentZoomMatrix.multiply(matrix);
        container.transform.baseVal.initialize(svg.createSVGTransformFromMatrix(newZoomMatrix));

        console.log("scale", scale);
        let t = newZoomMatrix;
        console.log("zoomMatrix", t.a, t.b, t.c, t.d, t.e, t.f);
    }
    init(){
      this.container = $(`<div style="width:1000px; height:500px;border:1px solid blue;overflow:hidden;"></div>`);
      this.host.append(this.container);
      this.menu = $(`<div style="display:flex; flex-direction:row; gap:5px;"></div>`);
      let svg = $(`<svg style=" width:100%; height:100%;background-color:lightgrey; border:1px solid red;" ></svg>`);
      this.container.append(this.menu,svg);
      let zoomIn = $(`<span>In </span>`);
      let zoomOut = $(`<span>Out</span>`);
      this.menu.append(zoomIn,zoomOut);
      zoomIn.click((e)=>{
        e.stopPropagation();
        // svg[0].setAttribute("viewport","100 0 100 100");
        // let view = svg[0].getAttribute("viewport");
        // console.log(view);
        this.zoom(0.9);
      });
      zoomOut.click((e)=>{
        e.stopPropagation();
        this.zoom(1.1);
      });
      let group= document.createElementNS(this.svgns, 'g');
      // group.setAttribute('width', 100);
      // group.setAttribute('height', height);
      // group.setAttribute("transform","matrix(1 0 0 1 0 0)");
      svg[0].appendChild(group);
      this.svg = group;
      // this.svg = svg[0];

      this.transformMatrix = [1, 0, 0, 1, 0, 0];
      let dragCount = 0;
      let offset = false;
      let transform = false;
      const startDrag = (evt)=>{
        if (evt.target.classList.contains('draggable')) {
          this.movingElement = evt.target;
          offset = getMousePosition(evt);
          // Get all the transforms currently on this element
          let transforms = this.movingElement.transform.baseVal;
          // Ensure the first transform is a translate transform
          if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
            // Create an transform that translates by (0, 0)
            var translate = svg[0].createSVGTransform();
            translate.setTranslate(0, 0);
            // Add the translation to the front of the transforms list
            this.movingElement.transform.baseVal.insertItemBefore(translate, 0);
          }
          // Get initial translation amount
          transform = transforms.getItem(0);
          offset.x -= transform.matrix.e;
          offset.y -= transform.matrix.f;
          // let id = evt.target.getAttribute("id");
          // if(id && this.nodes[id]){
          //   this.movingElement = this.nodes[id];
          //   offset = getMousePosition(evt);
          //   offset.x -= parseFloat(evt.target.getAttribute("cx"));
          //   offset.y -= parseFloat(evt.target.getAttribute("cy"));
          //   this.setCurrentNode(this.movingElement);
          //   dragCount = 0;
          // }
        }else if(!evt.target?.classList?.contains('selectable')){
          if(this.currentNode){
            // console.log(this.currentNode);
            const {offsetX,offsetY} = evt;
            let id = new Date().getTime();
            this.createNode({data:{id:id,name:id},id,x:offsetX,y:offsetY});
            this.createEdge({fromId:this.currentNode.id,toId:id});
          }
          this.setCurrentNode(false);
          this.fireEvent("click",evt);
        }
      }
      const getMousePosition = (evt)=>{
        var CTM = svg[0].getCTM();
        let scaleT = this.zoomScale?this.zoomScale:1;
        return {
          x: (evt.clientX - ((CTM.e) / CTM.a)),
          y: (evt.clientY - ((CTM.f) / CTM.d))
        };

        // return {
        //   x: (evt.clientX) ,
        //   y: (evt.clientY)
        // };
      }
      const drag = (evt)=>{
        if (this.movingElement) {
          evt.preventDefault();
          var coord = getMousePosition(evt);
          console.log(coord);
          console.log(offset.x, offset.y);
          let scaleT = this.zoomScale?this.zoomScale:1;
          transform.setTranslate((coord.x - offset.x)/scaleT, (coord.y - offset.y)/scaleT);
        }

        // if (this.movingElement) {
        //   evt.preventDefault();
        //   dragCount++;
        //   if(dragCount>10){
        //     const {offsetX,offsetY} = evt;
        //     // let id = this.selectedElement.getAttribute("id");
        //     var coord = getMousePosition(evt);
        //     this.movingElement.setStates({x:coord.x - offset.x,y:coord.y - offset.y});
        //     // let id = this.selectedElement.getAttribute("id");
        //     for(let elt in this.edges){
        //       if(this.edges[elt].from == this.movingElement || (this.edges[elt].to == this.movingElement) ){
        //         this.edges[elt].render();
        //       }
        //     }
        //     // this.selectedElement.setAttribute("cx", offsetX);
        //     // this.selectedElement.setAttribute("cy", offsetY);
        //   }
        // }else{
        //   // this.pan("left");
        // }
      }
      const endDrag = (evt)=>{
        dragCount =0;
        evt.preventDefault();
        evt.stopPropagation();
        // if(this.movingElement){
        //   this.setCurrentNode(this.movingElement);
        // }
        this.movingElement = null;
      }
      let view =document;
      // this.svg[0]
      view.addEventListener('mousedown', startDrag);
      view.addEventListener('mousemove', drag);
      view.addEventListener('mouseup', endDrag);
      view.addEventListener('mouseleave', endDrag);
      view.addEventListener("wheel", (e)=>{
        this.zoom(e);
        // let {wheelDelta,wheelDeltaX,wheelDeltaY} = e;
        // if(wheelDelta>0){
        //   // this.pan(5,0);
        //   // this.zoom(5)
        // }else{
        //   // this.pan(-5,0);
        //   // this.zoom(-0.5)
        // }
        // this.zoom(wheelDelta>0?"out":"in");
        // this.pan(wheelDelta>0?"left":"right")
        // console.log({wheelDelta,wheelDeltaX,wheelDeltaY} );
      });
      view.addEventListener("click",(e)=>{
        // if(!e.target?.classList?.contains('selectable')){
        //   console.log(e);
        //   this.setCurrentNode(false);
        //   this.fireEvent("click",e);
        // }
        // this.zoom(1.2)
      });

    }
    clearSelection(){
      let elts = $(this.svg).find(".selected");
      for(let i=0; i< elts.length; i++){
          elts[i].classList.remove("selected");
      }
      this.currentNode = false;
    }
    setCurrentNode(node){
      this.clearSelection();
      this.currentNode = node;
      if(this.currentNode){
        this.currentNode.highlight();
      }
    }
    addItem({node,edge}){
      let item = false;
      if(node){
        item = new Node({id:node.id,data:node.data,x:node.x,y:node.y});
      }else if (edge) {
        item = new Edge({id:edge.id,from:edge.from, to:edge.to});
      }
      if(item){
        item.setHost(this.svg);
        item.on("click",(elt)=>{
          if(this.currentNode!== item){
            this.setCurrentNode(item);
          }
        });
      }
      return item;
    }
    render(){
      // let circle = new Circle({host:this.svg[0]});
      // circle.setStates({x:75,y:75,r:50,style:'fill: none; stroke: blue; stroke-width: 1px;'});
    }
    createEdge({fromId,toId}){
      let id = `${fromId}-${toId}`;
      this.edges[id] = this.addItem({edge:{id:id,from:this.nodes[fromId], to:this.nodes[toId]}});
      this.nodes[fromId].addChild({id:toId});
    }
    createNode({data,id,x,y}){
      this.nodes[id] = this.addItem({node:{id:id,data:data,x:x,y:y}});
    }
    createRoot({id}){
      this.root = this.nodes[id];
    }
    tree({data}){
      for(let i =0; i< data.length; i++){
        let item = data[i];
        this.createNode({
          data:data[i],
          id:item.id,
          x:(i+1)*25,
          y:(i+1)*25
        });
      };
      for(let i =0; i< data.length; i++){
        let item = data[i];
        if(!item.parentId){
          if(this.root){
            throw new Error("cannot have two roots");
          }else {
            this.createRoot({id:item.id})
          }
        }else{
          if(this.nodes[item.parentId] && this.nodes[item.id]){
              this.createEdge({fromId:item.parentId,toId:item.id});
          }
        }
      }
      console.log(this.nodes,this.root,this.edges);
    }
  }
  exports.map = Controller;
})(typeof exports === "undefined" ? (this.Mind= {}) : exports);
