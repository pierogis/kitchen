extern crate console_error_panic_hook;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, WebGlRenderingContext as GL, WebGlRenderingContext};

use super::chef::Chef;
use super::ingredients::{Color, Ingredients};

#[wasm_bindgen]
#[derive(Copy, Clone, Debug)]
pub enum IngredientType {
    Color,
    Pierogi,
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
        console_error_panic_hook::set_once();

        let gl: WebGlRenderingContext = canvas
            .get_context("webgl")
            .unwrap()
            .unwrap()
            .dyn_into()
            .unwrap();

        gl.enable(GL::BLEND);
        gl.blend_func(GL::SRC_ALPHA, GL::ONE_MINUS_SRC_ALPHA);
        gl.clear_color(0.0, 0.0, 0.0, 1.0);
        gl.clear_depth(1.0);

        Self {
            canvas,
            chef: Chef::new(gl),
            // node_ids: Vec::new(),
            // nodes: Vec::new(),
        }
    }

    pub fn cook(&self, recipe: Recipe) {
        self.chef.render(&recipe.ingredients);
    }
}

#[wasm_bindgen]
pub struct Recipe {
    ingredients: Vec<Ingredients>,
}

#[wasm_bindgen]
impl Recipe {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            ingredients: Vec::new(),
        }
    }

    pub fn add(&mut self, ingredient_type: IngredientType, val: &JsValue) {
        let ingredient = match ingredient_type {
            IngredientType::Color => Ingredients::Color(val.into_serde().unwrap()),
            IngredientType::Pierogi => Ingredients::Pierogi(val.into_serde().unwrap()),
        };
        self.ingredients.push(ingredient);
    }
}
