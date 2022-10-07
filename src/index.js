import JSONEditor from "jsoneditor";
import ProgressBar from "progressbar.js";
import Zlib from "zlib";
import init, { search_color_id} from "./../wasm/pkg/hello_wasm.js";

let wasm_init =  init();

let editor = new JSONEditor(document.getElementById('container'));



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
// // console.log(colorMap);
// let colorMapD1 = new Array(4*4*4); 
// for (let r=0; r<4; r++) {
//   for (let g=0; r<4; g++) {
//     for (let b=0; b<4; b++) {
//       colorMapD1[r << 4 | g << 2 | b] = colorMap.reduce((previous, current, index) => {
//         let d = CIE2000(RGB2LAB([r*64, g*64, b*64]), RGB2LAB(colorMap[index]));
//         // console.log(d, src.data.slice(i, i + 3), colorMap[index]);
//         return previous[1] > d ? [index, d] : previous;
//       }, [-1, 9999])[0]
//     }
//   }
// }
// console.log(colorMapD1);

// function RGB2LAB(rgb) {

//   const f = (t) => {
//     if (t>0.008856) {
//       return Math.pow(t, 1/3);
//     } else {
//       return 7.787037*t + 4/29;
//     }
//   }

//   let color3 = rgb.slice(0, 3);
//   let xyz = RGB2XYZ.map((element) => element[0]*color3[0] + element[1]*color3[1] + element[2]*color3[2]);
//   let LStar = 116*f(xyz[1]/D65.Yn) - 16;
//   let aStar = 500*(f(xyz[0]/D65.Xn) - f(xyz[1]/D65.Yn));
//   let bStar = 200*(f(xyz[1]/D65.Yn) - f(xyz[2]/D65.Zn));
//   let CStar = Math.sqrt(aStar*aStar + bStar*bStar);
//   return [LStar, aStar, bStar, CStar];
// }

const LAB_FT = Math.pow(6 / 29, 3);
function RGB2LAB(rgb) {
let r = rgb[0]/255;
let g = rgb[1]/255;
let b = rgb[2]/255;

// Assume sRGB
r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

let x = (r * 0.4124564) + (g * 0.3575761) + (b * 0.1804375);
let y = (r * 0.2126729) + (g * 0.7151522) + (b * 0.072175);
let z = (r * 0.0193339) + (g * 0.119192) + (b * 0.9503041);

x *= 100;
y *= 100;
z *= 100;

x /= 95.047;
y /= 100;
z /= 108.883;

x = x > LAB_FT ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
y = y > LAB_FT ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
z = z > LAB_FT ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);
let lab = [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];

return lab.concat(Math.sqrt(Math.pow(lab[1], 2) + Math.pow(lab[2], 2)));

}

function dLAB(labch1, labch2) {
return Math.sqrt(Math.pow(labch1[0]-labch2[0], 2) + Math.pow(labch1[1]-labch2[1], 2) + Math.pow(labch1[2]-labch2[2], 2));
}

function CIE2000(labch1, labch2, kL=1.835, kC=1, kH=1) {
let DeltaL = labch2[0] - labch1[0];
let L_ = (labch2[0] + labch1[0])/2;
let C_ = (labch2[3] + labch1[3])/2; 
let a1p = labch1[1] + labch1[1]/2*(1 - Math.sqrt(Math.pow(C_, 7)/(Math.pow(C_, 7) + Math.pow(25, 7))));
let a2p = labch2[1] + labch2[1]/2*(1 - Math.sqrt(Math.pow(C_, 7)/(Math.pow(C_, 7) + Math.pow(25, 7))));
let C1p = Math.sqrt(a1p*a1p + labch1[2]*labch1[2]);
let C2p = Math.sqrt(a2p*a2p + labch2[2]*labch2[2]);
let Cp_ = (C1p + C2p)/2;
let DeltaCp = C1p - C2p;
let h1p = Math.atan2(labch1[2], a1p);
if (h1p < 0) h1p += 2*Math.PI;
let h2p = Math.atan2(labch2[2], a2p);
if (h2p < 0) h2p += 2*Math.PI;
let Deltah;
if (Math.abs(h2p - h1p) <= Math.PI) {
  Deltah = h2p - h1p;
} else {
  if (h2p <= h1p){
    Deltah = h2p - h1p + 2*Math.PI;
  } else {
    Deltah = h2p - h1p - 2*Math.PI;
  }
}
let DeltaH = 2*Math.sqrt(C1p*C2p)*Math.sin(Deltah/2);
let H_;
if (Math.abs(h2p - h1p) <= Math.PI) {
  H_ = (h2p + h1p)/2;
} else {
  H_ = (h2p + h1p + 2*Math.PI)/2;
}
let T = 1 - 0.17*Math.cos(H_ - Math.PI/6) + 0.24*Math.cos(2*H_) + 0.32*Math.cos(3*H_ + Math.PI/30) - 0.20*Math.cos(4*H_ - 0.35*Math.PI);
let SL = 1 + 0.015*Math.pow(L_ - 50, 2)/Math.sqrt(20 + Math.pow(L_ - 50, 2));
let SC = 1 + 0.045*Cp_;
let SH = 1 + 0.015*Cp_*T;
let RT = -2*Math.sqrt(Math.pow(Cp_, 7)/(Math.pow(Cp_, 7) + Math.pow(25, 7)))*Math.sin(Math.PI/3*Math.exp(-Math.pow((H_ - 275/180*Math.PI)/(25/180*Math.PI), 2)));
return Math.sqrt(Math.pow(DeltaL/kL/SL, 2) + Math.pow(DeltaCp/kC/SC, 2) + Math.pow(DeltaH/kH/SH, 2) + RT*DeltaCp/kC/SC*DeltaH/kH/SH);
}

function searchColorId(src) {
let colorID = new Uint8Array(src.data.length/4);
// colorID.fill(57);
// console.log(src.data);
for (let i = 0; i < src.data.length; i += 4) {
  colorID[i>>2] = colorMap.reduce((previous, current, index) => {
    // let d = CIE2000(RGB2LAB(src.data.slice(i, i + 3)), RGB2LAB(colorMap[index]));
    let d = CIE2000(RGB2LAB(src.data.slice(i, i + 3)), RGB2LAB(colorMap[index]));
    return previous[1] > d ? [index, d] : previous;
  }, [-1, 9999])[0];
  // console.log(i, colorID[i>>2], src.data.slice(i, i + 3));
  // if (src.data.slice(i, i + 3)[0] != 255)  console.log(i, colorID[i>>2], src.data.slice(i, i + 3));
  progressBar.set(i/src.data.length);
}
return colorID;
}

function dragOverHandlerNBT(ev) {
console.log('File(s) in drop zone');

// Prevent default behavior (Prevent file from being opened)
ev.preventDefault();
}

function dragOverHandlerImage(ev) {
console.log('File(s) in drop zone');

// Prevent default behavior (Prevent file from being opened)
ev.preventDefault();
}

let src_map_data = null;
let nbt_map_data = null;
let raw_src_data = null;
let nbt_name = "";
let map_scale = 0;

function dropHandlerNBT(ev) {
console.log('File(s) dropped');

ev.preventDefault();

if (ev.dataTransfer.items) {
  for (let i = 0; i < ev.dataTransfer.items.length; i++) {
    if (ev.dataTransfer.items[i].kind === 'file') {
      let item = ev.dataTransfer.items[i];
      console.log(item );
      // console.log("type : " + item.type);
      let reader = new FileReader();
      let file = item.getAsFile();
      nbt_name = file.name;
      reader.readAsArrayBuffer(file);
      reader.onload = function() {
        nbt_map_data = new Promise( (resolve, reject) => {return resolve(reader.result)})
        .then((e) => new Uint8Array(e))
        .then((e) => new Zlib.Gunzip(e))
        .then((e) => e.decompress())
        .then((e) => nbt2json(e, null, true))
        .then((e) => {
          editor.set(e[0]);
        //   editor.get();
          document.getElementById("nbt_zone").style.height = window.getComputedStyle(document.getElementsByClassName("json-container")[0]).getPropertyValue('height');
          return e[0];
        });
        // console.log(nbt_map_data);
      };
    }
  }
} else {
  for (let i = 0; i < ev.dataTransfer.files.length; i++) {
    console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
  }
}

// Pass event to removeDragData for cleanup
removeDragData(ev)
}

let ctx = document.getElementById("canvas").getContext("2d");
let image = new Image();

function dropHandlerImage(ev) {
console.log('File(s) dropped');

ev.preventDefault();

if (ev.dataTransfer.items) {
  for (let i = 0; i < ev.dataTransfer.items.length; i++) {
    if (ev.dataTransfer.items[i].kind === 'file') {
      let item = ev.dataTransfer.items[i];
      // console.log('... file[' + i + '].name = ' + item.name );
      console.log("type : " + item.type);
      if (item.type.match("^image/png")) {

        let reader = new FileReader();
        reader.readAsDataURL(item.getAsFile());
        // console.log(item.getAsFile().arrayBuffer());
        reader.onload = function() {
          image.src = reader.result;
          // console.log(image.src);
        };

        image.onload = function() {
          console.log("load");
          let canvasStyle = document.querySelector('#canvas');
          // canvasStyle.width = document.documentElement.clientWidth*0.7;
          // canvasStyle.height = canvasStyle.width*image.height/image.width;
          // let wScale = Math.log2(image.width>>7);
          // let hScale = Math.log2(image.height>>7);
          // if (wScale == NaN || hScale == NaN) {
            map_scale = 0;
          // } else {
          //   map_scale = wScale > hScale ? wScale : hScale;
          //   if (map_scale > 4) map_scale = 4;
          // }
          // console.log(String(image.width >> 7 << 7) + "px", String(image.height >> 7 << 7) + "px");
          let draw_area_width = image.width%128 == 0 ? image.width : (image.width >> 7 << 7) + 128;
          let draw_area_height = image.height%128 == 0 ? image.height : (image.height >> 7 << 7) + 128;

          canvasStyle.setAttribute("width", String(draw_area_width) + "px");
          canvasStyle.setAttribute("height", String(draw_area_height) + "px");
          canvasStyle.style.width = String(draw_area_width) + "px";
          canvasStyle.style.height = String(draw_area_height) + "px";
          ctx.width = draw_area_width;
          ctx.height = draw_area_height;
          // ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasStyle.width, canvasStyle.width*image.height/image.width);
          // ctx.drawImage(image, 0, 0, canvasStyle.width, canvasStyle.width);
          console.log(image);
          ctx.drawImage(image, 0, 0);
          // console.log(ctx.getImageData(0, 0, image.width, image.height).data.length);
          // raw_src_data = ctx.getImageData(0, 0, image.width, image.height);
          // raw_src_data = ctx.getImageData(0, 0, ctx.width, ctx.height);
          // console.log(raw_src_data);
          // src_map_data = searchColorId(raw_src_data);
          // console.log("!")
          // console.log(src_map_data);

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
              selected.innerText = `${i_max*i + j}`;
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
              selected.style.left = String(document.documentElement.scrollWidth/2 + j*128 - (image.width >> 7 << 6)) + "px";
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
// console.log(nbtarray);
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
  // console.log(name, nbtarray[i], tagid);
}
return [data, i];
}

function json2nbt(jsondata) {
// console.log(Object.keys(jsondata));
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

//     let crc_table = new Uint32Array(256);

//     let crc_table_computed = 0;

//     function make_crc_table() {
//       let c = 0n;
//       let n, k;
//       for (n = 0; n < 256; n++) {
//         c = n;
//         for (k = 0; k < 8; k++) {
//           if (c & 1) {
//             c = 0xedb88320n ^ (c >> 1);
//           } else {
//             c = c >> 1;
//           }
//         }
//         crc_table[n] = c;
//       }
//       crc_table_computed = 1;
//     }

//     function update_crc(crc, buf, len) {
//       c = crc ^ 0xffffffffn;
//       let n;

//       if (!crc_table_computed)
//         make_crc_table();
//       for (n = 0; n < len; n++) {
//         c = crc_table[(c ^ buf[n]) & 0xff] ^ (c >> 8);
//       }
//       return c ^ 0xffffffffn;
//     }

//     function crc(buf, len) {
//       return update_crc(0n, buf, len);
//     }
// // little endiannes
//     function gunzip(binary) {
//       let ID1 = binary[0];
//       let ID2 = binary[1];
//       let CM = binary[2];
//       let FLG = binary[3];
//       let MTIME = binary[4] << 3 | binary[5] << 2 | binary[6] << 1 | binary[7];
//       let XFL = binary[8];
//       let OS = binary[9];
//       if (ID1 !== 0x1F) return [null, "ID1"];
//       if (ID2 !== 0x8B) return [null, "ID2"];
//       if (!(CM & (1 << 7))) return [null, "CM"];
//       let FTEXT = FLG & 1;
//       let FHCRC = FLG & (1 << 1);
//       let FEXTRA = FLG & (1 << 2);
//       let FNAME = FLG & (1 << 3);
//       let FCOMMENT = FLG & (1 << 4);
//       if (FLG & (0b111 << 5)) return [null, "FLG RESERVED"];
//       let crcBuf = FHCRC ? binary.slice(0, 10) : null;
//       binary = binary.slice(10);
//       let exFeild = FEXTRA ? () => {
//         let tmp = binary.slice(1, binary[0] + 1);
//         if (FHCRC) crcBuf = crcBuf.concat(binary.slice(0, binary[0] + 1));
//         binary = binary.slice(binary[0] + 1);
//         // return [new TextDecoder().decode(tmp[0]), new TextDecoder().decode(tmp[1]), new TextDecoder().decode(tmp.slice(4, (tmp[2] << 8) | tmp[3] + 4))];
//         return [[tmp[0]].toString(), [tmp[1]].toString(), tmp.slice(4, (tmp[3] << 8) | tmp[2] + 4).toString()];
//       } : null;
//       let fileName = FNAME ? () => {  //  it may be good way to change other way to get strings and the length;
//         let tmp = "";
//         for (let i = 0; binary[i] !== 0; i++) {
//           // tmp +=  new TextDecoder().decode(binary[i]);
//           tmp += binary[i].toString();
//         }
//         if (FHCRC) crcBuf = crcBuf.concat(binary.slice(0, tmp.length));
//         binary = binary.slice(tmp.length);
//         return tmp;
//       } : null;
//       let fileComment = FCOMMENT ? () => {  //  -------------------------------------------------------
//         let tmp = "";
//         for (let i = 0; binary[i] !== 0; i++) {
//           // tmp +=  new TextDecoder().decode(binary[i]);
//           tmp += binary[i].toString();
//         }
//         if (FHCRC) crcBuf = crcBuf.concat(binary.slice(0, tmp.length));
//         binary = binary.slice(tmp.length);
//         return tmp;
//       } : null;
//       if (FHCRC) {
//         let tmp = update_crc(binary[1] << 8 | binary[0] ,crcBuf, crcBuf.length);
//         if (tmp & 0xffff !== 0) return [null, "CRC16"];
//         binary = binary.slice(2);
//       }
//       let previous;
//       do {
//         let BFINAL = (binary[0] & 0b10000000) >> 7;
//         let BTYPE = (binary[0] & 0b01100000) >> 5;
//         if (BTYPE == 0) {
//           if (((binary[1] << 8 | binary[0]) + (binary[2] << 8 | binary[3])) & 0xFFFF !== 0) return [null, "LEN NLEN"];//error
//           previous = binary.slice(4, 4 + (binary[1] << 8 | binary[0]));
//           binary = binary.slice(4 + (binary[1] << 8 | binary[0]));
//         } else if (BTYPE == 0b01 || BTYPE == 0b10) {
//           if (BTYPE == 0b10) {

//           }
//         } else {
//           // error
//         }
//       } while(1);
//     }

document.getElementById("download_button").onclick = (evt) => {
// evt.preventDefault();

// src_map_data = searchColorId(raw_src_data);

if (nbt_map_data  && src_map_data) {
  nbt_map_data.then((mapdata) => {
    mapdata = editor.get();
    mapdata.null.data.data.data.scale.binary.set([map_scale], mapdata.null.data.data.data.scale.binary.length -1);
    mapdata.null.data.data.data.scale.data = map_scale;

    mapdata.null.data.data.data.locked.binary.set([1], mapdata.null.data.data.data.locked.binary.length - 1);
    mapdata.null.data.data.data.locked.data = 1;
    var zip = new Zlib.Zip();
    let map_begin_id = Number(document.getElementById("mapid").value);
    if (src_map_data) {
      src_map_data.forEach((ele, index) => {
        console.log(ele);
        let tmp = mapdata.null.data.data.data.colors.binary.slice(0, 9);
        mapdata.null.data.data.data.colors.binary = new Uint8Array(13 + (1 << 14));
        mapdata.null.data.data.data.colors.binary.set(tmp, 0);
        mapdata.null.data.data.data.colors.binary.set([0, 0, 1 << 6, 0], 9);
        mapdata.null.data.data.data.colors.binary.set(ele, 13);
        mapdata.null.data.data.data.colors.data = ele;
        
        let nbt_raw_data = json2nbt(mapdata);
        let gzip =  new Zlib.Gzip(nbt_raw_data);
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
// let zip = new Zlib.Gzip(json2nbt(nbt_map_data));
// let compressData = zip.compress();

// if (window.navigator.msSaveBlob) console.log("msSaveBlob");
}

document.getElementById("writer").onclick = () => {
// console.log(raw_src_data);
src_map_data = [];
new Promise((resolve, reject) => resolve())
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
    selected.forEach((ele) => {
      if (ele.classList.contains("select_on")) {
        let yx = ele.dataset.number.split("-");
        raw_src_data = ctx.getImageData(Number(yx[1])*128, Number(yx[0])*128, 128, 128);
        // src_map_data.push(searchColorId(raw_src_data));
        wasm_init.then((obj) => {

          let input = new Uint8Array(raw_src_data.data.len);
          input.set(raw_src_data.data, 0);
          let output = new Uint8Array(1<<14);
          let color = new Uint8Array(colorMap.len*3);
          color.set(colorMap.flat(), 0);
          search_color_id(input, output, color);
          src_map_data.push(output);
        }).then(() => {
          progressBar.animate(count/max_selected)
        })
        count++;
      }
    });
    progressBar.animate(1.0);
    document.getElementById("writeState").innerHTML = "finish";
  // } catch(err) {
  //   progressBar.set(0.0);
  //   document.getElementById("writeState").innerHTML = "error";
  // }
});

// console.log(src_map_data);
}

document.getElementById("nbt_zone").onclick = (e) => {
document.getElementById("nbt_zone").style.height = window.getComputedStyle(document.getElementsByClassName("json-container")[0]).getPropertyValue('height');
// console.log("ckuck!");
}

document.getElementById("bgcolor").oninput = (e) => {
ctx.fillStyle = e.target.value;
console.log("change");
ctx.fillRect(0, 0, ctx.width, ctx.height);
ctx.drawImage(image, 0, 0);
}

// document.getElementById("bgcolor").onchange = (e) => {
//   raw_src_data = ctx.getImageData(0, 0, ctx.width, ctx.height);
// }