// use wasm_bindgen::JsValue;
// use web_sys::{WebGlRenderingContext, WebGlProgram};
// use std::collections::HashMap;

// use super::{Cook, Shader, ShaderType};

// pub struct Recipe<C: Cook> {
//     ingredients: Vec<C>,
// }

// impl<C: Cook> Recipe<C> {
//     pub fn new(ingredients: Vec<C>) -> Self {
//         Recipe {
//             ingredients: ingredients
//         }
//     }
// }

// impl<C: Cook> Cook for Recipe<C> {
//     fn prep(&self, gl: &WebGlRenderingContext) -> Result<(), JsValue> {
//         for ingredient in self.ingredients.iter() {
//             ingredient.prep(gl);
//         }

//         Ok(())
//     }
//     fn cook(&self, gl: &WebGlRenderingContext, shaders: HashMap<ShaderType, Shader>) -> Result<(), JsValue> {
//         for ingredient in self.ingredients.iter() {
//             ingredient.cook(gl, shaders);
//             // gl.copy_tex_image_2d(Gl::TEXTURE_2D, 0, Gl::RGB, 0, 0, )
//         }

//         Ok(())
//     }
// }
