// # Fooocus4BL. Migrated from WebUI
// https://github.com/yankooliveira/sd-webui-photopea-embed/blob/99ea83f925f187a959b177318b16f840a3cdc11d/javascript/photopea-bindings.js#L6

var photopeaWindow = null;
var photopeaIframe = null;

var elem_id_vary = "component-27";
var elem_id_inpaint = "component-71";
var elem_id_cns = ["component-36", "component-44","component-52","component-60"]

// Called by the iframe set up on photopea-tab.py.
function onPhotopeaLoaded(iframe) {
    console.log("Fooocus4BL: Photopea loaded");
    photopeaWindow = iframe.contentWindow;
    photopeaIframe = iframe;

    gradioApp().getElementById("pea_from_gal1_button").addEventListener('click', (event) => {
        let progress_gallery = document.getElementsByClassName("image_gallery");
        if(!progress_gallery || progress_gallery.length < 1){return;}
        let g_images = progress_gallery[0].querySelectorAll("img");
        let outgoingImg = g_images?g_images[0]:null;
        openImageInPhotopea(outgoingImg);
    })
    gradioApp().getElementById("pea_from_gal2_button").addEventListener('click', (event) => {
        let progress_gallery = document.getElementsByClassName("image_gallery");
        if(!progress_gallery || progress_gallery.length < 1){return;}
        let g_images = progress_gallery[0].querySelectorAll("img");
        let outgoingImg = g_images?g_images[1]:null;
        openImageInPhotopea(outgoingImg)
    })
    gradioApp().getElementById("pea_to_vary_button").addEventListener('click', (event) => {
        getAndSendImageToWebUITab(switchToVaryWithImage);
    })
    gradioApp().getElementById("pea_to_inpaint_button").addEventListener('click', (event) => {
        getAndSendImageToWebUITab(switchToInpaintWithImage);
    })

    gradioApp().getElementById("cn1_to_pea_button").addEventListener('click', (event) => {
        const g_images = gradioApp().getElementById(elem_id_cns[0])?.querySelectorAll("img");
        let outgoingImg = g_images?g_images[0]:null;
        openImageInPhotopea(outgoingImg)
    })
    gradioApp().getElementById("cn2_to_pea_button").addEventListener('click', (event) => {
        const g_images = gradioApp().getElementById(elem_id_cns[1])?.querySelectorAll("img");
        let outgoingImg = g_images?g_images[0]:null;
        openImageInPhotopea(outgoingImg)
    })
    gradioApp().getElementById("cn3_to_pea_button").addEventListener('click', (event) => {
        const g_images = gradioApp().getElementById(elem_id_cns[2])?.querySelectorAll("img");
        let outgoingImg = g_images?g_images[0]:null;
        openImageInPhotopea(outgoingImg)
    })
    gradioApp().getElementById("cn4_to_pea_button").addEventListener('click', (event) => {
        const g_images = gradioApp().getElementById(elem_id_cns[3])?.querySelectorAll("img");
        let outgoingImg = g_images?g_images[0]:null;
        openImageInPhotopea(outgoingImg)
    })

    gradioApp().getElementById("pea_to_cn1_button").addEventListener('click', (event) => {
        getAndSendImageToWebUITab( (img_file) => switchToCNWithImage(img_file, elem_id_cns[0]) );
    })
    gradioApp().getElementById("pea_to_cn2_button").addEventListener('click', (event) => {
        getAndSendImageToWebUITab( (img_file) => switchToCNWithImage(img_file, elem_id_cns[1]) );
    })
    gradioApp().getElementById("pea_to_cn3_button").addEventListener('click', (event) => {
        getAndSendImageToWebUITab( (img_file) => switchToCNWithImage(img_file, elem_id_cns[2]) );
    })
    gradioApp().getElementById("pea_to_cn4_button").addEventListener('click', (event) => {
        getAndSendImageToWebUITab( (img_file) => switchToCNWithImage(img_file, elem_id_cns[3]) );
    })

    // // Listen to the size slider changes.
    // gradioApp().getElementById("photopeaIframeSlider").addEventListener('input', (event) => {
    //     // Get the value of the slider and parse it as an integer
    //     const newHeight = parseInt(event.target.value);

    //     // Update the height of the iframe
    //     photopeaIframe.style.height = newHeight + 'px';
    // });
}

window.onFooocusUILoaded = function() {
    console.log("Fooocus4BL: UI loaded");
    // CNs extension - image name parsing into CN parameters
    setupCNAutoprep(elem_id_cns[0]);
    setupCNAutoprep(elem_id_cns[1]);
    setupCNAutoprep(elem_id_cns[2]);
    setupCNAutoprep(elem_id_cns[3]);
}

function setupCNAutoprep(elem_id){
    const imageInput_cn1 = gradioApp().getElementById(elem_id)?.querySelector("input[type='file']");
    function applyFName(fname){
        console.log("setupCNAutoprep: CN file detected", fname);
        const dotIndex = fname?.lastIndexOf(".");
        if (dotIndex === -1) { return };
        // Splitting by "-" ignoring extension (last one)
        fname = fname.substring(0, dotIndex);
        var spl = fname.split("-");
        if(!spl || spl.length == 0){ return; }
        // console.log("setupCNAutoprep: parts", spl);
        // Checking if there is tab-id or tab-name
        // let cn1_tabs = gradioApp().getElementById(elem_id)?.querySelectorAll("input[type='radio']");
        for(var ii of spl){
            let cn1_tab = gradioApp().getElementById(elem_id)?.querySelector("input[type='radio'][value='"+ii+"'");
            if(cn1_tab){
                cn1_tab.checked = true;
                cn1_tab.dispatchEvent(new Event('change', { 'bubbles': true }));
                let cn_sa = extractNumberWithPrefix(fname,"-sa");
                let cn_w = extractNumberWithPrefix(fname,"-w");
                console.log("setupCNAutoprep: CN type detected", ii, cn_sa, cn_w);
                setTimeout(()=>{
                    let num_inputs = gradioApp().getElementById(elem_id)?.querySelectorAll("input[type='number']");
                    // console.log("setupCNAutoprep: CN type num_inputs", ii, num_inputs);
                    if(num_inputs && num_inputs[0] && cn_sa){
                        num_inputs[0].value = cn_sa/100.0;
                        num_inputs[0].dispatchEvent(new Event('input', { 'bubbles': true }));
                    }
                    if(num_inputs && num_inputs[1] && cn_w){
                        num_inputs[1].value = cn_w/100.0;
                        num_inputs[1].dispatchEvent(new Event('input', { 'bubbles': true }));
                    }
                }, 1000);
                break;
            }
        }
    }
    imageInput_cn1.onchange = function () {
        try{
            let fname = this.files[0].name;
            setTimeout(()=>applyFName(fname), 700);
        }catch(e){
            console.log("setupCNAutoprep: failed, exc:",e)
        }
    };
    const dropZone_cn1 = gradioApp().getElementById(elem_id)?.querySelector(".image-container > div");
    dropZone_cn1.addEventListener("drop", (e) => {
        try{
            let fname = e.dataTransfer.files[0].name;
            setTimeout(()=>applyFName(fname), 700);
        }catch(e){
            console.log("setupCNAutoprep: failed, exc:",e)
        }
    });
}

// Gets the currently selected image in a WebUI gallery and opens it in Photopea.
function openImageInPhotopea(outgoingImg) {
    if(!outgoingImg || !outgoingImg.src){
        alert("No image found");
        return;
    }
    var imageSizeMatches = true;

    // First, check the image size to see if we have matching sizes. If it's bigger, we open it
    // as a new document. Otherwise, we just append it to the current document as a new layer.
    postMessageToPhotopea(getPhotopeaScriptString(pea_getActiveDocumentSize)).then((response) => {
        const activeDocSize = response[0].split(",");
        if (outgoingImg.naturalWidth > activeDocSize[0] || 
            outgoingImg.naturalHeight > activeDocSize[1]) {
            imageSizeMatches = false;
        }

        blobTob64(outgoingImg.src, (imageData) => {
            // Actually open the image, passing `imageSizeMatches` into Photopea's "open as new document" parameter.
            postMessageToPhotopea(`app.open("${imageData}", null, ${imageSizeMatches});`, "*")
                .then(() => {
                    if (imageSizeMatches) {
                        postMessageToPhotopea(`app.activeDocument.activeLayer.rasterize();`, "*");
                    } else {
                        postMessageToPhotopea(
                            `alert("New document created (the image sent is bigger than the active document)");`,
                            "*");
                    }
                });
        });
    });
}

// Requests the image from Photopea, converts the array result into a base64 png, then a blob, then actually send it to the WebUI.
function getAndSendImageToWebUITab(continuation) {
    // Photopea only allows exporting the whole image
    const saveMessage = 'app.activeDocument.saveToOE("png");';
    postMessageToPhotopea(saveMessage)
        .then((resultArray) => {
            // The first index of the payload is an ArrayBuffer of the image. We convert that to
            // base64 string, then to blob, so it can be sent to a specific image widget in WebUI.
            // There's likely a direct ArrayBuffer -> Blob conversion, but we're already using b64
            // as an intermediate format.
            const base64Png = base64ArrayBuffer(resultArray[0]);
            let blob = b64toBlob(base64Png, "image/png")
            const file = new File([blob], "photopea_output.png")
            continuation(file);
        });
}

function switchToTab(tab) {
    const tabs = Array.from(gradioApp().querySelectorAll('.tabs > .tab-nav > button'));
    const btn = tabs?.find((t) => (t.innerText === tab));
    if (btn) {
        btn.click();
    }
}

function switchToVaryWithImage(image_file){
    switchToTab('Upscale or Variation');
    const imageInput = gradioApp().getElementById(elem_id_vary)?.querySelector("input[type='file']");
    setImageOnInput(imageInput, image_file);
}
function switchToInpaintWithImage(image_file){
    switchToTab('Inpaint or Outpaint');
    const imageInput = gradioApp().getElementById(elem_id_inpaint)?.querySelector("input[type='file']");
    setImageOnInput(imageInput, image_file);
}
function switchToCNWithImage(image_file, comp_id){
    switchToTab('Image Prompt');
    const imageInput = gradioApp().getElementById(comp_id)?.querySelector("input[type='file']");
    setImageOnInput(imageInput, image_file);
}

// Gradio's image widgets are inputs. To set the image in one, we set the image on the input and
// force it to refresh.
function setImageOnInput(imageInput, file) {
    if(!imageInput){
        alert("UI not recognized");
        return;
    }
    if(!file){
        alert("Image not valid");
        return;
    }
    // Createa a data transfer element to set as the data in the input.
    const dt = new DataTransfer();
    dt.items.add(file);
    const list = dt.files;
    // Actually set the image in the image widget.
    imageInput.files = list;
    // Foce the image widget to update with the new image, after setting its source files.
    const event = new Event('change', {
        'bubbles': true,
        "composed": true
    });
    imageInput.dispatchEvent(event);
}

// Transforms a JS function body into a string that can be passed as a message to Photopea.
function getPhotopeaScriptString(func) {
    return func.toString() + `${func.name}();`
}

// Posts a message and receives back a promise that will eventually return a 2-element array. One of
// them will be Photopea's "done" message, and the other the actual payload.
async function postMessageToPhotopea(message) {
    var request = new Promise(function (resolve, reject) {
        var responses = [];
        var photopeaMessageHandle = function (response) {
            responses.push(response.data);
            // Photopea will first return the resulting data as a message to the parent window, then
            // another message saying "done". When we receive the latter, we fulfill the promise.
            if (response.data == "done") {
                window.removeEventListener("message", photopeaMessageHandle);
                resolve(responses)
            }
        };
        // Add a listener to wait for Photopea's response messages.
        window.addEventListener("message", photopeaMessageHandle);
    });
    // Actually execute the request to Photopea.
    photopeaWindow.postMessage(message, "*");
    return await request;
}

// // Returns a promise that will be resolved when the div passed in the parameter is modified.
// // This will happen when Gradio reconstructs the UI after, e.g., changing tabs.
// async function waitForWebUiUpdate(divToWatch) {
//     const promise = new Promise((resolve, reject) => {
//         // Options for the observer (which mutations to observe)
//         const mutationConfig = { attributes: true, childList: true, subtree: true };
//         // Callback for when mutation happened. Will simply invoke the passed `onDivUpdated` and
//         // stop observing.
//         const onMutationHappened = (mutationList, observer) => {
//             observer.disconnect();
//             resolve();
//         }
//         const observer = new MutationObserver(onMutationHappened);
//         observer.observe(divToWatch, mutationConfig);
//     });

//     return await promise;
// }

// Turn an image into a b64 string.
// From https://stackoverflow.com/questions/6150289/how-can-i-convert-an-image-into-base64-string-using-javascript
function blobTob64(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

// Turn a base64 string into a blob. 
// From https://gist.github.com/gauravmehla/7a7dfd87dd7d1b13697b6e894426615f
function b64toBlob(b64Data, contentType, sliceSize) {
    var contentType = contentType || '';
    var sliceSize = sliceSize || 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
}

// From: https://gist.github.com/jonleighton/958841
function base64ArrayBuffer(arrayBuffer) {
    var base64 = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes = new Uint8Array(arrayBuffer)
    var byteLength = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
}

// from https://github.com/yankooliveira/sd-webui-photopea-embed/blob/99ea83f925f187a959b177318b16f840a3cdc11d/javascript/photopea-scripts.js#L76
function pea_getActiveDocumentSize() {
    app.echoToOE(app.activeDocument.width + "," + app.activeDocument.height);
}

function extractNumberWithPrefix(str, prefix) {
    var onum = null;
    try{
        // Create a regular expression dynamically with the prefix
        // The \d+ matches one or more digits
        const regex = new RegExp(prefix + "(\\d+)");
        // Use the match() method to find the number after the prefix
        const match = str.match(regex);
        onum = match ? parseInt(match[1]) : null;
    }catch(e){
        return null;
    }
    return onum
}