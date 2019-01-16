var xhr = new XMLHttpRequest();
var uuid;
var elementPos;

$(document).ready(function () {
    let data = sessionStorage.getItem('uuid');
    console.log("data: ", data);
    if (data === null) {
        uuid = generateUuid();
        elementPos = -1;
        sessionStorage.setItem('uuid', uuid);
        sessionStorage.setItem('elementPos', 0);
        data = sessionStorage.getItem('uuid');
    }
    console.log("ready!", data);

});


document.addEventListener("click", function (ev) {
    path = createXPathFromElement(ev.srcElement);
    console.log("xpath -> ", path);

    let elementPos = parseInt(sessionStorage.getItem('elementPos')) + 1;
    sessionStorage.setItem('elementPos', elementPos);
    console.log("elementPos", elementPos);
    if (elementPos === 1) {
        saveNodeOnDataBase(path, sessionStorage.getItem('uuid'), sessionStorage.getItem('elementPos'), "click");
    }
    else {
        saveRelationshipOnDatabase(path, sessionStorage.getItem('uuid'), sessionStorage.getItem('elementPos'), "click");
    }
});

document.addEventListener("keyup", function (ev) {
    console.log("xpath -> ", ev.key);

    let elementPos = parseInt(sessionStorage.getItem('elementPos')) + 1;
    sessionStorage.setItem('elementPos', elementPos);

    if (elementPos === 1) {
        saveNodeOnDataBase(ev.key, sessionStorage.getItem('uuid'), elementPos, "input");
    }
    else {
        saveRelationshipOnDatabase(ev.key, sessionStorage.getItem('uuid'), elementPos, "input");
    }
});

function saveNodeOnDataBase(value, session, elementPos, action) {
    xhr.open("POST", 'http://localhost:3000/node/add', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        value: value,
        session: session,
        elementPos: elementPos,
        action: action,
    }));
}

function saveRelationshipOnDatabase(value, session, elementPos, action) {
    xhr.open("POST", 'http://localhost:3000/relationship/add', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        value: value,
        session: session,
        elementPos: elementPos,
        action: action,
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


function createXPathFromElement(elm) {
    var allNodes = document.getElementsByTagName('*');
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
        if (elm.hasAttribute('id')) {
            var uniqueIdCount = 0;
            for (var n = 0; n < allNodes.length; n++) {
                if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                if (uniqueIdCount > 1) break;
            }
            ;
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
            }
            ;
            segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        }
        ;
    }
    ;
    return segs.length ? '/' + segs.join('/') : null;
}