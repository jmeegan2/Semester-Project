const APIController = (function() {
    
    const clientId = 'ef53c75aef224ecfb4561d66af9dbf4d';
    const clientSecret = '26a509250cd74f00b3a490eda8e39fc7';


    // private methods
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }
    
    const _getRecommendation = async (token, genresRecommend) => {
        const limit = 1;
        const result = await fetch(`https://api.spotify.com/v1/recommendations?limit=${limit}&market=ES&seed_genres=${genresRecommend}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        const data = await result.json();
        console.log(data);
        //displaySong(data);
        return data.tracks;
    }
    
    const _getGenreSeeds = async (token) => {
      const result = await fetch(`https://api.spotify.com/v1/recommendations/available-genre-seeds`, {
          method: 'GET',
          headers: { 'Authorization' : 'Bearer ' + token}
      });
      const data = await result.json();
      //console.log(data);
      //console.log(data.genres);
      //console.log(data.genres[0]);
      
      return data;
    
    }  

    return {
        getToken() {
            return _getToken();
        },
        getRecommendation(token, genresRecommend){
            return _getRecommendation(token, genresRecommend);
        },
        getGenreSeeds(token){
          return _getGenreSeeds(token);
      }
    }
})();


// UI Module
const UIController = (function() {
    //object to hold references to html selectors
    const DOMElements = {
        selectedSong: '#selected_song',
    }

     // Scopes
    var scope = 'user-read-private user-read-email user-read-playback-state';



    //public methods 
    return {

        //method to get input fields
        inputField() {
            return {
                theSong: document.querySelector(DOMElements.selectedSong)
            }
        },
        
        createSong(id, name) {
            const html = `<option value="${id}">${name}</option>`;
            document.querySelector(DOMElements.selectedSong).insertAdjacentHTML('beforeend', html);
        },
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },
        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {
    const DOMInputs = UICtrl.inputField();
    genresRecommend = null;
    databaseWrite = null;

    document.addEventListener("DOMContentLoaded", () => {
        const inputField = document.getElementById("input");
        questionCount = 0;
        inputField.addEventListener("keydown", async (e) => {
          if (e.code === "Enter") {
            let input = inputField.value;
            inputField.value = "";
            if(questionCount < 1){
                output(input);
            }
            if (1<=questionCount && questionCount < 5) {
              output(input);
              const token = await APICtrl.getToken();
              const song = await APICtrl.getRecommendation(token, genresRecommend);
              //console.log(song[0].name);
              //console.log(song[0].external_urls);
              addImageBotOnly(song[0].album.images[1].url);
              addChatBotOnly(song[0].name);
              addChatBotOnly("By: "+song[0].artists[0].name);
              addLinkBotOnly(song[0].external_urls.spotify);
              databaseWrite = databaseWrite.concat("Album image: "+song[0].album.images[1].url+"\n");
              databaseWrite = databaseWrite.concat("Song name: "+song[0].name+"\n");
              databaseWrite = databaseWrite.concat("Artist name: "+song[0].artists[0].name+"\n");
              databaseWrite = databaseWrite.concat("Song link: "+song[0].external_urls.spotify+"\n"+"\n");
              console.log(databaseWrite);
            }
            if(questionCount>=5){
              addChatBotOnly("You've hit the genre limit! Keep pressing enter for more recommendations!");
              const token = await APICtrl.getToken();
              const song = await APICtrl.getRecommendation(token, genresRecommend);
              //console.log(song[0].name);
              //console.log(song[0].external_urls);
              addImageBotOnly(song[0].album.images[1].url);
              addChatBotOnly(song[0].name);
              addChatBotOnly("By: "+song[0].artists[0].name);
              addLinkBotOnly(song[0].external_urls.spotify);
              databaseWrite = databaseWrite.concat("Album image: "+song[0].album.images[1].url+"\n");
              databaseWrite = databaseWrite.concat("Song name: "+song[0].name+"\n");
              databaseWrite = databaseWrite.concat("Artist name: "+song[0].artists[0].name+"\n");
              databaseWrite = databaseWrite.concat("Song link: "+song[0].external_urls.spotify+"\n"+"\n");
            }    
            questionCount = questionCount + 1;
          }
        });
      });
      
      async function output(input) {
        let product;
      
        // Regex remove non word/space chars
        // Trim trailing whitespce
        // Remove digits - not sure if this is best
        // But solves problem of entering something like 'hi1'
      
        let text = input.toLowerCase().replace(/[^\w\s]/gi, "").replace(/[\d]/gi, "").trim();
        text = text
          .replace(/ a /g, " ")   // 'tell me a story' -> 'tell me story'
          .replace(/i feel /g, "")
          .replace(/whats/g, "what is")
          .replace(/please /g, "")
          .replace(/ please/g, "")
          .replace(/r u/g, "are you");
          if (compare(prompts, replies, text)) { 
            // Search for exact match in `prompts`
            product = compare(prompts, replies, text);
          } 
          else {
            if (compare(genresList, genresListReplies, text)) {
              product = compare(genresList, genresListReplies, text)+text;
              if(genresRecommend!=null){
                genresRecommend = genresRecommend.concat(",",text);
              }
              else{
                genresRecommend = text;
              }
            } 
          } 
          if(product == null) {
            // If all else fails: random alternative
            product = alternative[Math.floor(Math.random() * alternative.length)];
          }
      
        //stores user input and bot output to write to database for review
        if(databaseWrite!=null){
          databaseWrite = databaseWrite.concat("User input: "+input+"\n");
          databaseWrite = databaseWrite.concat("What the bot sees: ",text+"\n");
          databaseWrite = databaseWrite.concat("What the bot outputs: ",product+"\n"+"\n");
        }
        else{
          databaseWrite = "User input: "+input+"\n";
          databaseWrite = databaseWrite.concat("What the bot sees: ",text+"\n");
          databaseWrite = databaseWrite.concat("What the bot outputs: ",product+"\n"+"\n");
        }
        
        // Update DOM
        addChat(input, product);
        //console.log(databaseWrite);
      }
      
      function compare(promptsArray, repliesArray, string) {
        let reply;
        let replyFound = false;
        for (let x = 0; x < promptsArray.length; x++) {
          for (let y = 0; y < promptsArray[x].length; y++) {
            if (promptsArray[x][y] === string) {
              let replies = repliesArray[x];
              reply = replies[Math.floor(Math.random() * replies.length)];
              replyFound = true;
              // Stop inner loop when input value matches prompts
              break;
            }
          }
          if (replyFound) {
            // Stop outer loop when reply is found instead of interating through the entire array
            break;
          }
        }
        return reply;
      }
      
      function addChat(input, product) {
        const messagesContainer = document.getElementById("messages");
      
        let userDiv = document.createElement("div");
        userDiv.id = "user";
        userDiv.className = "user response";
        userDiv.innerHTML = `<img src="user.png" class="avatar"><span>${input}</span>`;
        messagesContainer.appendChild(userDiv);
      
        let botDiv = document.createElement("div");
        let botImg = document.createElement("img");
        let botText = document.createElement("span");
        botDiv.id = "bot";
        botImg.src = "bot-mini.png";
        botImg.className = "avatar";
        botDiv.className = "bot response";
        botText.innerText = "Typing...";
        botDiv.appendChild(botText);
        botDiv.appendChild(botImg);
        messagesContainer.appendChild(botDiv);
        // Keep messages at most recent
        messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
      
        // Fake delay to seem "real"
        setTimeout(() => {
          botText.innerText = `${product}`;
        }, 2000
        )
      
      }
      function addChatBotOnly(product) {
        const messagesContainer = document.getElementById("messages");
      
        let botDiv = document.createElement("div");
        let botImg = document.createElement("img");
        let botText = document.createElement("span");
        botDiv.id = "bot";
        botImg.src = "bot-mini.png";
        botImg.className = "avatar";
        botDiv.className = "bot response";
        botText.innerText = "Typing...";
        botDiv.appendChild(botText);
        botDiv.appendChild(botImg);
        messagesContainer.appendChild(botDiv);
        // Keep messages at most recent
        messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
      

        setTimeout(() => {
          botText.innerText = `${product}`;
        }, 10
        )
      
      }
      
      function addImageBotOnly(product) {
        const messagesContainer = document.getElementById("messages");
      
        let botDiv = document.createElement("div");
        let botImg = document.createElement("img");
        let botText = document.createElement("img");
        botDiv.id = "bot";
        botImg.src = "bot-mini.png";
        botImg.className = "avatar";
        botDiv.className = "bot response";
        botText.innerText = "Typing...";
        botDiv.appendChild(botText);
        botDiv.appendChild(botImg);
        messagesContainer.appendChild(botDiv);
        // Keep messages at most recent
        messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
      

        setTimeout(() => {
          botText.src = `${product}`;
        }, 10
        )
      }

      function addLinkBotOnly(product){
        const messagesContainer = document.getElementById("messages");
      
        let botDiv = document.createElement("div");
        let botImg = document.createElement("img");
        let botText = document.createElement("a");
        botDiv.id = "bot";
        botImg.src = "bot-mini.png";
        botImg.className = "avatar";
        botDiv.className = "bot response";
        botDiv.appendChild(botText);
        botDiv.appendChild(botImg);
        messagesContainer.appendChild(botDiv);
        // Keep messages at most recent
        messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
      

        setTimeout(() => {
          link = product;
          botText.className = "link-button";
          botText.type = "button";
          botText.style="color: white; text-decoration: none;";
          botText.href = link;
          botText.innerText = (`To Song`);
        }, 10
        )
      }
      
    return {
        init() {
            console.log('App is starting');
            addChatBotOnly("Hello, I am the Chatbot Song Recommender, would you like song recommendations?");           
        }
    }

})(UIController, APIController);

APPController.init();

