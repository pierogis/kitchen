use std::collections::HashMap;
use wasm_bindgen::JsValue;
use web_sys::WebGlRenderingContext as GL;
use web_sys::*;

use super::ingredients::Color;
pub use super::shaders::{Shader, ShaderType};

mod color;
mod recipe;

pub struct Chef {
    shaders: HashMap<ShaderType, Shader>,
}

impl Chef {
    pub fn new(gl: &WebGlRenderingContext) -> Self {
        let shaders = compile_shaders(gl).expect("Compilation failed");

        Self { shaders }
    }
    pub fn render<C: Cook>(&self, gl: &WebGlRenderingContext, ingredients: &Vec<C>) {
        gl.clear_color(0.0, 0.0, 0.0, 1.);
        gl.clear(GL::COLOR_BUFFER_BIT | GL::DEPTH_BUFFER_BIT);

        for ingredient in ingredients.iter() {
            ingredient.prep(gl).unwrap();
        }
        for ingredient in ingredients.iter() {
            ingredient.cook(gl, &self.shaders).unwrap();
            // gl.copy_tex_image_2d(Gl::TEXTURE_2D, 0, Gl::RGB, 0, 0, )
        }
    }

    // fn init_texture(gl: &WebGlRenderingContext) {
    //     gl.bind_texture()
    // }
}

pub trait Compile {
    fn compile(gl: &WebGlRenderingContext) -> Result<Shader, JsValue>;
    fn shader_type() -> ShaderType;
}

pub trait Cook {
    fn prep(&self, gl: &WebGlRenderingContext) -> Result<(), JsValue>;
    fn cook(
        &self,
        gl: &WebGlRenderingContext,
        shaders: &HashMap<ShaderType, Shader>,
    ) -> Result<(), JsValue>;
}

pub fn compile_shaders(gl: &WebGlRenderingContext) -> Result<HashMap<ShaderType, Shader>, JsValue> {
    let mut shader_map = HashMap::new();
    shader_map.insert(Color::shader_type(), Color::compile(gl)?);

    Ok(shader_map)
}
