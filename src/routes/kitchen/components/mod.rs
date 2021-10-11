use std::collections::HashMap;

use wasm_bindgen::JsValue;
use web_sys::*;

use yew::{
    html, prelude::*, Component, ComponentLink, Html, Properties, ShouldRender,
};
use yewtil::store::{Bridgeable, ReadOnly, StoreWrapper};
use yewtil::NeqAssign;

use crate::routes::kitchen;

use kitchen::agents::{NodeId, NodeStore, Request};
use kitchen::chef::{Cook, Shader, ShaderType};
use kitchen::ingredients::Color;

mod color_node;
use color_node::ColorNode;
// use super::select::Select;

#[derive(Debug, PartialEq, Clone)]
pub enum Nodes {
    Color(Color),
}

impl Cook for Nodes {
    fn prep(&self, gl: &WebGlRenderingContext) -> Result<(), JsValue> {
        match self {
            Nodes::Color(color) => color.prep(gl),
        }
    }
    fn cook(
        &self,
        gl: &WebGlRenderingContext,
        shaders: &HashMap<ShaderType, Shader>,
    ) -> Result<(), JsValue> {
        match self {
            Nodes::Color(color) => color.cook(gl, shaders),
        }
    }
}

pub enum NodeMsg {
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
    type Message = NodeMsg;
    type Properties = NodeProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        let callback = link.callback(NodeMsg::NodeStoreMsg);

        Self {
            link,
            id: props.id,
            node: None,
            node_store: NodeStore::bridge(callback),
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            NodeMsg::UpdateNode(node) => {
                self.node_store.send(Request::UpdateNode(self.id, node));
                false
            }
            NodeMsg::Delete => {
                self.node_store.send(Request::RemoveNode(self.id));
                false
            }
            NodeMsg::NodeStoreMsg(state) => {
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
        options.insert("Color", Nodes::Color);
        match self.node {
            Some(Nodes::Color(color)) => {
                html! {
                    <>
                        // <Select<Nodes> options=options onchange=self.link.callback(NodeMsg::UpdateNode)/>
                        <ColorNode color=color update_callback=self.link.callback(NodeMsg::UpdateNode)/>
                    </>
                }
            }
            // Some(Nodes::Color(color_node)) => color_node.view(),
            // Some(Nodes::Color(color_node)) => color_node.view(),
            None => html! {"<pending>"},
        }
    }
}
