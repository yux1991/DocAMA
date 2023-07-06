const input = document.getElementById("user-input");
const charCount = document.getElementById("charCount");
const fileInput = document.getElementById('pdfFile');
var modelLoaded = false;
const setTheme = theme => document.documentElement.className = theme;

input.addEventListener("input", function() {
  var count = input.value.length;
  charCount.textContent = count;
});

fileInput.addEventListener('input', function() {
  const file = fileInput.files[0];
  const fileURL = URL.createObjectURL(file);
  var pdfViewer = document.getElementById('pdfViewer');
  pdfViewer.setAttribute('src', fileURL);
});

$("form#data").submit(function(e) {
  e.preventDefault();    
  var formData = new FormData(this);
  simplePost(url="/upload", data=formData)
})

refreshList("select-platform")
refreshList("select-model")

async function getOpenAIModels() {
  const model_selection = document.getElementById("select-model");
  model_selection.innerHTML = "";
  var model_list = document.createElement("select");
  model_list.id = "model-select-list"

  var item = document.createElement("option");
  item.text = "Select model:"
  model_list.appendChild(item)

  await $.ajax({
      url: '/openai_models',
      type: 'GET',
      success: function (message) {
        var index = 1;
        message.forEach(function(model){
          var item = document.createElement("option");
          item.value = index.toString();
          item.text = model;
          model_list.appendChild(item);
          index++;
          if (model=="text-davinci-003"){
            item.setAttribute('selected', true)
          };
        })
      },
      cache: false,
      contentType: false,
      processData: false
  });
  model_selection.appendChild(model_list)
  refreshList("select-model")
}

async function getHuggingFaceModels() {
  const model_selection = document.getElementById("select-model");
  model_selection.innerHTML = "";
  var model_list = document.createElement("select");
  model_list.id = "model-select-list"
  model_list.name = "model_name"

  var item = document.createElement("option");
  item.text = "Select model:"
  item.value = "0"
  model_list.appendChild(item)

  await $.ajax({
      url: '/huggingface_models',
      type: 'GET',
      success: function (message) {
        var index = 1;
        message.forEach(function(model){
          var item = document.createElement("option");
          item.value = index.toString();
          item.text = model;
          model_list.appendChild(item);
          index++;
          if (model=="google/flan-t5-large"){
            item.setAttribute('selected', true)
          };
        })
      },
      cache: false,
      contentType: false,
      processData: false
  });
  model_selection.appendChild(model_list)
  refreshList("select-model")
}

function clickLoad() {
  var selectedPlatform = document.getElementById('select-platform').getElementsByClassName('select-selected')[0];
  var selectedModel = document.getElementById('select-model').getElementsByClassName('select-selected')[0];
  payload = {platform: selectedPlatform.innerHTML, model_name: selectedModel.innerHTML}
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
  var docWindow = document.getElementById('doc-window');
  docWindow.replaceChildren();
  var embedDoc = document.createElement("embed");
  embedDoc.className = "embed";
  embedDoc.id = "pdfViewer";
  embedDoc.type = "application/pdf";
  docWindow.appendChild(embedDoc);
  fileInput.value = null;
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

    var userMessageContainerTail = document.createElement("div");
    userMessageContainerTail.className = "user-message-bubble-tail"
    userMessageContainerTail.textContent = "";
  
    userMessageContainer.appendChild(userMessageBubble);
    userMessageContainer.appendChild(userMessageContainerTail);
    chatWindow.prepend(userMessageContainer);
}

function showAiMessage(userInput) {
    var chatWindow = document.getElementById("chat-window");
    var aiMessageContainer = document.createElement("div");
    var returnedMessage;

    aiMessageContainer.className = "ai-message";
    var aiMessageBubble = document.createElement("div");
    aiMessageBubble.className = "ai-message-bubble";
    aiMessageBubble.textContent = " ";
    var aiMessageContainerTail = document.createElement("div");
    aiMessageContainerTail.className = "ai-message-bubble-tail"
    aiMessageContainerTail.textContent = "";
    aiMessageContainer.appendChild(aiMessageContainerTail);
    aiMessageContainer.appendChild(aiMessageBubble);
    chatWindow.prepend(aiMessageContainer);

    returnedMessage = postJSON(url="/calculate", payload={user_input: userInput})
    returnedMessage.then(js => {
        if (typeof js.answer == 'string') {
          aiMessageBubble.textContent = js.answer;
        } else if (typeof js.alert == 'string') {
          aiMessageBubble.textContent = js.alert;
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

    var helpMessageContainerTail = document.createElement("div");
    helpMessageContainerTail.className = "help-message-bubble-tail"
    helpMessageContainerTail.textContent = "";

    helpMessageContainer.appendChild(helpMessageContainerTail);
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

function refreshList(list_name) {
  var x, i, j, l, ll, selElmnt, a, b, c;
  x = document.getElementsByClassName(list_name);
  l = x.length;
  for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
      /*for each option in the original select element,
      create a new DIV that will act as an option item:*/
      c = document.createElement("DIV");
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener("click", function(e) {
          /*when an item is clicked, update the original select box,
          and the selected item:*/
          var y, i, k, s, h, sl, yl;
          s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          sl = s.length;
          h = this.parentNode.previousSibling;
          for (i = 0; i < sl; i++) {
            if (s.options[i].innerHTML == this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              y = this.parentNode.getElementsByClassName("same-as-selected");
              yl = y.length;
              for (k = 0; k < yl; k++) {
                y[k].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
          h.click();
          if (list_name=="select-platform") {
            var item = document.createElement("option");
            item.text = "Select model:"
            item.value = "0";
            document.getElementById('model-select-list').innerHTML = "";
            document.getElementById('model-select-list').appendChild(item)
            if (selElmnt.value == "2") {
              getOpenAIModels();
            } else if (selElmnt.value == "1") {
              getHuggingFaceModels();
            };
          };
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function(e) {
        /*when the select box is clicked, close any other select boxes,
        and open/close the current select box:*/
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
      });
  }
  /*if the user clicks anywhere outside the select box,
  then close all select boxes:*/
  document.addEventListener("click", closeAllSelect);
}

function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
  except the current select box:*/
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}