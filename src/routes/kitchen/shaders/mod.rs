use wasm_bindgen::JsValue;
use web_sys::*;
use web_sys::{WebGlProgram, WebGlRenderingContext, WebGlRenderingContext as GL};

pub struct Shader {
    program: WebGlProgram,
}

impl Shader {
    // Create a new Shader program from a vertex and fragment shader
    pub fn new(
        gl: &WebGlRenderingContext,
        vert_shader: &str,
        frag_shader: &str,
    ) -> Result<Self, JsValue> {
        let vert_shader = compile_shader(&gl, GL::VERTEX_SHADER, vert_shader)?;
        let frag_shader = compile_shader(&gl, GL::FRAGMENT_SHADER, frag_shader)?;
        let program = link_program(&gl, &vert_shader, &frag_shader)?;

        Ok(Self { program })
    }

    pub fn program(&self) -> &WebGlProgram {
        &self.program
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
}
