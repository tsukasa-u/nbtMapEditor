
extern crate console_error_panic_hook;
use std::{panic};

use wasm_bindgen::prelude::*;
use web_sys::console;
use wasm_bindgen::prelude::*;


// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


// #[wasm_bindgen]
// pub fn test(num: i32) -> i32 {
//   num + 1i32
// }

#[wasm_bindgen]
pub fn rgb2lab(rgb: &[i32], lab: &mut [f32]) {
  let lab_ft: f32 = (6f32/29f32).powi(3);

  let mut r: f32 = (rgb[0] as f32)/255f32;
  let mut g: f32 = (rgb[1] as f32)/255f32;
  let mut b: f32 = (rgb[2] as f32)/255f32;

  r = if r > 0.04045f32 { ((r + 0.055f32)/1.055f32).powf(2.4) } else { r/12.92f32 };
  g = if g > 0.04045f32 { ((g + 0.055f32)/1.055f32).powf(2.4) } else { g/12.92f32 };
  b = if b > 0.04045f32 { ((b + 0.055f32)/1.055f32).powf(2.4) } else { b/12.92f32 };

  let mut x: f32 = 1.0521f32 *(r*0.4124564f32 + g*0.3575761f32 + b*0.1804375f32);
  let mut y: f32 =             r*0.2126729f32 + g*0.7151522f32 + b*0.0721750f32 ;
  let mut z: f32 = 0.91841f32*(r*0.0193339f32 + g*0.1191920f32 + b*0.9503041f32);

  x = if x > lab_ft { x.powf(1f32/3f32) } else { 7.787f32*x + 16f32/116f32 };
  y = if y > lab_ft { y.powf(1f32/3f32) } else { 7.787f32*y + 16f32/116f32 };
  z = if z > lab_ft { z.powf(1f32/3f32) } else { 7.787f32*z + 16f32/116f32 };
  
  lab[0] = 116f32*y - 16f32;
  lab[1] = 500f32*(x - y);
  lab[2] = 200f32*(y - z);
  lab[3] = (lab[1].powi(2) + lab[2].powi(2)).sqrt();
}

fn cie2000(labch1: &[f32], labch2: &[f32], kl: f32, kc: f32, kh: f32) -> f32 {
  let deltal: f32 = labch2[0] - labch1[0];
  let l_: f32 = (labch2[0] + labch1[0])/2f32;
  let c_: f32 = (labch2[3] + labch1[3])/2f32;
  let pow_c_7: f32 = c_.powi(7);
  let pow_25_7: f32 = 25f32.powi(7);
  let G_: f32 = 0.5f32*(1f32 - (pow_c_7/(pow_c_7 + pow_25_7)).sqrt());
  let a1p: f32 = labch1[1]*(1f32 + G_);
  let a2p: f32 = labch2[1]*(1f32 + G_);
  let c1p: f32 = (a1p.powi(2) + labch1[2].powi(2)).sqrt();
  let c2p: f32 = (a2p.powi(2) + labch2[2].powi(2)).sqrt();
  let cp_: f32 = (c1p + c2p)/2f32;
  let deltacp: f32 = c2p - c1p;
  let mut h1p: f32 = if labch1[2] == 0f32 && a1p == 0f32 { 0f32 } else { labch1[2].atan2(a1p) };
  if h1p < 0f32 {h1p += 2f32*std::f32::consts::PI;}
  let mut h2p: f32 = if labch2[2] == 0f32 && a2p == 0f32 { 0f32 } else { labch2[2].atan2(a2p) };
  if h2p < 0f32 {h2p += 2f32*std::f32::consts::PI};
  let  deltah: f32;
    if c1p*c2p==0f32 {
        deltah =  0f32;
    } else {
        if (h2p - h1p).abs() <= std::f32::consts::PI {
            deltah =  h2p - h1p;
        } else {
            if h2p - h1p < -std::f32::consts::PI {
                deltah =  h2p - h1p + 2f32*std::f32::consts::PI;
            } else {
                deltah =  h2p - h1p - 2f32*std::f32::consts::PI;
            }
        }
    }
  let deltaH: f32 = 2f32*(c1p*c2p).sqrt()*((deltah/2f32).sin());
  let h_: f32;
  if c1p*c2p == 0f32 {
    h_ = 0f32;
  } else {
    if (h2p - h1p).abs() <= std::f32::consts::PI {
      h_ = (h2p + h1p)/2f32;
    } else {
      if h2p + h1p < 2f32*std::f32::consts::PI {
        h_ = (h2p + h1p)/2f32 + std::f32::consts::PI;
      } else {
        h_ = (h2p + h1p)/2f32 - std::f32::consts::PI;
      }
    }
  }
  let t: f32 = 1f32 - 0.17f32*((h_ - std::f32::consts::PI/6f32).cos()) + 0.24f32*((2f32*h_).cos()) + 0.32f32*((3f32*h_ + std::f32::consts::PI/30f32).cos()) - 0.20f32*((4f32*h_ - 0.35f32*std::f32::consts::PI).cos());
  let sl: f32 = 1f32 + 0.015f32*((l_ - 50f32).powi(2))/(20f32 + (l_ - 50f32).powi(2)).sqrt();
  let sc = 1f32 + 0.045f32*cp_;
  let sh = 1f32 + 0.015f32*cp_*t;
  let pow_cp_7: f32 = cp_.powi(7);
  let rt = -2f32*(pow_cp_7/(pow_cp_7 + pow_25_7)).sqrt()*((std::f32::consts::PI/3f32*((-((h_*180f32/std::f32::consts::PI - 275f32)/25f32).powi(2)).exp())).sin());
  return ((deltal/kl/sl).powi(2) + (deltacp/kc/sc).powi(2) + (deltaH/kh/sh).powi(2) + rt*deltacp/kc/sc*deltaH/kh/sh).sqrt();
}

fn rgb_d(b: &[f32], a: &[f32]) -> f32 {
  return ((b[0]-a[0]).powi(2)+(b[1]-a[1]).powi(2)+(b[2]-a[2]).powi(2));
}

// #[wasm_bindgen]
// pub fn search_color_id(src: &[i32], output: &mut [u8], color_map: &[i32], bg: &[i32], out_image: &mut [u8]) {
//   panic::set_hook(Box::new(console_error_panic_hook::hook));

//   let mut min:f32 = 1000000f32;
//   let mut id:i32 = 0;
//   let mut lab1: [f32; 4] = [0f32; 4];
//   let mut lab2: [f32; 4] = [0f32; 4];
//   // let js: JsValue = output.len().into();
//   // console::log_2(&"Logging : output.len".into(), &js);
//   for n in 0..output.len() {
//     id = 0i32;
//     min = 100f32;
//     let alpha: &i32 = &src[4*n + 3];
//     let a: [i32; 3] = [
//       bg[0] + (src[4*n    ] - bg[0])*alpha/255,
//       bg[1] + (src[4*n + 1] - bg[1])*alpha/255,
//       bg[2] + (src[4*n + 2] - bg[2])*alpha/255,
//     ];
//     // let js: JsValue = output.len().into();
//     // console::log_3(&bg[0].into(), &a[0].into(), &src[4*n    ].into());
//     for _i in 0..(color_map.len()/3usize) {
//       // rgb2lab(&(src[4*n..(4*n + 3)]), &mut lab1);
//       rgb2lab(&a, &mut lab1);
//       rgb2lab(&(color_map[3*_i..(3*_i + 3)]), &mut lab2);
//       // let d: f32 = cie2000(&lab1, &lab2, 1.835f32, 1f32, 1f32);
//       let d: f32 = cie2000(&lab1, &lab2, 1f32, 1f32, 1f32);
//       if min > d {
//         min = d;
//         id = _i as i32;
//       }
//     }
//     output[n] = id as u8;
//     out_image[4*n    ] = color_map[3*(id as usize)    ] as u8;
//     out_image[4*n + 1] = color_map[3*(id as usize) + 1] as u8;
//     out_image[4*n + 2] = color_map[3*(id as usize) + 2] as u8;
//     out_image[4*n + 3] = 255u8;
//   }
//   // console::log_2(&"Logging :".into(), &1.into());
// }

// #[wasm_bindgen]
// pub fn search_color_id_2(src: &[i32], output: &mut [u8], color_map: &[i32], bg: &[i32], out_image: &mut [u8]) {
//   panic::set_hook(Box::new(console_error_panic_hook::hook));

//   let mut min:f32 = 100f32;
//   let mut id:i32 = 0;
//   let mut lab1: [f32; 4] = [0f32; 4];
//   let mut lab2: [f32; 4] = [0f32; 4];
//   for n in 0..output.len() {
//     id = 100i32;
//     min = 1000000f32;
//     let alpha: &i32 = &src[4*n + 3];
//     let a: [i32; 3] = [
//       bg[0] + (src[4*n    ] - bg[0])*alpha/255,
//       bg[1] + (src[4*n + 1] - bg[1])*alpha/255,
//       bg[2] + (src[4*n + 2] - bg[2])*alpha/255,
//     ];
//     // console::log_5(&src[4*n + 3].into(), &src[4*n    ].into(), &(src[4*n    ] - bg[0]).into(), &((src[4*n    ] - bg[0])*alpha).into(), &((src[4*n    ] - bg[0])*alpha>>8).into());
//     for _i in 0..(color_map.len()/3usize) {
//       rgb2lab(&a, &mut lab1);
//       rgb2lab(&(color_map[3*_i..(3*_i + 3)]), &mut lab2);
//       let d: f32 = rgb_d(&lab1[0..3], &lab2[0..3]);
//       if min > d {
//         min = d;
//         id = _i as i32;
//       }
//     }
//     // let js: JsValue = id.into();
//     // console::log_2(&"Logging :".into(), &js);
//     output[n] = id as u8;
//     out_image[4*n    ] = color_map[3*(id as usize)    ] as u8;
//     out_image[4*n + 1] = color_map[3*(id as usize) + 1] as u8;
//     out_image[4*n + 2] = color_map[3*(id as usize) + 2] as u8;
//     out_image[4*n + 3] = 255u8;
//   }
// }

#[wasm_bindgen]
pub fn search_color_id(src: &[i32], output: &mut [u8], color_map: &[i32], bg: &[i32], out_image: &mut [u8], use_method: i32) {
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  let mut min:f32 = 100f32;
  let mut id:i32 = 0;
  let mut lab1: [f32; 4] = [0f32; 4];
  let mut lab2: [f32; 4] = [0f32; 4];
  let daynamic_buffer: [[f32; 3]; 16384] = [[0.0; 3]; 16384];
  for n in 0..output.len() {
    id = 100i32;
    min = 1000000f32;
    let alpha: &i32 = &src[4*n + 3];
    let a: [i32; 3] = [
      bg[0] + (src[4*n    ] - bg[0])*alpha/255,
      bg[1] + (src[4*n + 1] - bg[1])*alpha/255,
      bg[2] + (src[4*n + 2] - bg[2])*alpha/255,
    ];
    // console::log_5(&src[4*n + 3].into(), &src[4*n    ].into(), &(src[4*n    ] - bg[0]).into(), &((src[4*n    ] - bg[0])*alpha).into(), &((src[4*n    ] - bg[0])*alpha>>8).into());
    for _i in 0..(color_map.len()/3usize) {
      rgb2lab(&a, &mut lab1);
      rgb2lab(&(color_map[3*_i..(3*_i + 3)]), &mut lab2);
      let mut lab3: [f32; 4] = if use_method & 0b10 == 0b10 {
        let mut tmp_lab: [f32; 4] = [{
            let tmp = lab1[0] + daynamic_buffer[n][0];
            if tmp < 0.0 { 0.0 } 
            else if tmp > 100.0 { 100.0 }
            else { tmp }
          },{
            let tmp = lab1[1] + daynamic_buffer[n][1];
            if tmp < -128.0 { -128.0 } 
            else if tmp > 128.0 { 128.0 }
            else { tmp }
          },{
            let tmp = lab1[2] + daynamic_buffer[n][2];
            if tmp < -128.0 { -128.0 } 
            else if tmp > 128.0 { 128.0 }
            else { tmp }
          },
          0.0
        ];
        tmp_lab[3] = (tmp_lab[1].powi(2) + tmp_lab[2].powi(2)).sqrt();
        tmp_lab
      } else {
        lab1.clone()
      };
      let d :f32 = if use_method & 0b01 == 1 {
        cie2000(&lab1, &lab2, 1f32, 1f32, 1f32)
      } else {
        rgb_d(&lab1[0..3], &lab2[0..3])
      };
      if min > d {
        min = d;
        id = _i as i32;
      }
    }
    if use_method & 0b10 == 0b10 {

      let _i: usize = id as usize;
      rgb2lab(&(color_map[3*_i..(3*_i + 3)]), &mut lab2);
      let err_f: [f32; 3] = [lab2[0] - lab1[0], lab2[1] - lab1[1], lab2[2] - lab1[2]];
      // let err_f: [f32; 3] = [lab1[0] - lab2[0], lab1[1] - lab2[1], lab1[2] - lab2[2]];

      if n%128 < 127 {
        let mut tmp: &[f32; 3] = &daynamic_buffer[n + 1];
        tmp = &[tmp[0] + 0.4375*err_f[0], tmp[1] + 0.4375*err_f[1], tmp[2] + 0.4375*err_f[2]];
      }
      if n/128 < 127 {
        if n%128 > 0 {
          let mut tmp: &[f32; 3] = &daynamic_buffer[n + 127];
          tmp = &[tmp[0] + 0.1875*err_f[0], tmp[1] + 0.1875*err_f[1], tmp[2] + 0.1875*err_f[2]];
        }
        {
          let mut tmp: &[f32; 3] = &daynamic_buffer[n + 128];
          tmp = &[tmp[0] + 0.3125*err_f[0], tmp[1] + 0.3125*err_f[1], tmp[2] + 0.3125*err_f[2]];
        }
        if n%128 < 127 {
          let mut tmp: &[f32; 3] = &daynamic_buffer[n + 129];
          tmp = &[tmp[0] + 0.0625*err_f[0], tmp[1] + 0.0625*err_f[1], tmp[2] + 0.0625*err_f[2]];
        }
      }
    }
    // let js: JsValue = id.into();
    // console::log_2(&"Logging :".into(), &js);
    output[n] = id as u8;
    out_image[4*n    ] = color_map[3*(id as usize)    ] as u8;
    out_image[4*n + 1] = color_map[3*(id as usize) + 1] as u8;
    out_image[4*n + 2] = color_map[3*(id as usize) + 2] as u8;
    out_image[4*n + 3] = 255u8;
  }
}