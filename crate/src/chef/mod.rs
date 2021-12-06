use std::collections::HashMap;

use wasm_bindgen::JsValue;
use web_sys::WebGlRenderingContext as GL;
use web_sys::*;

use super::ingredients::{Color, Ingredients, Pierogi};

mod color;
mod pierogi;
mod recipe;

pub struct Chef {
    gl: WebGlRenderingContext,
    shaders: HashMap<ShaderType, WebGlProgram>,
}

impl Chef {
    pub fn new(gl: WebGlRenderingContext) -> Self {
        let shaders = compile_shaders(&gl).expect("Compilation failed");

        Self { gl, shaders }
    }
    pub fn render<C: Cook>(&self, ingredients: &Vec<C>) {
        self.gl.clear_color(0.0, 0.0, 0.0, 1.);
        self.gl.clear(GL::COLOR_BUFFER_BIT | GL::DEPTH_BUFFER_BIT);

        for ingredient in ingredients.iter() {
            ingredient.prep(&self.gl).unwrap();
        }
        for ingredient in ingredients.iter() {
            ingredient.cook(&self.gl, &self.shaders).unwrap();
            // gl.copy_tex_image_2d(Gl::TEXTURE_2D, 0, Gl::RGB, 0, 0, )
        }
    }

    // fn init_texture(gl: &WebGlRenderingContext) {
    //     gl.bind_texture()
    // }
}

pub trait Shader {
    fn compile(gl: &WebGlRenderingContext) -> Result<WebGlProgram, JsValue>;
    fn shader_type() -> ShaderType;
}

pub fn compile_shaders(
    gl: &WebGlRenderingContext,
) -> Result<HashMap<ShaderType, WebGlProgram>, JsValue> {
    let mut shader_map = HashMap::new();
    shader_map.insert(Color::shader_type(), Color::compile(gl)?);
    shader_map.insert(Pierogi::shader_type(), Pierogi::compile(gl)?);

    Ok(shader_map)
}

pub trait Cook {
    fn prep(&self, gl: &WebGlRenderingContext) -> Result<(), JsValue>;
    fn cook(
        &self,
        gl: &WebGlRenderingContext,
        shaders: &HashMap<ShaderType, WebGlProgram>,
    ) -> Result<(), JsValue>;
}

impl Cook for Ingredients {
    fn prep(&self, gl: &WebGlRenderingContext) -> Result<(), JsValue> {
        match self {
            Ingredients::Color(color) => color.prep(gl),
            Ingredients::Pierogi(pierogi) => pierogi.prep(gl),
        }
    }
    fn cook(
        &self,
        gl: &WebGlRenderingContext,
        shaders: &HashMap<ShaderType, WebGlProgram>,
    ) -> Result<(), JsValue> {
        match self {
            Ingredients::Color(color) => color.cook(gl, shaders),
            Ingredients::Pierogi(pierogi) => pierogi.cook(gl, shaders),
        }
    }
}

pub fn link_program(
    gl: &WebGlRenderingContext,
    vert_shader: &WebGlShader,
    frag_shader: &WebGlShader,
) -> Result<WebGlProgram, String> {
    let program = gl
        .create_program()
        .ok_or_else(|| String::from("Error creating program"))?;

    gl.attach_shader(&program, &vert_shader);
    gl.attach_shader(&program, &frag_shader);
    gl.link_program(&program);

    if gl
        .get_program_parameter(&program, GL::LINK_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(program)
    } else {
        Err(gl
            .get_program_info_log(&program)
            .unwrap_or_else(|| String::from("Unable to get program info log")))
    }
}

pub fn compile_shader(
    gl: &WebGlRenderingContext,
    shader_type: u32,
    source: &str,
) -> Result<WebGlShader, String> {
    let shader = gl
        .create_shader(shader_type)
        .ok_or_else(|| String::from("Error creating shader"))?;

    gl.shader_source(&shader, source);
    gl.compile_shader(&shader);

    if gl
        .get_shader_parameter(&shader, GL::COMPILE_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(shader)
    } else {
        Err(gl
            .get_shader_info_log(&shader)
            .unwrap_or_else(|| String::from("Unable to get shader info log")))
    }
}

#[derive(Debug, PartialEq, Eq, Hash, Copy, Clone)]
pub enum ShaderType {
    Color,
    Pierogi,
}
