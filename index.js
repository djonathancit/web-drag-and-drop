"use strict";

const inputFile = document.querySelector("#inputFile");
const labelFile = document.querySelector("#labelFile");
const errorMsg = document.querySelector("#spanError");
const restart = document.querySelectorAll("#linkRestart")[0];
const formUpload = document.querySelectorAll("#formUpload")[0];
const restart_Error = document.querySelectorAll("#linkRestart_Error")[0];

var droppedFiles = false;
console.log(inputFile);
console.log(labelFile);

function triggerFormSubmit() {
  var event = document.createEvent("HTMLEvents");
  event.initEvent("submit", true, false);
  form.dispatchEvent(event);
}

function adjustLabel() {
  labelFile.textContent = "";
  var node = document.createElement("strong");
  var textnode = document.createTextNode("Choose a file");
  node.appendChild(textnode);
  var nodeSpan = document.createElement("span");
  nodeSpan.classList.add("box__dragndrop");
  var textNodeSpan = document.createTextNode(" or drag it here");
  nodeSpan.appendChild(textNodeSpan);

  labelFile.appendChild(node);
  labelFile.appendChild(nodeSpan);
}

function getFileSize(file, precision) {
  return (file.size / 1024 / 1024).toFixed(precision);
}

function showfileName(files) {
  var index = 0;

  if (files.length > 1) {
    alert("Permitido apenas 1 arquivo");
    inputFile.value = "";
    adjustLabel();
    return;
  }

  for (index; index < files.length; index++) {
    var filesize = getFileSize(files[index], 2);

    if (filesize > 2) {
      alert(
        `Permitido apenas arquivos com 2mb, seu arquivo tem: ${filesize} mb`
      );
      inputFile.value = "";
      adjustLabel();
    } else {
      alert(`seu arquivo tem: ${filesize} mb`);
      labelFile.textContent =
        files.length > 1
          ? (input.getAttribute("data-multiple-caption") || "").replace(
              "{count}",
              files.length
            )
          : files[0].name;
    }
  }
}

// automatically submit the form on file select
inputFile.addEventListener("change", function (e) {
  showfileName(e.target.files);
});
// Firefox focus bug fix for file input
inputFile.addEventListener("focus", function () {
  inputFile.classList.add("has-focus");
});
inputFile.addEventListener("blur", function () {
  inputFile.classList.remove("has-focus");
});

restart.addEventListener("click", function (e) {
  restartClick(e);
});
restart_Error.addEventListener("click", function (e) {
  restartClick(e);
});

function restartClick(e) {
  e.preventDefault();
  formUpload.classList.remove("is-error", "is-success");
  inputFile.click();
}

//Events Form
function addMethodForm() {
  [
    "drag",
    "dragstart",
    "dragend",
    "dragover",
    "dragenter",
    "dragleave",
    "drop",
  ].forEach(function (event) {
    formUpload.addEventListener(event, function (e) {
      // preventing the unwanted behaviours
      e.preventDefault();
      e.stopPropagation();
    });
  });

  ["dragover", "dragenter"].forEach(function (event) {
    formUpload.addEventListener(event, function () {
      formUpload.classList.add("is-dragover");
    });
  });
  ["dragleave", "dragend", "drop"].forEach(function (event) {
    formUpload.addEventListener(event, function () {
      formUpload.classList.remove("is-dragover");
    });
  });
  formUpload.addEventListener("drop", function (e) {
    droppedFiles = e.dataTransfer.files; // the files that were dropped
    showfileName(droppedFiles);
  });
}

function isAdvancedUpload() {
  var div = document.createElement("div");
  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
}

function createAjaxElemt() {
  let ajaxFlag = document.createElement("input");
  ajaxFlag.setAttribute("type", "hidden");
  ajaxFlag.setAttribute("name", "ajax");
  ajaxFlag.setAttribute("value", 1);
  return ajaxFlag;
}

//
function createElementInForms(form) {
  form.classList.add("has-advanced-upload");
}

//
function sendUploadMethodFirst(e) {
  e.preventDefault();

  // gathering the form data
  var ajaxData = new FormData(formUpload);
  if (droppedFiles) {
    Array.prototype.forEach.call(droppedFiles, function (file) {
      ajaxData.append(inputFile.getAttribute("name"), file);
    });
  }

  // ajax request
  var ajax = new XMLHttpRequest();
  ajax.open(
    formUpload.getAttribute("method"),
    formUpload.getAttribute("action"),
    true
  );

  ajax.onload = function () {
    formUpload.classList.remove("is-uploading");
    if (ajax.status >= 200 && ajax.status < 400) {
      var data = JSON.parse(ajax.responseText);
      formUpload.classList.add(
        data.success == true ? "is-success" : "is-error"
      );
      if (!data.success) errorMsg.textContent = data.error;
    } else alert("Error. Please, contact the webmaster!");
  };

  ajax.onerror = function () {
    formUpload.classList.remove("is-uploading");
    alert("Error. Please, try again!");
  };

  ajax.send(ajaxData);
}

function sendUploadMethodthird(e) {
  e.preventDefault();
  alert("upload com sucesso");
  formUpload.classList.add("is-success");
}

//
function sendUploadMethodSecond() {
  var iframeName = "uploadiframe" + new Date().getTime(),
    iframe = document.createElement("iframe");

  $iframe = $(
    '<iframe name="' + iframeName + '" style="display: none;"></iframe>'
  );

  iframe.setAttribute("name", iframeName);
  iframe.style.display = "none";

  document.body.appendChild(iframe);
  formUpload.setAttribute("target", iframeName);

  iframe.addEventListener("load", function () {
    var data = JSON.parse(iframe.contentDocument.body.innerHTML);
    formUpload.classList.remove("is-uploading");
    formUpload.classList.add(data.success == true ? "is-success" : "is-error");
    formUpload.removeAttribute("target");
    if (!data.success) errorMsg.textContent = data.error;
    iframe.parentNode.removeChild(iframe);
  });
}

(function (document, window, index) {
  var forms = document.querySelectorAll(".box");

  formUpload.appendChild(createAjaxElemt(formUpload));

  // drag&drop files if the feature is available
  if (isAdvancedUpload()) {
    // letting the CSS part to know drag&drop is supported by the browser
    createElementInForms(formUpload);
    addMethodForm();
  }

  formUpload.addEventListener("submit", function (e) {
    // preventing the duplicate submissions if the current one is in progress
    if (formUpload.classList.contains("is-uploading")) return false;

    formUpload.classList.add("is-uploading");
    formUpload.classList.remove("is-error");

    if (isAdvancedUpload) {
      // ajax file upload for modern browsers
      
      //sendUploadMethodFirst(e);
      sendUploadMethodthird(e);

    } // fallback Ajax solution upload for older browsers
    else {
      sendUploadMethodSecond();
    }
  });
})(document, window, 0);
