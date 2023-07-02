var input = document.getElementById("user-input");
var charCount = document.getElementById("charCount");

input.addEventListener("input", function() {
  var count = input.value.length;
  charCount.textContent = count;
});

function sendMessage() {
  var userInput = document.getElementById("user-input").value;
  var chatWindow = document.getElementById("chat-window");
  
  if (userInput.trim() !== "") {
    var userMessageContainer = document.createElement("div");
    userMessageContainer.className = "user-message";
  
    var userMessageBubble = document.createElement("div");
    userMessageBubble.className = "user-message-bubble";
    userMessageBubble.textContent = userInput;
  
    userMessageContainer.appendChild(userMessageBubble);
    chatWindow.appendChild(userMessageContainer);
  
    var aiMessageContainer = document.createElement("div");
    aiMessageContainer.className = "ai-message";
  
    var aiMessageBubble = document.createElement("div");
    aiMessageBubble.className = "ai-message-bubble";
    $.ajax({
      type: "POST",
      url: "/calculate",
      contentType: "application/json",
      data: JSON.stringify({user_input: userInput}),
      dataType: "json",
    }).then(js => {
        aiMessageBubble.textContent = js.answer;
        console.log(js.answer)
      });
  
    aiMessageContainer.appendChild(aiMessageBubble);
    chatWindow.appendChild(aiMessageContainer);
  
    // Reset the input field
    document.getElementById("user-input").value = "";
  
    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
 charCount.textContent = 0;
}
