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
        // let limit = prompt("Put in a limit amount: ");
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

    return {
        getToken() {
            return _getToken();
        },
        getRecommendation(token, genresRecommend){
            return _getRecommendation(token, genresRecommend);
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
    /*
    DOMInputs.theSong.addEventListener('click', async () => {
        //get the token
        const token = await APICtrl.getToken();           
        //store the token onto the page
        //UICtrl.storeToken(token);
        //const token = UICtrl.getStoredToken().token; 
        const song = await APICtrl.getRecommendation(token, genresRecommend);
        console.log(song);
        console.log(song[0].name);
        song.forEach(yo => UICtrl.createSong(yo.href, yo.name));
    });
    */
    document.addEventListener("DOMContentLoaded", () => {
        const inputField = document.getElementById("input");
        questionCount = 0;
        inputField.addEventListener("keydown", async (e) => {
          if (e.code === "Enter") {
            let input = inputField.value;
            inputField.value = "";
            if(questionCount < 5){
                output(input);
            }
            else {
                const token = await APICtrl.getToken();
                const song = await APICtrl.getRecommendation(token, genresRecommend);
                console.log(song[0].name);
                addChatBotOnly(song[0].name)
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
        } else if (text.match(/(electronic|acoustic|rock|rap|hiphop|classical|country|indie|romance|jazz|soul)/gi)) {
            product = "You chose Genre: "+text;
            if(genresRecommend!=null){
              genresRecommend = genresRecommend.concat(",",text);
            }
            else{
              genresRecommend = text;
            }
        } else if (text.match(/(corona|covid|virus)/gi)) {
          // If no match, check if message contains `coronavirus`
          product = coronavirus[Math.floor(Math.random() * coronavirus.length)];
        } else {
          // If all else fails: random alternative
          product = alternative[Math.floor(Math.random() * alternative.length)];
        }
      
        // Update DOM
        addChat(input, product);
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
      
        // Fake delay to seem "real"
        setTimeout(() => {
          botText.innerText = `${product}`;
        }, 2000
        )
      
      }
    
    
    return {
        init() {
            console.log('App is starting');
            addChatBotOnly("Hello, I am the Chatbot Song Recommender, would you like song recommendations?");
            
        }
    }

})(UIController, APIController);

/*
function displaySong(data) {
    const specificSong = data.specificSong;
    const quoteDiv = document.getElementById("specificSong");
  

  const songName = '"'+specificSong+'"';
  const heading = document.createElement("p");

  heading.innerHTML = songName;
  quoteDiv.appendChild(heading);

  }
  */
// will need to call a method to load the genres on page load
APPController.init();

