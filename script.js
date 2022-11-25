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
        displaySong(data);
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
    const genresRecommend ='electronic';
    // get input field object ref
    const DOMInputs = UICtrl.inputField();
    
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
    
    return {
        init() {
            console.log('App is starting');
        }
    }

})(UIController, APIController);


function displaySong(data) {
    const specificSong = data.specificSong;
    const quoteDiv = document.getElementById("specificSong");
  

  const songName = '"'+specificSong+'"';
  const heading = document.createElement("p");

  heading.innerHTML = songName;
  quoteDiv.appendChild(heading);

  }
// will need to call a method to load the genres on page load
APPController.init();


