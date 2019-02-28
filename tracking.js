let xhr = new XMLHttpRequest();
let uuid;
let elementPos;
let path;
let id;
const basePath = "http://web-analytics.fe.up.pt";
let dragPath = null;

let timer = 0;
let delay = 200;
let prevent = false;

let keyPressMode = false;
let keyArray = [];


document.addEventListener("DOMContentLoaded", function () {
    var data = sessionStorage.getItem('uuid');
    if (data === null) {
        uuid = generateUuid();
        elementPos = -1;
        sessionStorage.setItem('uuid', uuid);
        sessionStorage.setItem('elementPos', 0);
        data = sessionStorage.getItem('uuid');
    }
    console.log("ready!", data);

});


document.addEventListener("dblclick", function (ev) {
    if (checkKeyPressMode()) {
        clearTimeout(timer);
        prevent = true;
        getMouseElement(ev);
    }
});

document.addEventListener("click", function (ev) {
    checkKeyPressMode();
    timer = setTimeout(function () {
        if (!prevent) {
            getMouseElement(ev);
        }
        prevent = false;
    }, delay);

});

document.addEventListener("dragstart", function (ev) {
    checkKeyPressMode();
    dragPath = createXPathFromElement(ev.srcElement);
});

document.addEventListener("drop", function (ev) {
    if (dragPath !== null) {
        getDragElement(dragPath, ev);
    }
});

document.addEventListener("keypress", function (ev) {
    keyPressMode = true;
    buildKeyArray(ev.key);
});

document.addEventListener("keyup", function (ev) {
    if (ev.which === 8 || ev.which === 46 || ev.which === 9 || ev.which === 13) {
        buildKeyArray(ev.key);
    }
});

document.addEventListener("paste", function (ev) {
    getPasteElement(ev, ev.clipboardData.getData('Text'));

});

function checkKeyPressMode() {
    if (keyPressMode) {
        console.log("saved!");
        getKeyboardElement(keyArray);
        keyArray = [];
        keyPressMode = false;
    }
}

function buildKeyArray(key) {
    let keyType = getKeyType(key);
    keyArray.push(keyType);
}

function getKeyType(key) {
    let keyType;
    if (/^[a-zA-Z]+$/.test(key)) {
        if (key.length === 1) {
            keyType = 'char';
        }
        else if (key === "Backspace" || key === "Tab" || key === "Enter") {
            keyType = key;
        }
        else if (key.length > 1) {
            keyType = 'string';
        }
    }
    else if (key === " ") {
        keyType = 'space';
    }
    else if (!isNaN(key)) {
        keyType = 'num';
    }
    return keyType;
}

function getMouseElement(ev) {

    path = createXPathFromElement(ev.srcElement);
    getPathId(path);

    setTimeout(function () {
        console.log("id timout: ", id);
        let actionId = getActionId(ev.type);

        let elementPos = parseInt(sessionStorage.getItem('elementPos')) + 1;
        sessionStorage.setItem('elementPos', elementPos);

        if (elementPos === 1) {
            saveNodeOnDataBase(path, id, sessionStorage.getItem('uuid'), sessionStorage.getItem('elementPos'), ev.type, actionId, window.location.href);
        }
        else {
            saveRelationshipOnDatabase(path, id, sessionStorage.getItem('uuid'), sessionStorage.getItem('elementPos'), ev.type, actionId, window.location.href);
        }
    }, 500);

}


function getDragElement(dragPath, ev) {

    let dropPath = createXPathFromElement(ev.srcElement);
    getPathId(dragPath);
    const action = "dragAndDrop";

    setTimeout(function () {
        let actionId = getActionId(action);
        let elementPos = parseInt(sessionStorage.getItem('elementPos')) + 1;
        sessionStorage.setItem('elementPos', elementPos);

        if (elementPos === 1) {
            saveNodeOnDataBase(dragPath, id, sessionStorage.getItem('uuid'), sessionStorage.getItem('elementPos'), action, actionId, window.location.href, dropPath);
        }
        else {
            saveRelationshipOnDatabase(dragPath, id, sessionStorage.getItem('uuid'), sessionStorage.getItem('elementPos'), action, actionId, window.location.href, dropPath);
        }
    }, 500);

}

function getPasteElement(ev, pasteInput) {
    let keyType = getKeyType(pasteInput);
    getPathId(path);

    setTimeout(function () {

    const action = "input";
    let actionId = getActionId(action);

    let elementPos = parseInt(sessionStorage.getItem('elementPos')) + 1;
    sessionStorage.setItem('elementPos', elementPos);

    if (elementPos === 1) {
        saveNodeOnDataBase(path, id, sessionStorage.getItem('uuid'), elementPos, action, actionId, window.location.href, keyType);
    }
    else {
        saveRelationshipOnDatabase(path, id, sessionStorage.getItem('uuid'), elementPos, action, actionId, window.location.href, keyType);
    }
    }, 500);
}

function getKeyboardElement(keyArray) {
    let elementPos = parseInt(sessionStorage.getItem('elementPos')) + 1;
    sessionStorage.setItem('elementPos', elementPos);
    getPathId(path);

    setTimeout(function () {
    const action = "input";
    let actionId = getActionId(action);

    if (elementPos === 1) {
        saveNodeOnDataBase(path, id, sessionStorage.getItem('uuid'), elementPos, action, actionId, window.location.href, keyArray);
    }
    else {
        saveRelationshipOnDatabase(path, id, sessionStorage.getItem('uuid'), elementPos, action, actionId, window.location.href, keyArray);
    }
    }, 500);

}

function saveNodeOnDataBase(path, pathId, session, elementPos, action, actionId, url, value = null) {
    xhr.open("POST", basePath + '/node/add', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        path: path,
        pathId: pathId,
        session: session,
        elementPos: elementPos,
        action: action,
        actionId: actionId,
        url: url,
        value: value
    }));
}

function saveRelationshipOnDatabase(path, pathId, session, elementPos, action, actionId, url, value = null) {
    xhr.open("POST", basePath + '/relationship/add', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        path: path,
        pathId: pathId,
        session: session,
        elementPos: elementPos,
        action: action,
        actionId: actionId,
        url: url,
        value: value
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
    console.log("path: ", '/' + segs.join('/'));
    return segs.length ? '/' + segs.join('/') : null;

}