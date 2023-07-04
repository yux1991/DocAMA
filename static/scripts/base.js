const input = document.getElementById("user-input");
const charCount = document.getElementById("charCount");
const fileInput = document.getElementById('pdfFile');
const pdfViewer = document.getElementById('pdfViewer');
const platformSelectList = document.getElementById('platform-select-list');
const modelSelectList = document.getElementById('model-select-list');
var modelLoaded = false;

input.addEventListener("input", function() {
  var count = input.value.length;
  charCount.textContent = count;
});

fileInput.addEventListener('change', function() {
  const file = fileInput.files[0];
  const fileURL = URL.createObjectURL(file);
  pdfViewer.setAttribute('src', fileURL);
});

platformSelectList.addEventListener('change', function () {
  document.getElementById("model-select-list").innerHTML = "";
  if (this.value == 'openai') {
    getOpenAIModels();
  } else if (this.value == 'huggingface') {
    getHuggingFaceModels();
  };
})

$("form#data").submit(function(e) {
  e.preventDefault();    
  var formData = new FormData(this);
  simplePost(url="/upload", data=formData)
})

if (platformSelectList.value=='openai') {
    getOpenAIModels()
  } else if (platformSelectList.value=='huggingface') {
    getHuggingFaceModels()
  }


function getOpenAIModels() {
  $.ajax({
      url: '/openai_models',
      type: 'GET',
      success: function (message) {
        message.forEach(function(model){
          var item = document.createElement("option");
          item.text = model
          if (model == 'text-davinci-003') {
            item.selected='selected';
          }
          const model_selection = document.getElementById("model-select-list")
          model_selection.appendChild(item)
        })
      },
      cache: false,
      contentType: false,
      processData: false
  })
}

function getHuggingFaceModels() {
  $.ajax({
      url: '/huggingface_models',
      type: 'GET',
      success: function (message) {
        message.forEach(function(model){
          var item = document.createElement("option");
          if (model == 'google/flan-t5-small') {
            item.selected='selected';
          }
          item.text = model
          const model_selection = document.getElementById("model-select-list")
          model_selection.appendChild(item)
        })
      },
      cache: false,
      contentType: false,
      processData: false
  })
}

function clickLoad() {
  payload = {platform: platformSelectList.value, model_name: modelSelectList.value}
  message = postJSON(url="/load_model", data=payload)
  message.then(js => {
    alert(js.message)
  })
  document.getElementById("user-input").value = "";
  document.getElementById("chat-window").innerHTML = "";
  $.ajax({
      url: '/clearmemory',
      type: 'POST',
      data: null,
  })
  modelLoaded = true;
}

function clickReset() {
  simplePost(url="/reset", data=null)
}

function clickSend() {
  var userInput = document.getElementById("user-input").value;
  var chatWindow = document.getElementById("chat-window");
  
  if (userInput.trim() !== "") {
    showUserMessage(userInput)
    showAiMessage(userInput)
  
    // Reset the input field
    document.getElementById("user-input").value = "";
  
    // Scroll to the bottom of the chat window
    var scrollHeight = Math.max(chatWindow.scrollHeight, chatWindow.clientHeight) - chatWindow.clientHeight
    chatWindow.scrollTop = scrollHeight+getStyle(chatWindow, "padding");
  }
 charCount.textContent = 0;
}

function clickClear() {
    document.getElementById("user-input").value = "";
    document.getElementById("chat-window").innerHTML = "";
    if (modelLoaded == true) {
      clearMemory();
    }
}

function showUserMessage(userInput) {
    var chatWindow = document.getElementById("chat-window");
    var userMessageContainer = document.createElement("div");
    userMessageContainer.className = "user-message";
  
    var userMessageBubble = document.createElement("div");
    userMessageBubble.className = "user-message-bubble";
    userMessageBubble.textContent = userInput;
  
    userMessageContainer.appendChild(userMessageBubble);
    chatWindow.prepend(userMessageContainer);
}

function showAiMessage(userInput) {
    var chatWindow = document.getElementById("chat-window");
    var aiMessageContainer = document.createElement("div");
    var returnedMessage;

    aiMessageContainer.className = "ai-message";
    var aiMessageBubble = document.createElement("div");
    aiMessageBubble.className = "ai-message-bubble";
    returnedMessage = postJSON(url="/calculate", payload={user_input: userInput})
    returnedMessage.then(js => {
        if (typeof js.answer == 'string') {
          aiMessageBubble.textContent = js.answer;
          aiMessageContainer.appendChild(aiMessageBubble);
          chatWindow.prepend(aiMessageContainer);
        } else if (typeof js.alert == 'string') {
          showHelpMessage(js.alert);
        }
      });
  
}

function showHelpMessage(message) {
    var chatWindow = document.getElementById("chat-window");
    var helpMessageContainer = document.createElement("div");
    helpMessageContainer.className = "help-message";

    var helpMessageBubble = document.createElement("div");
    helpMessageBubble.className = "help-message-bubble";
    helpMessageBubble.textContent = message;

    helpMessageContainer.appendChild(helpMessageBubble);
    chatWindow.prepend(helpMessageContainer);
}

function clearMemory() {
    simplePost(url="/clearmemory", data=null)
}

function getStyle(oElm, strCssRule){
  var strValue = "";
  if(document.defaultView && document.defaultView.getComputedStyle){
      strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
  }
  else if(oElm.currentStyle){
      strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
          return p1.toUpperCase();
      });
      strValue = oElm.currentStyle[strCssRule];
  }
  return strValue;
}

function postJSON(url, payload) {
  return $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: JSON.stringify(payload),
    dataType: "json",
  })
}

function simplePost(url, data) {
  $.ajax({
      url: url,
      type: 'POST',
      data: data,
      success: function (message) {
          alert(message)
      },
      cache: false,
      contentType: false,
      processData: false
  })
}