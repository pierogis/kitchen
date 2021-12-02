use std::collections::HashMap;

use wasm_bindgen::prelude::*;
use web_sys::{WebGlProgram, WebGlRenderingContext, WebGlRenderingContext as GL};

use super::{compile_shader, link_program, ShaderType};
use crate::chef::{Cook, Shader};
use crate::ingredients::Pierogi;

static PIEROGI_VS: &'static str = include_str!("../ingredients/pierogi/pierogi.vert");
static PIEROGI_FS: &'static str = include_str!("../ingredients/pierogi/pierogi.frag");

impl Shader for Pierogi {
    fn compile(gl: &WebGlRenderingContext) -> Result<WebGlProgram, JsValue> {
        let vert_shader = compile_shader(&gl, GL::VERTEX_SHADER, PIEROGI_VS)?;
        let frag_shader = compile_shader(&gl, GL::FRAGMENT_SHADER, PIEROGI_FS)?;
        let program = link_program(&gl, &vert_shader, &frag_shader)?;

        Ok(program)
    }
    fn shader_type() -> ShaderType {
        ShaderType::Pierogi
    }
}

impl Cook for Pierogi {
    fn prep(&self, _gl: &WebGlRenderingContext) -> Result<(), JsValue> {
        Ok(())
    }

    fn cook(
        &self,
        gl: &WebGlRenderingContext,
        shaders: &HashMap<ShaderType, WebGlProgram>,
    ) -> Result<(), JsValue> {
        //put image data url into an image element
        match &self.src {
            Some(src) => {
                let img = web_sys::HtmlImageElement::new().unwrap();
                img.set_src(src);
                img.set_hidden(true);

                let mut width = img.width();
                let mut height = img.height();

                let resolution = width as f32 / height as f32;

                // if width > height {
                //     width = std::cmp::min(CANVAS_WIDTH, width);
                //     height = (width as f32 / resolution).round() as u32;
                // } else {
                //     height = std::cmp::min(CANVAS_HEIGHT, height);
                //     width = (height as f32 * resolution).round() as u32;
                // }
                // img.set_width(width);
                // img.set_height(height);

                // gl.viewport(
                //     ((CANVAS_WIDTH - width) as f32 / 2.0).round() as i32,
                //     ((CANVAS_HEIGHT - height) as f32 / 2.0).round() as i32,
                //     width as i32,
                //     height as i32,
                // );

                // let shader = Shader::new(gl, COLOR_2D_VS, COLOR_2D_FS).unwrap();
                let program = shaders.get(&Self::shader_type()).expect("color shader");
                gl.use_program(Some(program));

                // look up where the vertex data needs to go.
                let position_location = gl.get_attrib_location(program, "a_position") as u32;
                let tex_coord_location = gl.get_attrib_location(program, "a_texCoord") as u32;

                // Create a buffer to put three 2d clip space points in
                let position_buffer = gl.create_buffer().unwrap();

                // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
                gl.bind_buffer(GL::ARRAY_BUFFER, Some(&position_buffer));
                // Set a rectangle the same size as the image.
                let image_vertices = get_rectangle(0, 0, width, height);
                let image_vertex_array = js_sys::Float32Array::from(image_vertices.as_slice());

                gl.buffer_data_with_array_buffer_view(
                    GL::ARRAY_BUFFER,
                    &image_vertex_array,
                    GL::STATIC_DRAW,
                );

                // provide texture coordinates for the rectangle.
                let tex_coord_buffer = gl.create_buffer().unwrap();
                gl.bind_buffer(GL::ARRAY_BUFFER, Some(&tex_coord_buffer));
                let tex_coord_vertices =
                    vec![0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0];
                let tex_coord_array = js_sys::Float32Array::from(tex_coord_vertices.as_slice());
                gl.buffer_data_with_array_buffer_view(
                    GL::ARRAY_BUFFER,
                    &tex_coord_array,
                    GL::STATIC_DRAW,
                );

                //create and bind a texture with this img as the input
                let texture = gl.create_texture().expect("create texture");
                gl.bind_texture(GL::TEXTURE_2D, Some(&texture));

                // Set the parameters so we can render any size image.
                gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_S, GL::CLAMP_TO_EDGE as i32);
                gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_T, GL::CLAMP_TO_EDGE as i32);
                gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MIN_FILTER, GL::NEAREST as i32);
                gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MAG_FILTER, GL::NEAREST as i32);

                let level = 0;
                let internal_format = GL::RGBA;
                let src_format = GL::RGBA;
                let src_type = GL::UNSIGNED_BYTE;
                gl.tex_image_2d_with_u32_and_u32_and_image(
                    GL::TEXTURE_2D,
                    level,
                    internal_format as i32,
                    src_format,
                    src_type,
                    &img,
                )
                .expect("create texture image");

                // lookup uniforms
                let resolution_location = gl.get_uniform_location(program, "u_resolution");

                // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

                // // Tell WebGL how to convert from clip space to pixels
                // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

                // Clear the canvas
                gl.clear_color(0., 0., 0., 0.);
                gl.clear(GL::COLOR_BUFFER_BIT);

                // Tell it to use our program (pair of shaders)
                gl.use_program(Some(program));

                // Turn on the position attribute
                gl.enable_vertex_attrib_array(position_location);

                // Bind the position buffer.
                gl.bind_buffer(GL::ARRAY_BUFFER, Some(&position_buffer));

                // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
                let size = 2; // 2 components per iteration
                let vertex_type = GL::FLOAT; // the data is 32bit floats
                let normalize = false; // don't normalize the data
                let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
                let offset = 0; // start at the beginning of the buffer
                gl.vertex_attrib_pointer_with_i32(
                    position_location,
                    size,
                    vertex_type,
                    normalize,
                    stride,
                    offset,
                );

                // Turn on the texcoord attribute
                gl.enable_vertex_attrib_array(tex_coord_location);

                // bind the texcoord buffer.
                gl.bind_buffer(GL::ARRAY_BUFFER, Some(&tex_coord_buffer));

                // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
                let size = 2; // 2 components per iteration
                let vertex_type = GL::FLOAT; // the data is 32bit floats
                let normalize = false; // don't normalize the data
                let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
                let offset = 0; // start at the beginning of the buffer
                gl.vertex_attrib_pointer_with_i32(
                    tex_coord_location,
                    size,
                    vertex_type,
                    normalize,
                    stride,
                    offset,
                );

                // set the resolution
                gl.uniform2f(resolution_location.as_ref(), width as f32, height as f32);

                // Draw the rectangle.
                let primitive_type = GL::TRIANGLES;
                let offset = 0;
                let count = 6;
                gl.draw_arrays(primitive_type, offset, count);
            }
            None => {}
        }

        Ok(())
    }
}

fn get_rectangle(x: u32, y: u32, width: u32, height: u32) -> Vec<f32> {
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;
    vec![
        x1 as f32, y1 as f32, x2 as f32, y1 as f32, x1 as f32, y2 as f32, x1 as f32, y2 as f32,
        x2 as f32, y1 as f32, x2 as f32, y2 as f32,
    ]
}
