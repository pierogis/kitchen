mod agents;
mod chef;
mod components;
mod ingredients;
mod shaders;

use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, WebGlRenderingContext as GL};
use yew::services::render::RenderTask;
use yew::services::RenderService;
use yew::{html, prelude::*, Component, ComponentLink, Html, NodeRef, ShouldRender};
use yewtil::store::{Bridgeable, ReadOnly, StoreWrapper};

use crate::components::FileInput;

use agents::{NodeId, NodeStore, Request};
use components::{Node, Nodes};

use chef::Chef;
use ingredients::Color;

pub static CANVAS_WIDTH: i32 = 512;
pub static CANVAS_HEIGHT: i32 = 512;

const DEFAULT_NODE: Nodes = Nodes::Color(Color { r: 0, g: 0, b: 0 });

pub enum Msg {
    AddNode(Nodes),
    IngredientStoreMsg(ReadOnly<NodeStore>),
    Render(f64),
    File(String),
}

pub struct Kitchen {
    link: ComponentLink<Self>,
    canvas: Option<HtmlCanvasElement>,
    gl: Option<GL>,
    chef: Option<Chef>,
    node_store: Box<dyn Bridge<StoreWrapper<NodeStore>>>,
    node_ids: Vec<NodeId>,
    nodes: Vec<Nodes>,
    node_ref: NodeRef,
    render_loop: Option<RenderTask>,
}

impl Component for Kitchen {
    type Message = Msg;
    type Properties = ();

    fn create(_props: Self::Properties, link: ComponentLink<Self>) -> Self {
        let callback = link.callback(Msg::IngredientStoreMsg);

        Self {
            link,
            canvas: None,
            gl: None,
            chef: None,
            node_store: NodeStore::bridge(callback),
            node_ids: Vec::new(),
            nodes: Vec::new(),
            node_ref: NodeRef::default(),
            render_loop: None,
        }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        false
    }

    fn rendered(&mut self, first_render: bool) {
        let canvas = self.node_ref.cast::<HtmlCanvasElement>().unwrap();

        canvas.set_width(CANVAS_WIDTH as u32);
        canvas.set_height(CANVAS_HEIGHT as u32);

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

        gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        self.gl = Some(gl);
        self.canvas = Some(canvas);

        if first_render {
            self.chef = Some(Chef::new(self.gl.as_ref().expect("gl context initialized")));
            // The callback to request animation frame is passed a time value which can be used for
            // rendering motion independent of the framerate which may vary.
            let render_frame = self.link.callback(Msg::Render);
            let handle = RenderService::request_animation_frame(render_frame);

            // A reference to the handle must be stored, otherwise it is dropped and the render won't
            // occur.
            self.render_loop = Some(handle);
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Render(_) => {
                // Render functions are likely to get quite large, so it is good practice to split
                // it into it's own function rather than keeping it inline in the update match
                // case. This also allows for updating other UI elements that may be rendered in
                // the DOM like a framerate counter, or other overlaid textual elements.
                self.render_gl();
                false
            }
            Msg::AddNode(node) => {
                self.node_store.send(Request::CreateNode(node));
                false
            }
            Msg::IngredientStoreMsg(state) => {
                let state = state.borrow();
                self.nodes = state.nodes.values().cloned().collect();
                if state.nodes.len() != self.node_ids.len() {
                    self.node_ids = state.nodes.keys().copied().collect();
                    true
                } else {
                    false
                }
            }
            Msg::File(data_url) => {
                let img = web_sys::HtmlImageElement::new().unwrap();
                img.set_src(&data_url);
                // let image_data = ImageData::new_with_u8_clamped_array_and_sh(
                //     img,
                //     self.canvas.as_ref().unwrap().width(),
                //     self.canvas.as_ref().unwrap().height(),
                // ).expect("Couldn't create ImageData from bytes");

                let canvas = self.node_ref.cast::<HtmlCanvasElement>().unwrap();
                let width = img.width();
                let height = img.height();
                canvas.set_width(width);
                canvas.set_height(height);

                let gl = self.gl.as_ref().expect("gl context initialized");

                let texture = gl.create_texture().expect("create texture");
                gl.bind_texture(GL::TEXTURE_2D, Some(&texture));

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

                false
            }
        }
    }

    fn view(&self) -> Html {
        html! {
            <div>
                <canvas ref=self.node_ref.clone() />
                <FileInput label="" onload=self.link.callback(|data_url| Msg::File(data_url))/>
                { for self.node_ids.iter().map(|&id| html! {<Node key=id id=id/>}) }
                <button onclick=self.link.callback(|_| Msg::AddNode(DEFAULT_NODE))>{"+"}</button>
            </div>
        }
    }
}

impl Kitchen {
    fn render_gl(&mut self) {
        let gl = self.gl.as_ref().expect("gl context initialized");
        self.chef
            .as_ref()
            .expect("chef initialized")
            .render(&gl, &self.nodes);

        let render_frame = self.link.callback(Msg::Render);
        let handle = RenderService::request_animation_frame(render_frame);

        // A reference to the new handle must be retained for the next render to run.
        self.render_loop = Some(handle);
    }
}
