    
    
//Global varaibles store updated graph values here
let updatedValues = {};
let isButtonDisplayed = false;
let activeDialElem = null;
let new_user_data = null;
let mapping = {}
    document.addEventListener('DOMContentLoaded', () => {
        let pathname = window.location.pathname;
        if (pathname === '/index.html') {
            let user_data_str_encoded = getCookie('user_data');  

            

            let decoded_user_data_str = user_data_str_encoded.replace(/\\054/g, ',');
            let cleanedStr = decoded_user_data_str.slice(1, -1); // Removes the first and last characters
            let finalStr = cleanedStr.replace(/\\/g, "");

            // console.log(finalStr)
            let user_data = JSON.parse(finalStr);

            if (user_data) {
                let name = user_data["name"];
                // set a changing data instance to capture the graph bar changes
                new_user_data = JSON.parse(finalStr);
                // get a feature value for testing
                // alert(user_data["features"]["avg_daily_exercise_duration"])
                document.getElementById("usernameDisplay").innerHTML = `Welcome, ${name}! Let's chat about your sleep!`;
            }
        }
        if (pathname === '/login.html') {
            // Login page specific code
            const form = document.getElementById("loginForm");
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                userlogin();
            });
        }
    });
    
    function userlogin() {
        const form = document.getElementById("loginForm");
        const formData = new FormData(form);
        const username = formData.get('username');
        fetch('http://localhost:3000/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${username}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                window.location.assign("/index.html");
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Login Error:', error);
        });
    }
    
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
    }
    
           


function sendMessage() {
    const inputElem = document.getElementById('userInput');
    const message = inputElem.value;

    if (!message) return;

    addMessageToChatbox(`You: ${message}`, 'user-message');
    inputElem.value = '';

    // If the user wants to create a sleep graph
    if (message.toLowerCase() === 'create a sleep graph') {
        addMessageToChatbox(`😴GPT: Here's your sleep graph!`, 'bot-message');
        createSleepGraph();
        return; // Exit the function to avoid making a backend request
    }

    else if (message.toLowerCase().trim() === 'how would be my sleep quality tonight?') {
        let user_data_str_encoded = getCookie('user_data');  

        // console.log(user_data_str_encoded)
    
        let decoded_user_data_str = user_data_str_encoded.replace(/\\054/g, ',');
        let cleanedStr = decoded_user_data_str.slice(1, -1); // Removes the first and last characters
        let finalStr = cleanedStr.replace(/\\/g, "");
    
        let new_data = JSON.parse(finalStr);
    
        // get the predicted score from the backend
        fetch('http://localhost:3000/predict', {
           
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_data: new_data
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                // get the score
                const score = data.score; 
                addMessageToChatbox(`😴GPT: 🌟 Predicting Your Zzz's: Based on your data, you can look forward to this level of sleep quality: 🌟`, 'bot-message');
                createQualityscoreGraph(score)
            } 
        })
        .catch(error => {
            console.error('Prediction Error:', error);
        });
        return;
    }
        

    else if (message.toLowerCase().trim() === 'how can i enhance my sleep?') {

        activeDialElem =null;

        addMessageToChatbox(`😴GPT: Here are some factors that influence your sleep quality. Tweak them and watch how your nights transform into restful bliss. 🛌💤`, 'bot-message');
        const graphContainer = document.createElement('div');
        graphContainer.classList.add('graph-message');

        const updateButton = document.createElement('button')
        updateButton.innerText='Let us work on that!';
        updateButton.style.display ='none';
        updateButton.addEventListener('click',logUpdatedValues);

        const svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        graphContainer.appendChild(svgElem);
        graphContainer.appendChild(updateButton);
        document.getElementById('chatbox').appendChild(graphContainer);
        createSleepGraph(svgElem);
        activeDialElem =createQualityscoreGraph(0);
        console.log("dialelement" + (activeDialElem));
        return; // Exit the function to avoid making a backend request
    }

    // Otherwise, fetch a reply from the backend
    else{
        fetch('http://localhost:3000/ask', {
            // print(message)
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        })
        .then(response => response.text()) 
        .then(data => {
            const reply = data;  
            addMessageToChatbox(`😴GPT: ${reply}`, 'bot-message');
        })

        .catch(error => {
            console.error('Error:', error);
            addMessageToChatbox(`😴GPT: Sorry, I encountered an error.`, 'bot-message');
        });
        }
}

function addMessageToChatbox(message, className) {
    const chatbox = document.getElementById('chatbox');
    const messageElem = document.createElement('span');
    messageElem.textContent = message;
    messageElem.className = `message ${className}`;
    chatbox.appendChild(messageElem);

    // Scroll chat to the latest message
    chatbox.scrollTop = chatbox.scrollHeight;
}

function insertPrompt(promptText) {
    const inputElem = document.getElementById('userInput');
    inputElem.value = promptText;
}

function createQualityscoreGraph(score) {
    const chatbox = document.getElementById('chatbox');
    let dialElem = document.querySelector('.dial');

        const wrapperElem = document.createElement('div');
        wrapperElem.className = 'dial-wrapper';

        dialElem = document.createElement('input');
        dialElem.setAttribute('type', 'text');
        dialElem.className = 'dial';


        wrapperElem.appendChild(dialElem);
        chatbox.appendChild(wrapperElem);

        $(function() {
            $(".dial").knob({
                'min': 0,
                'max': 100,
                'width': 150,
                'height': 150,
                'fgColor': '#5bc0de',
                'dynamicDraw': true,
                'thickness': 0.2,
                'readOnly': true, // This ensures the knob is not adjustable
                'displayInput': true, // This displays the value inside the knob
                'draw': function () {
        // Original drawing of the knob
        this.draw();

        var value = this.i.val(); 
        var angle = this.angle(value); 
        var ctx = this.g;  
        var textX = this.w / 2 + Math.cos(angle) * this.radius / 2 -10;  
        var textY = this.w / 2 + Math.sin(angle) * this.radius / 2 + 180;  
        ctx.fillStyle = "#5bc0de";  
        ctx.font = "28px sans-serif";  
        ctx.fillText("Sleep Quality", textX, textY);
    }
            });
        });

   $(dialElem).val(score).trigger('change'); // Set the provided score

   return dialElem;
}

    
function createSleepGraph(svgElem){
    //console.log("done")
    let user_data_str_encoded = getCookie('user_data');  
    // console.log(user_data_str_encoded)

    let decoded_user_data_str = user_data_str_encoded.replace(/\\054/g, ',');
    let cleanedStr = decoded_user_data_str.slice(1, -1); // Removes the first and last characters
    let finalStr = cleanedStr.replace(/\\/g, "");

    console.log(finalStr)
    let user_data = JSON.parse(finalStr);

    norm_user_data = normalizeDictValues(user_data)
    console.log(norm_user_data)
    const data = [
        { label: '👟 Nighttime Step Count 💪', 
            feature:"f_steps:fitbit_steps_intraday_rapids_sumsteps_norm:night", 
            value: norm_user_data["features"]["f_steps:fitbit_steps_intraday_rapids_sumsteps_norm:night"] },

        { label: '🏃‍♂️ Nighttime Active Short Sessions Duration 💪',
            feature:"f_steps:fitbit_steps_intraday_rapids_sumdurationactivebout_norm:night",
            value: norm_user_data["features"]["f_steps:fitbit_steps_intraday_rapids_sumdurationactivebout_norm:night"] },
        
        { label: '📱 Night Screen Time ⏲️',
            feature:"f_screen:phone_screen_rapids_sumdurationunlock_norm:night",
            value: norm_user_data["features"]["f_screen:phone_screen_rapids_sumdurationunlock_norm:night"] },
        
        { label: '🛋️ Nighttime Stationary 📍',
            feature:"f_loc:phone_locations_doryab_movingtostaticratio_norm:night",
            value: norm_user_data["features"]["f_loc:phone_locations_doryab_movingtostaticratio_norm:night"] },
        
       
        { label: '🌳 Afternoon Time Spent at Parks 📍',
            feature:"f_loc:phone_locations_locmap_duration_in_locmap_greens_norm:afternoon",
            value: norm_user_data["features"]["f_loc:phone_locations_locmap_duration_in_locmap_greens_norm:afternoon"] },
        
        { label: '🏠 Time Spent Home at Night 📍',
            feature:"f_loc:phone_locations_doryab_timeathome_norm:night",
            value: norm_user_data["features"]["f_loc:phone_locations_doryab_timeathome_norm:night"] },
        
        { label: '📚 Time Spent at Study Location 📍',
            feature:"f_loc:phone_locations_locmap_duration_in_locmap_study_norm:allday",
            value: norm_user_data["features"]["f_loc:phone_locations_locmap_duration_in_locmap_study_norm:allday"] },
        
       

    ];

    data.forEach((entry) => {
        mapping[entry.feature] = entry.label;
    });

    const width = 650;
    const barHeight = 20;
    const barPadding = 10;
    const margin = { top: 20, right: 20, bottom: 40, left: 360 };
    const height = (data.length)* (barHeight ) + margin.top + margin.bottom;

    const svg = d3.select(svgElem).attr("width", width).attr("height", height);

    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    const graph = svg.append('g')
        .attr('width', graphWidth)
        .attr('height', graphHeight)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, height - margin.top - margin.bottom])
        .padding(0.2);


    // Draw the bars
    graph.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", d => yScale(d.label))
        .attr("width", d => xScale(d.value))
        .attr("height", yScale.bandwidth())
        .attr("fill", "#d1f9e0")
        .attr("class","draggable-bar")
       // .call(dragHandler);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale);

graph.append("g")
    .call(yAxis)
    .selectAll("text")
    .style("font-size", "18px");  

graph.append("g")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "14px"); 

    svg.append("text")
        .attr("transform", `translate(${margin.left + graphWidth / 2}, ${height})`)
        .style("text-anchor", "middle")
        .style("font-size", "50px");  
      

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - (graphHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        
       

    const dragHandler = d3.drag()
    .on("start", function() {
        d3.select(this).raise();
    })
    .on("drag", function(event,d) {
        let newValue = xScale.invert(event.x);
        newValue = Math.min(100, Math.max(0, newValue));
        updatedValues[d.label] = newValue;

        d.value = newValue;
        d3.select(this).attr("width", xScale(d.value));
        // Show the update button when a bar is dragged
        d3.select(svgElem.parentNode).select("button").style("display", "block");


        new_user_data["features"][d.feature] = denormalize(newValue);
       
        fetch('http://localhost:3000/predict', {
           
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_data: new_user_data
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                // get the score
                const score = data.score; 
                // addMessageToChatbox(`😴GPT: Based on your data, your expected sleep quality is expected to be: `, 'bot-message');
                console.log(score) 
                // a call to a function to update the score graph  
                updateQualityscoreGraph(score)
            } 
        })
        .catch(error => {
            console.error('Prediction Error:', error);
        });
        return;

    });
   

dragHandler(svg.selectAll("rect"));
}

function logUpdatedValues() {
    // console.log(updatedValues);
    for(let key in updatedValues){
        delete updatedValues[key];
    }

    this.disabled = true;
    d3.selectAll(".draggable-bar").on(".drag", null);
    // find the change
    let user_data_str_encoded = getCookie('user_data');  

    // console.log(user_data_str_encoded)

    let decoded_user_data_str = user_data_str_encoded.replace(/\\054/g, ',');
    let cleanedStr = decoded_user_data_str.slice(1, -1); // Removes the first and last characters
    let finalStr = cleanedStr.replace(/\\/g, "");

    let user_data = JSON.parse(finalStr);
    // Create an object to store absolute differences
    let featureDiff = {};

    // Variable to store the name of the feature with the highest absolute difference
    let highestDiffFeature = null;
    let highestDiffValue = 0;

    // Iterate through the keys of the features object in dict1
    for (const key in user_data.features) {
    // Check if the key exists in the second dictionary
        if (key in new_user_data.features) {
        // Calculate and store the absolute difference
            const absDiff = Math.abs(user_data.features[key] - new_user_data.features[key]);
            // featureDiff[key] = absDiff;

            // Update the highest absolute difference and its feature name
            if (absDiff > highestDiffValue) {
                highestDiffValue = absDiff;
                highestDiffFeature = key;
            }
        } else {
        console.log(`Key ${key} not found in second dictionary.`);
    }
    }    
    console.log("Feature with the highest absolute difference:", highestDiffFeature, "with value:", highestDiffValue);


    let var_to_change = mapping[highestDiffFeature];
    console.log(var_to_change)

    addMessageToChatbox(
        "Ready to Transform Your Life? 🚀 " + 
        "You're on the right track to making meaningful changes, and it looks like **" +
         var_to_change +
        "** is what you're most interested in changing! ✨", 'bot-message') 
        addMessageToChatbox("Hang tight—we're curating tips to guide you on this change. 🌱", 'bot-message')
     
     message = "Provide some tips to improve " + var_to_change;
     fetch('http://localhost:3000/recommend', {
            // print(message)
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        })
        .then(response => response.text()) 
        .then(data => {
            const reply = data;  
            addMessageToChatbox(`😴GPT: ${reply}`, 'bot-message');
            addMessageToChatbox(`😴GPT: If you've got any questions, don't hesitate to ask.`, 'bot-message');
        })

        .catch(error => {
            console.error('Error:', error);
            addMessageToChatbox(`😴GPT: Sorry, I encountered an error.`, 'bot-message');
        });
        }





function normalizeDictValues(obj) {
    const newObj = JSON.parse(JSON.stringify(obj));
  
    const features = newObj.features;
  
    let minVal = -2;
    let maxVal = 2;
  
    // Normalize the feature values between 0 and 100
    for (const key in features) {
      features[key] = ((features[key] - minVal) / (maxVal - minVal)) * 100;
    }
  
    // Update the 'features' object in the new object
    newObj.features = features;
  
    return newObj;  
  }
  
  function denormalize(value) {
    let user_data_str_encoded = getCookie('user_data');  

    // console.log(user_data_str_encoded)

    let decoded_user_data_str = user_data_str_encoded.replace(/\\054/g, ',');
    let cleanedStr = decoded_user_data_str.slice(1, -1); // Removes the first and last characters
    let finalStr = cleanedStr.replace(/\\/g, "");

    let user_data = JSON.parse(finalStr);

    const features = user_data["features"];
  
    let minVal = -2;
    let maxVal = 2;
  
    return value * (maxVal - minVal) / 100 + minVal;
  }
  

  function getJSONCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const jsonString = decodeURIComponent(c.substring(nameEQ.length, c.length));
        return JSON.parse(jsonString);
      }
    }
    return null;
  }


  function updateQualityscoreGraph(newScore) {
    console.log(newScore)
    const dialElement = document.querySelector('.dial'); // Assuming there's only one .dial element
    if (activeDialElem){
       $(activeDialElem).val(newScore).trigger('change');
     
    }
    else{
        activeDialElem = createQualityscoreGraph(newScore);
    }

}
