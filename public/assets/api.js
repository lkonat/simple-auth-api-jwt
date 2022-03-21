((exports) => {
  const hostName = `http://localhost:5000`;
  const tokenName = "x-auth-token";
  const storedUser = localStorage.getItem("user");
  let user=storedUser?JSON.parse(storedUser):false;
  let iEvents = {};
  const SELF = {
    TOKEN:localStorage.getItem(tokenName),
    setLogin:({token,user})=>{
      SELF.setUser(user);
      SELF.setToken(token);
    },
    on:(ev,call)=>{
      iEvents[ev] = call;
    },
    fireEvent:(ev,args)=>{
      if(iEvents[ev]){
        iEvents[ev](args);
      }
      return false;
    },
    setLogout:()=>{
      SELF.TOKEN = false;
      localStorage.removeItem(tokenName);
      SELF.fireEvent("logout");
    },
    setUser:(user)=>{
      user = user;
      if(user){
        localStorage.setItem("user", JSON.stringify(user));
      }else{
        localStorage.removeItem("user");
      }
    },
    setToken:(token)=>{
      if(token){
        SELF.TOKEN = token;
        localStorage.setItem(tokenName, SELF.TOKEN);
        console.log({setToken:SELF.TOKEN});
      }else{
        SELF.setLogout();
      }
    },
    getUser:()=>{
      return user;
    },
    login: ({email,password}) => {
      return new Promise(function (resolve, reject) {
        $.ajax({
          type: "POST",
          url: `${hostName}/api/auth/signin`,
          contentType: "application/json",
          data: JSON.stringify({
            email,
            password
          }),
        }).done((res) => {
            SELF.setLogin({
              token:res.token,
              user:res.user
           });
           return resolve(res);
        }).fail((err) => {
            localStorage.setItem(tokenName, null);
            return reject(err);
        });
      });
    },
    signup: ({name,email,password,password2}) => {
      return new Promise(function (resolve, reject) {
        $.ajax({
          type: "POST",
          url: `${hostName}/api/auth/signup`,
          contentType: "application/json",
          data: JSON.stringify({
            name,
            email,
            password,
            password2
          }),
        })
          .done((res) => {
            return resolve(res);
          })
          .fail((err) => {
            return reject(err);
          });
      });
    },
    getProfile: () => {
      return new Promise(function (resolve, reject) {
        if(!SELF.token){
            return reject("user not authed");
        }
        $.ajax({
          type: "GET",
          url: `${hostName}/api/auth`,
          contentType: "application/json",
          headers:{"x-auth-token":SELF.TOKEN},
        }).done((res) => {
            return resolve(res);
        }).fail((err) => {
            return reject(err);
        });
      });
    },
    createSpace: ({spaceName}) => {
      return new Promise(function (resolve, reject) {
        $.ajax({
          type: "POST",
          url: `${hostName}/api/app/space`,
          contentType: "application/json",
          headers:{"x-auth-token":SELF.TOKEN},
          data: JSON.stringify({spaceName}),
        })
          .done((res) => {
            return resolve(res);
          })
          .fail((err) => {
            return reject(err);
          });
      });
    },
    testAuth: () => {
      return new Promise(function (resolve, reject) {
        $.ajax({
          type: "GET",
          url: `${hostName}/api/dashboard`,
          contentType: "application/json",
          headers:{"x-auth-token":SELF.TOKEN}
        }).done((res) => {
            return resolve(res);
        }).fail((err) => {
            return reject(err);
        });
      });
    },
    getSpaces: () => {
      return new Promise(function (resolve, reject) {
        console.log({token:SELF.TOKEN});
        $.ajax({
          type: "GET",
          url: `${hostName}/api/app/spaces`,
          contentType: "application/json",
          headers:{"x-auth-token":SELF.TOKEN}
        }).done((res) => {
            return resolve(res);
        }).fail((err) => {
            return reject(err);
        });
      });
    },
   createFolder: ({inFolderId,folderName,spaceId}) => {
      return new Promise(function (resolve, reject) {
        $.ajax({
          type: "POST",
          url: `${hostName}/api/app/folder`,
          contentType: "application/json",
          headers:{"x-auth-token":SELF.TOKEN},
          data: JSON.stringify({inFolderId,folderName,spaceId})
        }).done((res) => {
            return resolve(res);
        }).fail((err) => {
            return reject(err);
        });
      });
    },
    createFlashcard: ({inFolderId,cardName,spaceId}) => {
       return new Promise(function (resolve, reject) {
         $.ajax({
           type: "POST",
           url: `${hostName}/api/app/flashcard`,
           contentType: "application/json",
           headers:{"x-auth-token":SELF.TOKEN},
           data: JSON.stringify({inFolderId,cardName,spaceId})
         }).done((res) => {
             return resolve(res);
         }).fail((err) => {
             return reject(err);
         });
       });
     },
     createFlashcardcard: ({flashcardId,cardTitle,cardType}) => {
        return new Promise(function (resolve, reject) {
          $.ajax({
            type: "POST",
            url: `${hostName}/api/app/flashcard/card`,
            contentType: "application/json",
            headers:{"x-auth-token":SELF.TOKEN},
            data: JSON.stringify({flashcardId,cardTitle,cardType})
          }).done((res) => {
              return resolve(res);
          }).fail((err) => {
              return reject(err);
          });
        });
      },
    getSpaceItems: ({spaceId}) => {
       return new Promise(function (resolve, reject) {
         $.ajax({
           type: "GET",
           url: `${hostName}/api/app/space/${spaceId}`,
           contentType: "application/json",
           headers:{"x-auth-token":SELF.TOKEN}
         }).done((res) => {
             return resolve(res);
         }).fail((err) => {
             return reject(err);
         });
       });
     },
     getFlashcardCards: ({spaceId,itemId}) => {
        return new Promise(function (resolve, reject) {
          $.ajax({
            type: "POST",
            url: `${hostName}/api/app/flashcard/cards`,
            contentType: "application/json",
            headers:{"x-auth-token":SELF.TOKEN},
            data: JSON.stringify({spaceId,itemId})
          }).done((res) => {
              return resolve(res);
          }).fail((err) => {
              return reject(err);
          });
        });
      },
      getCard: ({cardId}) => {
         return new Promise(function (resolve, reject) {
           $.ajax({
             type: "GET",
             url: `${hostName}/api/app/flashcard/card/${cardId}`,
             contentType: "application/json",
             headers:{"x-auth-token":SELF.TOKEN}
           }).done((res) => {
               return resolve(res);
           }).fail((err) => {
               return reject(err);
           });
         });
       },
       getItemContent: ({itemId}) => {
          return new Promise(function (resolve, reject) {
            $.ajax({
              type: "GET",
              url: `${hostName}/api/app/space/item/${itemId}`,
              contentType: "application/json",
              headers:{"x-auth-token":SELF.TOKEN}
            }).done((res) => {
                return resolve(res);
            }).fail((err) => {
                return reject(err);
            });
          });
        },
        updateCard: ({cardId,cardType,changes}) => {
           return new Promise(function (resolve, reject) {
             $.ajax({
               type: "PUT",
               url: `${hostName}/api/app/flashcard/card`,
               contentType: "application/json",
               headers:{"x-auth-token":SELF.TOKEN},
               data: JSON.stringify({cardId,cardType,changes})
             }).done((res) => {
                 return resolve(res);
             }).fail((err) => {
                 return reject(err);
             });
           });
         },
         updateItem: ({spaceId,itemId,changes}) => {
            return new Promise(function (resolve, reject) {
              $.ajax({
                type: "PUT",
                url: `${hostName}/api/app/space/item`,
                contentType: "application/json",
                headers:{"x-auth-token":SELF.TOKEN},
                data: JSON.stringify({spaceId,itemId,changes})
              }).done((res) => {
                  return resolve(res);
              }).fail((err) => {
                  return reject(err);
              });
            });
          },
          deleteItem: ({spaceId,itemId}) => {
             return new Promise(function (resolve, reject) {
               $.ajax({
                 type: "DELETE",
                 url: `${hostName}/api/app/space/item`,
                 contentType: "application/json",
                 headers:{"x-auth-token":SELF.TOKEN},
                 data: JSON.stringify({spaceId,itemId})
               }).done((res) => {
                   return resolve(res);
               }).fail((err) => {
                   return reject(err);
               });
             });
           },
       createSpaceItem: ({spaceId,parentId,folder,flashcard,flashcardCard}) => {
          return new Promise(function (resolve, reject) {
            $.ajax({
              type: "POST",
              url: `${hostName}/api/app/space/item`,
              contentType: "application/json",
              headers:{"x-auth-token":SELF.TOKEN},
              data: JSON.stringify({spaceId,parentId,folder,flashcard,flashcardCard})
            }).done((res) => {
                return resolve(res);
            }).fail((err) => {
                return reject(err);
            });
          });
        },
        getSpaceItem: ({spaceId,itemId}) => {
           return new Promise(function (resolve, reject) {
             $.ajax({
               type: "POST",
               url: `${hostName}/api/app/space/item/info`,
               contentType: "application/json",
               headers:{"x-auth-token":SELF.TOKEN},
               data: JSON.stringify({spaceId,itemId})
             }).done((res) => {
                 return resolve(res);
             }).fail((err) => {
                 return reject(err);
             });
           });
         },
         getSpaceItemChilds: ({spaceId,itemId,orderBy}) => {
            return new Promise(function (resolve, reject) {
              $.ajax({
                type: "POST",
                url: `${hostName}/api/app/space/item/childs`,
                contentType: "application/json",
                headers:{"x-auth-token":SELF.TOKEN},
                data: JSON.stringify({spaceId,itemId,orderBy})
              }).done((res) => {
                  return resolve(res);
              }).fail((err) => {
                  return reject(err);
              });
            });
          },

  };
  $.ajaxSetup({
    beforeSend: function (send) {
      console.log("send",send);
    },
    complete: function (done) {
       if (done.status === 304 || done.status===401 || done.status ===403) {
        SELF.setLogout();
      }
    }
  });
  exports.on = SELF.on;
  exports.signup = SELF.signup;
  exports.login=SELF.login;
  exports.testAuth=SELF.testAuth;
  exports.getSpaces = SELF.getSpaces;
  exports.createSpace = SELF.createSpace;
  exports.setUser = SELF.setUser;
  exports.getUser = SELF.getUser;
  exports.getProfile = SELF.getProfile;
  exports.createFolder = SELF.createFolder;
  exports.getSpaceItems = SELF.getSpaceItems;
  exports.createFlashcard = SELF.createFlashcard;
  exports.createFlashcardcard = SELF.createFlashcardcard;
  exports.getFlashcardCards = SELF.getFlashcardCards;
  exports.getCard = SELF.getCard;
  exports.getItemContent = SELF.getItemContent;
  exports.updateCard = SELF.updateCard;

  exports.getSpaceItem  = SELF.getSpaceItem;
  exports.getSpaceItemChilds = SELF.getSpaceItemChilds;
  exports.createSpaceItem = SELF.createSpaceItem;
  exports.updateItem = SELF.updateItem;
  exports.deleteItem = SELF.deleteItem;
})(typeof exports === "undefined" ? (this.APIService = {}) : exports);
