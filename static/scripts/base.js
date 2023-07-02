var input = document.getElementById("user-input");
var charCount = document.getElementById("charCount");
var chatHeight = 0;

input.addEventListener("input", function() {
  var count = input.value.length;
  charCount.textContent = count;
});

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
    clearMemory();
    showHelpMessage("Memory cleared!");
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
    returnedMessage = postMessage(url="/calculate", payload={user_input: userInput})
    returnedMessage.then(js => {
        aiMessageBubble.textContent = js.answer;
      });
  
    aiMessageContainer.appendChild(aiMessageBubble);
    chatWindow.prepend(aiMessageContainer);
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
    postMessage(url="/clearmemory", payload=null)
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

function postMessage(url, payload) {
    return $.ajax({
      type: "POST",
      url: url,
      contentType: "application/json",
      data: JSON.stringify(payload),
      dataType: "json",
    })
}