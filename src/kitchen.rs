use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, WebGlRenderingContext as GL, WebGlRenderingContext};

use super::chef::Chef;
use super::ingredients::{Color, Ingredients};

#[wasm_bindgen]
#[derive(Copy, Clone, Debug)]
pub enum Ingredient {
    Color = "color",
    Pierogi = "pierogi",
}

#[wasm_bindgen]
pub struct Kitchen {
    canvas: HtmlCanvasElement,
    chef: Chef,
    // node_ids: Vec<u32>,
    // nodes: Vec<Nodes>,
}

#[wasm_bindgen]
impl Kitchen {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement) -> Self {
        let gl: GL = canvas
            .get_context("webgl")
            .unwrap()
            .unwrap()
            .dyn_into()
            .unwrap();

        gl.enable(GL::BLEND);
        gl.blend_func(GL::SRC_ALPHA, GL::ONE_MINUS_SRC_ALPHA);
        gl.clear_color(0.0, 0.0, 0.0, 1.0);
        gl.clear_depth(1.0);

        gl.viewport(0, 0, canvas.width() as i32, canvas.height() as i32);

        Self {
            canvas,
            chef: Chef::new(gl),
            // node_ids: Vec::new(),
            // nodes: Vec::new(),
        }
    }

    pub fn cook(&self, recipe: Recipe) {
        let mut ingredients = Vec::new();
        ingredients.push(Ingredients::Color(Color {
            r: recipe.r,
            g: recipe.g,
            b: recipe.b,
        }));

        self.chef.render(&ingredients);
    }
}

#[wasm_bindgen]
pub struct Recipe {
    r: u8,
    g: u8,
    b: u8,
}

#[wasm_bindgen]
impl Recipe {
    #[wasm_bindgen(constructor)]
    pub fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b }
    }
}
