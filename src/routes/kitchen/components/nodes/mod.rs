use std::collections::HashMap;

use wasm_bindgen::JsValue;
use web_sys::*;

use yew::{html, prelude::*, Component, ComponentLink, Html, Properties, ShouldRender};
use yewtil::store::{Bridgeable, ReadOnly, StoreWrapper};
use yewtil::NeqAssign;

use crate::routes::kitchen;
use kitchen::agents::{NodeId, NodeStore, NodeStoreRequest};
use kitchen::chef::{Cook, ShaderType};
use kitchen::ingredients::{Color, Pierogi};

mod color_node;
mod pierogi_node;
use color_node::ColorNode;
use pierogi_node::PierogiNode;

#[derive(Debug, PartialEq, Clone)]
pub enum Nodes {
    Color(Color),
    Pierogi(Pierogi),
}

impl Cook for Nodes {
    fn prep(&self, gl: &WebGlRenderingContext) -> Result<(), JsValue> {
        match self {
            Nodes::Color(color) => color.prep(gl),
            Nodes::Pierogi(pierogi) => pierogi.prep(gl),
        }
    }
    fn cook(
        &self,
        gl: &WebGlRenderingContext,
        shaders: &HashMap<ShaderType, WebGlProgram>,
    ) -> Result<(), JsValue> {
        match self {
            Nodes::Color(color) => color.cook(gl, shaders),
            Nodes::Pierogi(pierogi) => pierogi.cook(gl, shaders),
        }
    }
}

pub enum Msg {
    UpdateNode(Nodes),
    Delete,
    NodeStoreMsg(ReadOnly<NodeStore>),
}

#[derive(Properties, Clone, PartialEq)]
pub struct NodeProps {
    pub id: NodeId,
}

pub struct Node {
    link: ComponentLink<Self>,
    id: NodeId,
    node: Option<Nodes>,
    node_store: Box<dyn Bridge<StoreWrapper<NodeStore>>>,
}

impl Component for Node {
    type Message = Msg;
    type Properties = NodeProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        let node_store_callback = link.callback(Msg::NodeStoreMsg);

        Self {
            link,
            id: props.id,
            node: None,
            node_store: NodeStore::bridge(node_store_callback),
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::UpdateNode(node) => {
                self.node_store
                    .send(NodeStoreRequest::UpdateNode(self.id, node));
                false
            }
            Msg::Delete => {
                self.node_store.send(NodeStoreRequest::RemoveNode(self.id));
                false
            }
            Msg::NodeStoreMsg(state) => {
                let state = state.borrow();

                // Only update if the post changed.
                if let Some(node) = state.nodes.get(&self.id) {
                    self.node.neq_assign(Some(node.clone()))
                } else {
                    false
                }
            }
        }

        // match self {
        //     Nodes::Color(color_node) => color_node.update(msg),
        // }
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        self.id.neq_assign(props.id)
    }

    fn view(&self) -> Html {
        let mut options = HashMap::new();
        options.insert("color", Nodes::Color(Color { r: 0, g: 0, b: 0 }));
        let inner_html = match &self.node {
            Some(Nodes::Color(color)) => {
                html! {
                    <>
                        // <Select<Nodes> options=options onchange=self.link.callback(NodeMsg::UpdateNode)/>
                        <ColorNode color=color.clone() update_callback=self.link.callback(Msg::UpdateNode)/>
                    </>
                }
            }
            Some(Nodes::Pierogi(pierogi)) => {
                html! {
                    <>
                        // <Select<Nodes> options=options onchange=self.link.callback(NodeMsg::UpdateNode)/>
                        <PierogiNode pierogi=pierogi.clone() update_callback=self.link.callback(Msg::UpdateNode)/>
                    </>
                }
            }
            // Some(Nodes::Color(color_node)) => color_node.view(),
            // Some(Nodes::Color(color_node)) => color_node.view(),
            None => html! {"<pending>"},
        };

        return html! {
            <div>
            <style width=200px></style>
                <legend>
                    <style font-size={"medium"}></style>
                    <select>
                        {for options.iter().map(|(&name, node)| html! {
                            <option value=name onchange=self.link.callback(|data| {
                                let mut node = Nodes::Color(Color { r: 0, g: 0, b: 0 });
                                if let ChangeData::Select(change) = data {
                                    let node = options.get(&change.value()).unwrap();
                                }
                                Msg::UpdateNode(node)
                            })>
                                {name}
                            </option>
                        })}
                    </select>
                </legend>
                {inner_html}
            </div>
        };
    }
}
