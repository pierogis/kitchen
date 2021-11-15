use std::collections::HashMap;
use yew::agent::AgentLink;
use yewtil::store::{Store, StoreWrapper};

use super::components::nodes::Nodes;

pub type NodeId = u32;

#[derive(Debug)]
pub enum NodeStoreRequest {
    CreateNode(Nodes),
    UpdateNode(NodeId, Nodes),
    RemoveNode(NodeId),
}

#[derive(Debug)]
pub enum NodeStoreAction {
    SetNode(Option<NodeId>, Nodes),
    RemoveNode(NodeId),
}

pub struct NodeStore {
    pub nodes: HashMap<NodeId, Nodes>,
    id_counter: NodeId,
}

impl Store for NodeStore {
    type Action = NodeStoreAction;
    type Input = NodeStoreRequest;

    fn new() -> Self {
        let nodes: HashMap<NodeId, Nodes> = HashMap::new();

        Self {
            nodes,
            id_counter: 1,
        }
    }

    fn handle_input(&self, link: AgentLink<StoreWrapper<Self>>, msg: Self::Input) {
        match msg {
            NodeStoreRequest::CreateNode(node) => {
                link.send_message(NodeStoreAction::SetNode(None, node));
            }
            NodeStoreRequest::UpdateNode(id, node) => {
                link.send_message(NodeStoreAction::SetNode(Some(id), node));
            }
            NodeStoreRequest::RemoveNode(id) => {
                link.send_message(NodeStoreAction::RemoveNode(id));
            }
        }
    }

    fn reduce(&mut self, msg: Self::Action) {
        match msg {
            NodeStoreAction::SetNode(id, node) => {
                let id = id.unwrap_or_else(|| self.next_id());
                self.nodes.insert(id, node);
            }
            NodeStoreAction::RemoveNode(id) => {
                self.nodes.remove(&id);
            }
        }
    }
}

impl NodeStore {
    fn next_id(&mut self) -> NodeId {
        let tmp = self.id_counter;
        self.id_counter += 1;
        tmp
    }
}
