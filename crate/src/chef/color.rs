use std::collections::HashMap;

use wasm_bindgen::JsValue;
use web_sys::{WebGlProgram, WebGlRenderingContext, WebGlRenderingContext as GL};

use super::super::ingredients::Color;
use super::{compile_shader, link_program, Cook, Shader, ShaderType};

static COLOR_2D_VS: &'static str = include_str!("../ingredients/color/color_2d.vert");
static COLOR_2D_FS: &'static str = include_str!("../ingredients/color/color_2d.frag");

impl Shader for Color {
    fn compile(gl: &WebGlRenderingContext) -> Result<WebGlProgram, JsValue> {
        let vert_shader = compile_shader(&gl, GL::VERTEX_SHADER, COLOR_2D_VS)?;
        let frag_shader = compile_shader(&gl, GL::FRAGMENT_SHADER, COLOR_2D_FS)?;
        let program = link_program(&gl, &vert_shader, &frag_shader)?;

        Ok(program)
    }
    fn shader_type() -> ShaderType {
        ShaderType::Color
    }
}

impl Cook for Color {
    fn prep(&self, _gl: &WebGlRenderingContext) -> Result<(), JsValue> {
        // let uniforms = RefCell::new(HashMap::new());

        Ok(())
    }
    fn cook(
        &self,
        gl: &WebGlRenderingContext,
        shaders: &HashMap<ShaderType, WebGlProgram>,
    ) -> Result<(), JsValue> {
        // This list of vertices will draw two triangles to cover the entire canvas.
        let vertices: Vec<f32> = vec![
            -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        ];
        let vertex_buffer = gl.create_buffer().unwrap();
        let verts = js_sys::Float32Array::from(vertices.as_slice());

        gl.bind_buffer(GL::ARRAY_BUFFER, Some(&vertex_buffer));
        gl.buffer_data_with_array_buffer_view(GL::ARRAY_BUFFER, &verts, GL::STATIC_DRAW);

        // let shader = Shader::new(gl, COLOR_2D_VS, COLOR_2D_FS).unwrap();
        let program = shaders
            .get(&Self::shader_type())
            .expect("Compile color shader");
        gl.use_program(Some(program));

        // Attach the position vector as an attribute for the GL context.
        let position = gl.get_attrib_location(program, "a_position") as u32;
        gl.vertex_attrib_pointer_with_i32(position, 2, GL::FLOAT, false, 0, 0);
        gl.enable_vertex_attrib_array(position);

        // Attach the color as a uniform for the GL context.
        let color_uniform = gl.get_uniform_location(program, "u_color");
        gl.uniform3f(
            color_uniform.as_ref(),
            self.r as f32 / 255.0,
            self.g as f32 / 255.0,
            self.b as f32 / 255.0,
        );

        gl.draw_arrays(GL::TRIANGLES, 0, 6);
        Ok(())
    }
}
