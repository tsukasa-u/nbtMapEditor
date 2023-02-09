
extern crate console_error_panic_hook;
use std::panic;

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


#[wasm_bindgen]
pub fn test(num: i32) -> i32 {
  num + 1i32
}

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
  let a1p: f32 = labch1[1] + labch1[1]/2f32*(1f32 - (c_.powi(7)/(c_.powi(7) + 25f32.powi(7)).sqrt()));
  let a2p: f32 = labch2[1] + labch2[1]/2f32*(1f32 - (c_.powi(7)/(c_.powi(7) + 25f32.powi(7)).sqrt()));
  let c1p: f32 = (a1p*a1p + labch1[2]*labch1[2]).sqrt();
  let c2p: f32 = (a2p*a2p + labch2[2]*labch2[2]).sqrt();
  let cp_: f32 = (c1p + c2p)/2f32;
  let deltacp: f32 = c1p - c2p;
  let mut h1p: f32 = labch1[2].atan2(a1p);
  if h1p < 0f32 {h1p += 2f32*std::f32::consts::PI;}
  let mut h2p: f32 = labch2[2].atan2(a2p);
  if h2p < 0f32 {h2p += 2f32*std::f32::consts::PI};
  let  deltah: f32;
  if (h2p - h1p).abs() <= std::f32::consts::PI {
    deltah = h2p - h1p;
  } else {
    if h2p <= h1p {
      deltah = h2p - h1p + 2f32*std::f32::consts::PI;
    } else {
      deltah = h2p - h1p - 2f32*std::f32::consts::PI;
    }
  }
  let deltah: f32 = 2f32*(c1p*c2p).sqrt()*(deltah/2f32).sin();
  let h_: f32;
  if (h2p - h1p).abs() <= std::f32::consts::PI {
    h_ = (h2p + h1p)/2f32;
  } else {
    h_ = (h2p + h1p + 2f32*std::f32::consts::PI)/2f32;
  }
  let t: f32 = 1f32 - 0.17f32*(h_ - std::f32::consts::PI/6f32).cos() + 0.24f32*(2f32*h_).cos() + 0.32f32*(3f32*h_ + std::f32::consts::PI/30f32).cos() - 0.20f32*(4f32*h_ - 0.35f32*std::f32::consts::PI).cos();
  let sl: f32 = 1f32 + 0.015f32*(l_ - 50f32).powi(2)/(20f32 + (l_ - 50f32).powi(2)).sqrt();
  let sc = 1f32 + 0.045f32*cp_;
  let sh = 1f32 + 0.015f32*cp_*t;
  let rt = -2f32*(cp_.powi(7)/(cp_.powi(7) + (25f32).powi(7))).sqrt()*(std::f32::consts::PI/3f32*(((h_ - 275f32/180f32*std::f32::consts::PI)/(25f32/180f32*std::f32::consts::PI)).powi(2)).exp()).sin();
  return ((deltal/kl/sl).powi(2) + (deltacp/kc/sc).powi(2) + (deltah/kh/sh).powi(2) + rt*deltacp/kc/sc*deltah/kh/sh).sqrt();
}

#[wasm_bindgen]
pub fn search_color_id(src: &[i32], output: &mut [i8], color_map: &[i32], bg: &[i32]) {
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  let mut min:f32 = 1000000f32;
  let mut id:i32 = 0;
  let mut lab1: [f32; 4] = [0f32; 4];
  let mut lab2: [f32; 4] = [0f32; 4];
  // let js: JsValue = output.len().into();
  // console::log_2(&"Logging : output.len".into(), &js);
  for n in 0..output.len() {
    id = 0i32;
    min = 100f32;
    let alpha: &i32 = &src[4*n + 3];
    let a: [i32; 3] = [
      bg[0] + (src[4*n    ] - bg[0])*alpha/255,
      bg[1] + (src[4*n + 1] - bg[1])*alpha/255,
      bg[2] + (src[4*n + 2] - bg[2])*alpha/255,
    ];
    // let js: JsValue = output.len().into();
    // console::log_3(&bg[0].into(), &a[0].into(), &src[4*n    ].into());
    for _i in 0..(color_map.len()/3usize) {
      // rgb2lab(&(src[4*n..(4*n + 3)]), &mut lab1);
      rgb2lab(&a, &mut lab1);
      rgb2lab(&(color_map[3*_i..(3*_i + 3)]), &mut lab2);
      let d: f32 = cie2000(&lab1, &lab2, 1.835f32, 1f32, 1f32);
      if min > d {
        min = d;
        id = _i as i32;
      }
    }
    output[n] = id as i8;
  }
  // console::log_2(&"Logging :".into(), &1.into());
}

#[wasm_bindgen]
pub fn search_color_id_2(src: &[i32], output: &mut [i8], color_map: &[i32], bg: &[i32]) {
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  let mut min:f32 = 100f32;
  let mut id:i32 = 0;
  for n in 0..output.len() {
    id = 100i32;
    min = 1000000f32;
    let alpha: f32 = src[4*n + 3] as f32;
    let a: [i32; 3] = [
      src[4*n    ] - ((src[4*n    ] - bg[0]) as f32 *alpha/255.0f32) as i32,
      src[4*n + 1] - ((src[4*n + 1] - bg[1]) as f32 *alpha/255.0f32) as i32,
      src[4*n + 2] - ((src[4*n + 2] - bg[2]) as f32 *alpha/255.0f32) as i32,
    ];
    // console::log_3(&bg[0].into(), &a[0].into(), &src[4*n    ].into());
    for _i in 0..(color_map.len()/3usize) {
      let d: f32 = ((color_map[3*_i]-a[0]).pow(2)+(color_map[3*_i+1]-a[1]).pow(2)+(color_map[3*_i+2]-a[2]).pow(2)) as f32;
      if min > d {
        min = d;
        id = _i as i32;
      }
    }
    // let js: JsValue = id.into();
    // console::log_2(&"Logging :".into(), &js);
    output[n] = id as i8;
  }
}
