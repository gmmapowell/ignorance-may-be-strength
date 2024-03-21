// this function is from @johnpyp on stackoverflow - https://stackoverflow.com/a/45831280
// just call this method to handle a download; something like:
// download("share-calendar.json", JSON.stringify(assemblePropertiesObject()));

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
