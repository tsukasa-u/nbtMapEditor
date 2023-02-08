const wasm_module = import("../pkg/index.js").catch(console.error);

// wasm_module.then(module => {
//     console.log(module.test(1));
// });

import ProgressBar from "progressbar.js";
import {Zlib as Zlib_gunzip} from 'zlibjs/bin/gunzip.min';
import {Zlib as Zlib_gzip} from 'zlibjs/bin/gzip.min';
import {Zlib as Zlib_zip} from 'zlibjs/bin/zip.min';

var progressBar = new ProgressBar.Line(container, {
    strokeWidth: 4,
    easing: 'easeInOut',
    duration: 1400,
    color: '#FFEA82',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: {width: '100%', height: '100%'},
    text: {
    style: {
        // Text color.
        // Default: same as stroke color (options.color)
        color: '#999',
        position: 'absolute',
        right: '0',
        top: '30px',
        padding: 0,
        margin: 0,
        transform: null
    },
    autoStyleContainer: false
    },
    from: {color: '#FFEA82'},
    to: {color: '#ED6A5A'},
    step: (state, bar) => {
    bar.setText(Math.round(bar.value() * 100) + ' %');
    }
});

let colorBaseMap = [
    [0, 0, 0],
    [127, 178, 56],
    [247, 233, 163],
    [167, 167, 167],
    [255, 0, 0],
    [160, 160, 255],
    [167, 167, 167],
    [0, 124, 0],
    [255, 255, 255],
    [164, 168, 184],
    [183, 106, 47],
    [112, 112, 112],
    [64, 64, 255],
    [104, 83, 50],
    [255, 252, 245],
    [216, 127, 51],
    [178, 76, 216],
    [102, 153, 216],
    [229, 229, 51],
    [127, 204, 25],
    [242, 127, 165],
    [76, 76, 76],
    [153, 153, 153],
    [76, 127, 153],
    [127, 63, 178],
    [51, 76, 178],
    [102, 76, 51],
    [102, 127, 51],
    [153, 51, 51],
    [25, 25, 25],
    [250, 238, 77],
    [92, 219, 213],
    [74, 128, 255],
    [0, 217, 58],
    [21, 20, 31],
    [112, 2, 0],
    [126, 84, 48]
];

let RGB2XYZ = [
    [0.412453, 0.35758, 0.180423],
    [0.212671, 0.71516, 0.0721688],
    [0.0193338, 0.119194, 0.950227]
];


// let XYZ2RGB = [
//   3.240479, -1.537150, -0.498535,
//   -0.969256,  1.875991,  0.041556,
//   0.055648, -0.204043,  1.057311
// ];

let D65 = {
    Xn: 95.0489,
    Yn: 100.0,
    Zn: 108.8840
};

let colorMap = colorBaseMap.reduce((previous, current, index) => {
    return previous.concat([
    current.map((ele) => Math.floor(ele*180.0/255.0) + 0.5),
    current.map((ele) => Math.floor(ele*220.0/255.0) + 0.5),
    current,
    current.map((ele) => Math.floor(ele*135.0/255.0) + 0.5)
    ]);
}, []);

function searchColorId(src) {
    let colorID = new Uint8Array(src.data.length/4);
    for (let i = 0; i < src.data.length; i += 4) {
    colorID[i>>2] = colorMap.reduce((previous, current, index) => {
        let d = CIE2000(RGB2LAB(src.data.slice(i, i + 3)), RGB2LAB(colorMap[index]));
        return previous[1] > d ? [index, d] : previous;
    }, [-1, 9999])[0];
    progressBar.set(i/src.data.length);
    }
    return colorID;
}

// // function dragOverHandlerNBT(ev) {
// document.getElementById("nbt_zone").ondragover = (ev) => {
//     console.log('File(s) in drop zone');

//     // Prevent default behavior (Prevent file from being opened)
//     ev.preventDefault();
// }

// function dragOverHandlerImage(ev) {
document.getElementById("canvas").ondragover = (ev) => {
    console.log('File(s) in drop zone');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

let src_map_data = null;
let nbt_map_data = null;
let raw_src_data = null;
let nbt_name = "";
let map_scale = 0;
let tree = null;

nbt_map_data = fetch("./map_0.dat")
    .then((e) => e.arrayBuffer())
    .then((e) => new Uint8Array(e))
    .then((e) => new Zlib_gunzip.Gunzip(e))
    .then((e) => e.decompress())
    .then((e) => nbt2json(e, null, true)[0]);
    

// // function dropHandlerNBT(ev) {
// document.getElementById("nbt_zone").ondrop = (ev) => {
//     console.log('File(s) dropped');

//     ev.preventDefault();

//     if (ev.dataTransfer.items) {
//     for (let i = 0; i < ev.dataTransfer.items.length; i++) {
//         if (ev.dataTransfer.items[i].kind === 'file') {
//         let item = ev.dataTransfer.items[i];
//         console.log(item );
//         // console.log("type : " + item.type);
//         let reader = new FileReader();
//         let file = item.getAsFile();
//         nbt_name = file.name;
//         reader.readAsArrayBuffer(file);
//         reader.onload = function() {
//             nbt_map_data = new Promise( (resolve, reject) =>  resolve(reader.result))
//             .then((e) => new Uint8Array(e))
//             .then((e) => new Zlib.Gunzip(e))
//             .then((e) => e.decompress())
//             .then((e) => nbt2json(e, null, true))
//             .then((e) => {
//                 // editor.set(e[0]);
//                 // //   editor.get();
//                 // if (tree) jsonview.destroy(tree);
//                 // tree = jsonview.create(JSON.stringify(e[0]));
//                 // jsonview.renderJSON(tree, document.querySelector('.tree'));
//                 // jsonview.collapse(tree);
//                 // document.getElementById("nbt_zone").style.height = window.getComputedStyle(document.getElementsByClassName("jsoneditor-outer")[0]).getPropertyValue('height');
//                 return e[0];
//             });
//             console.log(nbt_map_data);
//         };
//         }
//     }
//     } else {
//     for (let i = 0; i < ev.dataTransfer.files.length; i++) {
//         console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
//     }
//     }

//     // Pass event to removeDragData for cleanup
//     removeDragData(ev);
// }

let ctx = document.getElementById("canvas").getContext("2d");
let image = new Image();

// function dropHandlerImage(ev) {
document.getElementById("canvas").ondrop = (ev) => {
    console.log('File(s) dropped');

    ev.preventDefault();

    if (ev.dataTransfer.items) {
    for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === 'file') {
        let item = ev.dataTransfer.items[i];
        console.log("type : " + item.type);
        if (item.type.match("^image/png")) {

            let reader = new FileReader();
            reader.readAsDataURL(item.getAsFile());
            reader.onload = function() {
                image.src = reader.result;
            };

            image.onload = function() {
            console.log("load");
            let canvasStyle = document.querySelector('#canvas');
            map_scale = 0;
            let draw_area_width = image.width%128 == 0 ? image.width : (image.width >> 7 << 7) + 128;
            let draw_area_height = image.height%128 == 0 ? image.height : (image.height >> 7 << 7) + 128;

            canvasStyle.setAttribute("width", String(draw_area_width) + "px");
            canvasStyle.setAttribute("height", String(draw_area_height) + "px");
            canvasStyle.style.width = String(draw_area_width) + "px";
            canvasStyle.style.height = String(draw_area_height) + "px";
            ctx.width = draw_area_width;
            ctx.height = draw_area_height;
            console.log(image);
            ctx.drawImage(image, 0, 0);

            let select = document.getElementById('select');
            while (select.firstChild) {
                select.removeChild(element.firstChild);
            }

            let i_max = draw_area_height >> 7;
            let j_max = draw_area_width >> 7;
            for (let i = 0; i < i_max; i++) {
                for (let j = 0; j < j_max; j++) {
                    let selected = document.createElement('div');
                    selected.style.backgroundColor = "rgba(128, 128, 128, .2)";
                    selected.style.width = "128px";
                    selected.style.height = "128px";
                    selected.style.position = "absolute";
                    selected.classList.add('select_on');
                    selected.style.border = "dashed gray";
                    selected.innerText = `${i_max*j + i}`;
                    selected.setAttribute("id", "selected");
                    selected.onclick = (e) => {
                        if (e.target.classList.contains("select_off") || e.target.classList.contains("select_on")) {
                            e.target.classList.toggle("select_on");
                            e.target.classList.toggle("select_off");
                        }
                        // e.target.classList.replace("select_on", "select_off");
                        // e.target.classList.replace("select_off", "select_on");
                    }
                    selected.setAttribute("data-number", `${i}-${j}`);
                    selected.style.top = String(113 + i*128) + "px";
                    // console.log(document.documentElement.clientWidth, document.documentElement.offsetWidth, document.documentElement.scrollWidth);
                    selected.style.left = String(document.documentElement.scrollWidth/2 + j*128 - (j_max << 6)) + "px";
                    select.appendChild(selected);
                }
            }
            };
        } else {

        }
        }
    }
    } else {
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
    }

    // Pass event to removeDragData for cleanup
    removeDragData(ev)
}

function removeDragData(ev) {
console.log('Removing drag data')

    if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to remove the drag data
    ev.dataTransfer.items.clear();
    } else {
    // Use DataTransfer interface to remove the drag data
    ev.dataTransfer.clearData();
    }
}
//Big Endiannes
function nbt2json(nbtarray, tagid = null, root = null) {
    let i = 0, name = null, len, tmp, taglen, n = 0;
    let data = {};
    while(tagid === null || (tagid !==null && n == 0)) {
    n++;
    if (nbtarray[i] === undefined) return [null, -1];
    switch (tagid === null ? nbtarray[i] : tagid) {
        case 0 :
        i++;
        return [data, i];
        // break;
        case 1 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        tmp = nbtarray[i + taglen + len];
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 1,
            name: name,
            data: nbtarray[i + taglen + len] & 0b1000000 ? -0x0100 + tmp : tmp,
            binary: nbtarray.slice(i, i + taglen + 1 + len)
            };
        } else {
            data = {
            data: nbtarray[i + taglen + len] & 0b1000000 ? -0x0100 + tmp : tmp,
            binary: nbtarray.slice(i, i + taglen + 1 + len)
            };
        }
        i = i + taglen + 1 + len;
        break;
        case 2 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        tmp = nbtarray[i + taglen + len] << 8 | nbtarray[i + taglen + 1 + len];
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 2,
            name: name,
            data: nbtarray[i + taglen + len] & 0b1000000 ? -0b010000 + tmp : tmp,
            binary: nbtarray.slice(i, i + taglen + 2 + len)
            };
        } else {
            data = {
            data: nbtarray[i + taglen + len] & 0b1000000 ? -0b010000 + tmp : tmp,
            binary: nbtarray.slice(i, i + taglen + 2 + len)
            };
        }
        i = i + taglen + 2 + len;
        break;
        case 3 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        tmp = nbtarray[i + taglen + len] << 24 | nbtarray[i + taglen + 1 + len] << 16 | nbtarray[i + taglen + 2 + len] << 8 | nbtarray[i + taglen + 3 + len];
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 3,
            name: name,
            data: nbtarray[i + taglen + len] & 0b1000000 ? -0b0100000000 + tmp : tmp,
            binary: nbtarray.slice(i, i + taglen + 4 + len)
            };
        } else {
            data = {
            data: nbtarray[i + taglen + len] & 0b1000000 ? -0b0100000000 + tmp : tmp,
            binary: nbtarray.slice(i, i + taglen + 4 + len)
            };
        }
        i = i + taglen + 4 + len;
        break;
        case 4 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        tmp = nbtarray[i + taglen + len] << 56 | nbtarray[i + taglen + 1 + len] << 48 | nbtarray[i + taglen + 2 + len] << 40 | nbtarray[i + taglen + 3 + len] << 32 | nbtarray[i + taglen + 4 + len] << 24 | nbtarray[i + taglen + 5 + len] << 16 | nbtarray[i + taglen + 6 + len] << 8 | nbtarray[i + taglen + 7 + len];
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 4,
            name: name,
            data: nbtarray[i + taglen + len] & 0b1000000 ? -0b010000000000000000 + tmp : tmp,
            binary: nbtarray.slice(i, i + taglen + 8 + len)
            };
        } else {
            data = {
            data: nbtarray[i + taglen + len] & 0b1000000 ? -0b010000000000000000 + tmp : tmp,
            binary: nbtarray.slice(i, i + taglen + 8 + len)
            };
        }
        i = i + taglen + 8 + len;
        break;
        case 5 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 5,
            name: name,
            data: (nbtarray[i + taglen + len] & 0b10000000 ? -1 : 1)*Math.exp(2, ((nbtarray[i + taglen + len] & 0b01111111) << 1 | nbtarray[i + taglen + 1 + len] >> 7) - 140)*(1 << 23 | (nbtarray[i + taglen + 1 + len] & 0b01111111) << 16 | nbtarray[i + taglen + 2 + len] << 8 | nbtarray[i + taglen + 3 + len]),
            binary: nbtarray.slice(i, i + taglen + 4 + len)
            };
        } else {
            data = {
            data: (nbtarray[i + taglen + len] & 0b10000000 ? -1 : 1)*Math.exp(2, ((nbtarray[i + taglen + len] & 0b01111111) << 1 | nbtarray[i + taglen + 1 + len] >> 7) - 140)*(1 << 23 | (nbtarray[i + taglen + 1 + len] & 0b01111111) << 16 | nbtarray[i + taglen + 2 + len] << 8 | nbtarray[i + taglen + 3 + len]),
            binary: nbtarray.slice(i, i + taglen + 4 + len)
            };
        }
        i = i + taglen + 4 + len;
        break;
        case 6 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 6,
            name: name,
            data: (nbtarray[i + taglen + len] & 0b10000000 ? -1 : 1)*Math.exp(2, ((nbtarray[i + taglen + len] & 0b01111111) << 4 | nbtarray[i + taglen + 1 + len] >> 4) - 1079)*(1 << 52 | (nbtarray[i + taglen + 1 + len] & 0b00001111) << 48 | nbtarray[i + taglen + 2 + len] << 40 | nbtarray[i + taglen + 3 + len] << 32 | nbtarray[i + taglen + 4 + len] << 24 | nbtarray[i + taglen + 5 + len] << 16 | nbtarray[i + taglen + 6 + len] << 8 | nbtarray[i + taglen + 7 + len]),
            binary: nbtarray.slice(i, i + taglen + 8 + len)
            };
        } else {
            data = {
            data: (nbtarray[i + taglen + len] & 0b10000000 ? -1 : 1)*Math.exp(2, ((nbtarray[i + taglen + len] & 0b01111111) << 4 | nbtarray[i + taglen + 1 + len] >> 4) - 1079)*(1 << 52 | (nbtarray[i + taglen + 1 + len] & 0b00001111) << 48 | nbtarray[i + taglen + 2 + len] << 40 | nbtarray[i + taglen + 3 + len] << 32 | nbtarray[i + taglen + 4 + len] << 24 | nbtarray[i + taglen + 5 + len] << 16 | nbtarray[i + taglen + 6 + len] << 8 | nbtarray[i + taglen + 7 + len]),
            binary: nbtarray.slice(i, i + taglen + 8 + len)
            };
        }
        i = i + taglen + 8 + len;
        break;
        case 7 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        tmp = nbtarray[i + taglen + len] << 24 | nbtarray[i + taglen + 1 + len] << 16 | nbtarray[i + taglen + 2 + len] << 8 | nbtarray[i + taglen + 3 + len];
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 7,
            name: name,
            data: nbtarray.slice(i + taglen + 4 + len, i + taglen + 4 + len + tmp),
            binary: nbtarray.slice(i, i + taglen + 4 + len + tmp)
            };
        } else {
            data = {
            data: nbtarray.slice(i + taglen + 4 + len, i + taglen + 4 + len + tmp),
            binary: nbtarray.slice(i, i + taglen + 4 + len + tmp)
            };
        }
        i = i + taglen + 4 + len + tmp;
        break;
        case 8 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        tmp = nbtarray[i + taglen + len] << 8 | nbtarray[i + taglen + 1 + len];
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 8,
            name: name,
            data: new TextDecoder().decode(nbtarray.slice(i + taglen + 2 + len, i + taglen + 2 + len + tmp)),
            binary: nbtarray.slice(i, i + taglen + 2 + len + tmp)
            };
        } else {
            data = {
            data: new TextDecoder().decode(nbtarray.slice(i + taglen + 2 + len, i + taglen + 2 + len + tmp)),
            binary: nbtarray.slice(i, i + taglen + 2 + len + tmp)
            };
        }
        i = i + taglen + 2 + len + tmp;
        break;
        case 9 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        tmp = new Array(0);
        let count = nbtarray[i + taglen+ 1 + len ] << 24 | nbtarray[i + taglen + 2 + len] << 16 | nbtarray[i + taglen + 3 + len] << 8 | nbtarray[i + taglen + 4 + len];
        let redata = [null, 0];
        let listcount = 0;
        let tagidnext = nbtarray[i + taglen + len];
        for (let j = 0; j < count; j++) {
            redata = nbt2json(nbtarray.slice(i + taglen + len + 5 + listcount), tagidnext);
            listcount += redata[1];
            tmp.push(redata[0]);
        }
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        data[name] = {
            type: 9,
            name: name,
            data: tmp,
            binary: nbtarray.slice(i, i + taglen + len + 5)
        };
        i = i + taglen + len + 5 + listcount;
        break;
        case 10 :
        // console.log(nbtarray);
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        tmp = nbt2json(nbtarray.slice(i + taglen + len), null);
        if (tmp[0] === null) return tmp;
        name = len == 0 ? "null" : new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 10,
            name: name,
            data: tmp[0],
            binary: nbtarray.slice(i, i + taglen + len)
            };
        } else {
            data = {
            type: 10,
            data: tmp[0],
            binary: nbtarray.slice(i, i + taglen + len)
            };
        }
        i = i + taglen + len + tmp[1];
        if (root) return [data, -1];
        break;
        case 11 :
        taglen = tagid===null ? 3 : 0
        len = tagid===null ? nbtarray[i + 1] << 8 | nbtarray[i + 2] : 0;
        tmp = nbtarray[i + taglen + len] << 24 | nbtarray[i + taglen + 1 + len] << 16 | nbtarray[i + taglen + 2 + len] << 8 | nbtarray[i + taglen + 3 + len];
        name = new TextDecoder().decode(nbtarray.slice(i + taglen, i + taglen + len));
        if (tagid === null) {
            data[name] = {
            type: 11,
            name: name,
            data: (new Array(tmp)).map((element, index) => nbtarray[i + taglen + 4 + len + index*4] << 24 | nbtarray[i + taglen + 5 + len + index*4] << 16 | nbtarray[i + taglen + 6 + len + index*4] << 8 | nbtarray[i + taglen + 7 + len + index*4]),
            binary: nbtarray.slice(i, i + taglen + 4 + len + tmp*4)
            };
        } else {
            data = {
            data: (new Array(tmp)).map((element, index) => nbtarray[i + taglen + 4 + len + index*4] << 24 | nbtarray[i + taglen + 5 + len + index*4] << 16 | nbtarray[i + taglen + 6 + len + index*4] << 8 | nbtarray[i + taglen + 7 + len + index*4]),
            binary: nbtarray.slice(i, i + taglen + 4 + len + tmp*4)
            };
        }
        i = i + taglen + 4 + len + tmp*4;
    }
    }
    return [data, i];
}

function json2nbt(jsondata) {
    let data = Object.keys(jsondata).reduce((previous, current, index) => {
    if (jsondata[current].type == 10) {
        // return previous.concat(jsondata[current].binary, json2nbt(jsondata[current].data), [0]);
        let tmp = json2nbt(jsondata[current].data);
        let ret = new Uint8Array(previous.length + jsondata[current].binary.length + tmp.length + 1);
        ret.set(previous, 0);
        ret.set(jsondata[current].binary, previous.length)
        ret.set(tmp, previous.length + jsondata[current].binary.length);
        ret.set([0], ret.length - 1)
        return ret;
    } else if (jsondata[current].type == 9) {
        // return previous.concat(jsondata[current].binary, json2nbt(jsondata[current].data));
        let tmp = json2nbt(jsondata[current].data);
        let ret = new Uint8Array(previous.length + jsondata[current].binary.length + tmp.length);
        ret.set(previous, 0);
        ret.set(jsondata[current].binary, previous.length)
        ret.set(tmp, previous.length + jsondata[current].binary.length);
        return ret;
    } else {
        let ret = new Uint8Array(previous.length + jsondata[current].binary.length);
        ret.set(previous, 0);
        ret.set(jsondata[current].binary, previous.length);
        return ret;
        // return previous.concat(jsondata[current].binary);
    }
    }, []);
    return data;
}

document.getElementById("download_button").onclick = (evt) => {
    // evt.preventDefault();

    if (nbt_map_data  && src_map_data) {
    nbt_map_data.then((mapdata) => {
        // console.log(mapdata);
        mapdata.null.data.data.data.scale.binary.set([map_scale], mapdata.null.data.data.data.scale.binary.length -1);
        mapdata.null.data.data.data.scale.data = map_scale;

        mapdata.null.data.data.data.locked.binary.set([1], mapdata.null.data.data.data.locked.binary.length - 1);
        mapdata.null.data.data.data.locked.data = 1;
        var zip = new Zlib_zip.Zip();
        let map_begin_id = Number(document.getElementById("mapid").value);
        if (src_map_data) {
            console.log(src_map_data);
        src_map_data.forEach((ele, index) => {
            // console.log(ele);
            let tmp = mapdata.null.data.data.data.colors.binary.slice(0, 9);
            mapdata.null.data.data.data.colors.binary = new Uint8Array(13 + (1 << 14));
            mapdata.null.data.data.data.colors.binary.set(tmp, 0);
            mapdata.null.data.data.data.colors.binary.set([0, 0, 1 << 6, 0], 9);
            mapdata.null.data.data.data.colors.binary.set(ele, 13);
            mapdata.null.data.data.data.colors.data = ele;
            
            let nbt_raw_data = json2nbt(mapdata);
            let gzip =  new Zlib_gzip.Gzip(nbt_raw_data);
            let ziped_nbt = gzip.compress();
            zip.addFile(ziped_nbt, {
                filename: stringToByteArray(`map_${map_begin_id + index}.dat`)
            });

            function stringToByteArray(str) {
                var array = new (window.Uint8Array !== void 0 ? Uint8Array : Array)(str.length);
                var i;
                var il;

                for (i = 0, il = str.length; i < il; ++i) {
                    array[i] = str.charCodeAt(i) & 0xff;
                }

                return array;
            }
        });
        return zip.compress();
        } else {
        return null;
        }
    })
    .then((compressData) => {
        if (compressData) {
        let blob = new Blob([compressData], { 'type': 'application/zip' });
        document.getElementById("download_button").download = "nbtmap.zip";
        document.getElementById("download_button").href = URL.createObjectURL(blob);
        }
    })
    }
}

document.getElementById("writer").onclick = () => {
    src_map_data = [];
    let is_use_cie2000 = document.getElementById("cie2000").checked;
    new Promise(async (resolve, reject) => resolve())
    .then(() => {
    progressBar.set(0.0);
    document.getElementById("writeState").innerHTML = "Writing ...";
    })
    .then(() => new Promise(r => setTimeout(r, 100)))
    .then(() => {
    // try {
        let selected = document.getElementById("select").childNodes;
        let max_selected = selected.length;
        let count = 0;
        let color = new Uint8Array(colorMap.length*3);
        let bg = Number(document.getElementById("bgcolor").value.slice(1));
        let bgcolor = [(bg >> 16) & 0xFF, (bg >> 8) & 0xFF, bg & 0xFF];
        let inputbg = new Uint8Array(3);
        inputbg.set(bgcolor);
        color.set(colorMap.flat(), 0);
        selected.forEach((ele) => {
            if (ele.classList.contains("select_on")) {
                let yx = ele.dataset.number.split("-");
                raw_src_data = ctx.getImageData(Number(yx[1])*128, Number(yx[0])*128, 128, 128);
                // console.log(raw_src_data);

                let input = new Uint8Array(raw_src_data.data.length);
                input.set(raw_src_data.data, 0);
                let output = new Uint8Array(1<<14);
                wasm_module.then((module) => {
                    if (is_use_cie2000) {
                        module.search_color_id(input, output, color, inputbg);
                    } else {
                        module.search_color_id2(input, output, color, inputbg);
                    }
                    // console.log(input);
                    // console.log(raw_src_data);
                    // }).then(() => {
                });
                src_map_data.push(output);
                console.log(output);
                progressBar.set(count/max_selected);
                count++;
            }
        });
        progressBar.set(1.0);
        document.getElementById("writeState").innerHTML = "finish";
    });
}

// document.getElementById("nbt_zone").onclick = (e) => {
//     document.getElementById("nbt_zone").style.height = window.getComputedStyle(document.getElementsByClassName("jsoneditor-outer")[0]).getPropertyValue('height');
// }

document.getElementById("bgcolor").oninput = (e) => {
    ctx.fillStyle = e.target.value;
    console.log("change");
    ctx.fillRect(0, 0, ctx.width, ctx.height);
    ctx.drawImage(image, 0, 0);
}
