function fixElementsOfType(type) {
    var blockStart, blockEnd, newBlock, elems;

    elems = document.getElementsByTagName('/' + type);
    while (elems.length) {
        blockEnd = elems[0];
        blockStart = blockEnd.parentNode.firstChild;
        while (blockStart && blockStart.nodeName != type) {
            blockStart = blockStart.nextSibling;
        }

        if (!blockStart) {
            alert('Could not find starting element of type ' + type + '!');
            break;
        }

        newBlock = document.createElement('DIV');
        newBlock.className = 'ie' + type.toLowerCase();
        if (blockStart.className.length) {
            newBlock.className += ' ' + blockStart.className;
        }

        while (blockStart.nextSibling != blockEnd) {
            newBlock.appendChild(blockStart.nextSibling);
        }

        blockEnd.parentNode.insertBefore(newBlock, blockStart);
        newBlock.parentNode.removeChild(blockStart);
        newBlock.parentNode.removeChild(blockEnd);
    }

    elems = document.getElementsByTagName(type);
    while (elems.length) {
        blockStart = elems[0];
        if (blockStart.childNodes.length > 1) {
            break;
        }

        blockEnd = blockStart.nextSibling;
        while (blockEnd) {
            if (blockEnd.nodeType == 8 && blockEnd.data.indexOf('/' + type.toLowerCase()) > -1) {
                break;
            } else {
                blockEnd = blockEnd.nextSibling;
            }
        }

        if (!blockEnd) {
            break;
        }

        newBlock = document.createElement('DIV');
        newBlock.className = 'ie' + type.toLowerCase();
        if (blockStart.className.length) {
            newBlock.className += ' ' + blockStart.className;
        }

        while (blockStart.nextSibling != blockEnd) {
            newBlock.appendChild(blockStart.nextSibling);
        }

        blockEnd.parentNode.insertBefore(newBlock, blockStart);
        newBlock.parentNode.removeChild(blockStart);
        newBlock.parentNode.removeChild(blockEnd);
    }
}

if (document.createElement && typeof(HTMLHeaderElement) === "undefined") {
    document.createElement('header');
    document.createElement('main');
    document.createElement('article');
    document.createElement('section');
    document.createElement('footer');

    window.onload = function() {
        fixElementsOfType('HEADER');
        fixElementsOfType('MAIN');
        fixElementsOfType('ARTICLE');
        fixElementsOfType('SECTION');
        fixElementsOfType('FOOTER');
    };
}
