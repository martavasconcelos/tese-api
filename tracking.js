var xhr = new XMLHttpRequest();
var uuid;
var elementPos;
//xhr.onload =

$(document).ready(function() {
  uuid = generateUuid()
  elementPos = 0;
  console.log("ready!", uuid);
});

document.addEventListener("click", getCssSelector, false);

document.addEventListener("click", function(ev) {
  path = createXPathFromElement(ev.srcElement);
  console.log("xpath -> ", path);
  saveOnDataBase(path, elementPos);
});

function saveOnDataBase(path, elementPos) {
  xhr.open("POST", 'http://localhost:3000/path/add', true);

  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({
    path_name: path,
    session: uuid,
    elementPos: elementPos
  }));

}

function generateUuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function getCssSelector(e) {

  var path = [];
  var pathString = '';
  var node = e.target;
  console.log('node', node);
  console.log('has an id?', node.hasAttribute("id"));
  // if there is an id, only push the node
  if (node.hasAttribute("id")) {
    path.push(node);
  } else {
    while (node != document.body) {
      path.push(node);
      node = node.parentNode;
    }
  }
  console.log('---------> path: ', path);

}

function createXPathFromElement(elm) {
  var allNodes = document.getElementsByTagName('*');
  for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
    if (elm.hasAttribute('id')) {
      var uniqueIdCount = 0;
      for (var n = 0; n < allNodes.length; n++) {
        if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
        if (uniqueIdCount > 1) break;
      };
      if (uniqueIdCount == 1) {
        segs.unshift('id("' + elm.getAttribute('id') + '")');
        return segs.join('/');
      } else {
        segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
      }
    } else if (elm.hasAttribute('class')) {
      segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
    } else {
      for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
        if (sib.localName == elm.localName) i++;
      };
      segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
    };
  };
  return segs.length ? '/' + segs.join('/') : null;
};

function lookupElementByXPath(path) {
  var evaluator = new XPathEvaluator();
  var result = evaluator.evaluate(path, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  return result.singleNodeValue;
}