class LoginView {
  constructor({host}) {
    this.host = host;
    this.cEvents = {};
    this.data = {};
    this.mainBox= $(`<div style="display:table; margin:0 auto; min-width:400px; min-height:300px;position:relative;border:1px solid lightgrey; padding:7px;"></div>`);
    this.host.append(this.mainBox);
    this.renderView();
  }
  on(ev,call){
    this.cEvents[ev]= call;
  }
  fireEvent(ev,args){
    if(this.cEvents[ev]){
      this.cEvents[ev](args);
    }
  }
  submit(args){
    this.fireEvent("submit",args);
  }
  renderView(){
    this.mainBox.empty();
    let form  = $(`<form  style="min-width:300px; min-height:300px;"></form>`);
    this.mainBox.append(form);
    this.userEmailLabel = $(`<label for="uemail"><b>Email</b></label>`);
    this.userEmailInput = $(`<input type="text" placeholder="Enter email" name="uemail" required ${this.data.email?`value="${this.data.email}"`:""} style="width:90%; height:30px;">`);
    this.passwordLabel = $(`<label for="psw"><b>Password</b></label>`);
    this.passwordInput = $(`<input type="password" placeholder="Enter Password" name="psw" required ${this.data.password?`value="${this.data.password}"`:""}  style="width:90%; height:30px; ">`);
    this.submitBtn = $(`<button type="submit"  style="width:100%;">Login</button>`);
    this.overLay = $(`<div style="position:absolute; top:0px; left:0px; width:100%; height:100%;"></div>`);
    form.append(this.userEmailLabel,`<br>`,this.userEmailInput,`<br>`,`<br>`,this.passwordLabel,`<br>`,this.passwordInput,`<br><br><br>`,this.submitBtn);
    form.on("submit",(e)=>{
      e.preventDefault();
      e.stopPropagation();
      this.submit({
        email:this.userEmailInput.val(),
        password:this.passwordInput.val()
      });
    });
  }
}

class SpacesPage extends Navigation.Page {
  constructor(args) {
    super(args);
  }
  render(){
    this.view.empty();
    let props = this.props;
    let taskId = this.props?.url?.params?.id;
    let addNewSpace = $(`<div>Add new space</div>`);
    this.view.append(addNewSpace);
    addNewSpace.click(()=>{
      let spaceName = prompt("Space name?");
      if(spaceName.length>=0){
        APIService.createSpace({spaceName:spaceName}).then((spaces)=>{
            console.log("CREATE",{spaces});
            this.render();
        }).catch((error)=>{
            console.log(error);
        });
      }
    });
    APIService.getSpaces().then((res)=>{
      let spaces = res.spaces;
      if(spaces){
        for(let i =0; i<spaces.length; i++){
          let one = $(`<a href="/space/${spaces[i].space_id}">${spaces[i].space_name}</a>`);
          this.view.append("<br>",one);
        }
      }
      console.log("spaces",spaces);
    }).catch((error)=>{
        console.log(error);
    });
  }
}



class SpaceItems {
  constructor() {
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
  render(){

  }
}
class SpaceFolder extends SpaceItems{
  constructor({host,data}) {
    super();
     this.host = host;
     this.cEvents = {};
     this.data = data;
     this.render();
  }
  render(){
    let box = $(`<div style="display:grid; grid-template-rows:auto; grid-template-columns:max-content max-content auto; grid-row-gap:3px;"></div>`);
    this.host.append(box);
    let arraowView = $(`<div></div>`);
    let iconView = $(`<div><i class="fa fa-folder" aria-hidden="true"></i></div>`);
    let nameView = $(`<div>${this.data?.item_name}</div>`);
    box.append(arraowView,iconView,nameView);
    nameView.click((e)=>{
      e.stopPropagation();
      this.fireEvent(`select`,this.data);
    });
  }
}
class FlashCard extends SpaceItems{
  constructor({host,data}) {
    super();
     this.host = host;
     this.cEvents = {};
     this.data = data;
     this.render();
  }
  render(){
    let box = $(`<div style="display:grid; grid-template-rows:auto; grid-template-columns:max-content max-content auto; grid-row-gap:3px;"></div>`);
    this.host.append(box);
    let arraowView = $(`<div></div>`);
    let iconView = $(`<div>*</div>`);
    let nameView = $(`<div>${this.data?.item_name}</div>`);
    nameView.click((e)=>{
      e.stopPropagation();
      this.fireEvent(`select`,this.data);
    });
    box.append(arraowView,iconView,nameView);
  }
}










class SpaceFolderManager {
  constructor({host}) {
    this.host = host;
    this.container = $(`<div></div>`);
    this.host.append(this.container);
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
    if(items[i].item_type==="folder"){
      controller = new SpaceFolder({host:itemsArea,data:items[i]});
    }else if (items[i].item_type==="flashcard") {
      controller = new FlashCard({host:itemsArea,data:items[i]});
    }
    if(controller){
      controller.on("select",(data)=>{
        showBoard(data);
      });
    }
  }
}
class SpacePage extends Navigation.Page {
  constructor(args) {
    super(args);
  }
  render(){
    this.view.empty();
    let div = $(`<div style="width:100%; height:100%; display:grid; grid-template-rows:auto; grid-template-columns:max-content auto;"></div>`);
    let itemsArea = $(`<div style="width:100%;height:100%; padding:10px; border:1px solid lightgrey;"></div>`);
    let boardArea = $(`<div style="width:100%;height:100%;"></div>`);
    div.append(itemsArea,boardArea);
    this.view.append(div);
    let props = this.props;
    let taskId = this.props?.url?.params?.id;
    let spaceId = props.url.params.spaceId;
    console.log({spaceId});
    console.log(props);
    let addFolder = $(`<div style="color:dodgerblue;">Add Folder</div>`);
    let addFlashCard = $(`<div style="color:dodgerblue;">Add FlashCard</div>`);
    itemsArea.append(addFolder,addFlashCard);
    const folderManager = new FolderManager.manager({host:itemsArea});
    folderManager.on("select",async(item)=>{
      if(item.item_type==="flashcard"){
        boardArea.empty();
        try {
          let content = await APIService.getFlashcardCards({spaceId:item.space_id,itemId:item.item_id});
          let items = content.items;
          if(items){
            let flashCardView = new FlashCardView.Board({host:boardArea,data:item,cards:content.items});
          }else {
            throw new Error("could not get items");
          }
        } catch (e) {
          console.log(e);
        }
      }else if (item.item_type==="folder") {
        try {
          let content = await APIService.getSpaceItemChilds({spaceId:item.space_id,itemId:item.item_id});
          let items = content.items;
          if(items){
            for(let i =0; i< items.length; i++){
              folderManager.addItem({parentId:items[i].parent_id,item:items[i]});
            }
          }else{
            throw new Error("could not get items");
          }
        } catch (e) {
          console.log(e);
        }
      }
    });
    APIService.getSpaceItems({
      spaceId:spaceId
    }).then((res)=>{
      let items = res.items;
      for (let i =0; i< items.length; i++){
        folderManager.addItem({item:items[i]});
      }
      console.log("get items",res);
    }).catch((e)=>{
      console.log(e);
    });


    addFolder.click((e)=>{
      let name = prompt("name?");
      if(name.length>=0){
        APIService.createSpaceItem({
          spaceId:spaceId,
          parentId:`af085337-8af8-454d-bd56-53c8d2339e3b`,
          folder:{
            item_name:name
          }
          // flashcard:{
          //   item_name:name
          // },
          // flashcardCard:{
          //   item_name:name,
          //   card_type:"basic",
          //   text:`Hello world`
          // }
        }).then((res)=>{
          console.log("ADDED SPACE ITEMS",res);
        }).catch((e)=>{
          console.log(e);
        });
      }
    });
    addFlashCard.click((e)=>{
      let name = prompt("name?");
      if(name.length>=0){
        APIService.createSpaceItem({
          spaceId:spaceId,
          parentId:false,
          flashcard:{
            item_name:name
          },
        }).then((res)=>{
          console.log("ADDED SPACE ITEMS",res);
        }).catch((e)=>{
          console.log(e);
        });
      }
    });
  }
}




class CardPage extends Navigation.Page {
  constructor(args) {
    super(args);
  }
  render(){
    this.view.empty();
    let props = this.props;
    let taskId = this.props?.url?.params?.id;
  }
}

class LoginPage extends Navigation.Page {
  constructor(args) {
    super(args);
  }
  render(){
    this.view.empty();
    let props = this.props;
    let taskId = this.props?.url?.params?.id;
    const loginView =  new LoginView({host:this.view});
    loginView.on("submit",(args)=>{
      APIService.login({
        email:args.email,
        password:args.password
      }).then((success)=>{
          console.log(success);
          if(success.user){
            APIService.setUser(success.user);
          }
      }).catch((error)=>{
          console.log(error);
      });
    });
  }
}
