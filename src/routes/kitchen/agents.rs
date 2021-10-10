use std::collections::HashMap;
use yew::agent::AgentLink;
use yewtil::store::{Store, StoreWrapper};

use super::components::Nodes;

pub type NodeId = u32;

#[derive(Debug)]
pub enum Request {
    CreateNode(Nodes),
    UpdateNode(NodeId, Nodes),
    RemoveNode(NodeId),
}

#[derive(Debug)]
pub enum Action {
    SetNode(Option<NodeId>, Nodes),
    RemoveNode(NodeId),
}

pub struct NodeStore {
    pub nodes: HashMap<NodeId, Nodes>,

    // Stores can have private state too
    id_counter: NodeId,
}

impl Store for NodeStore {
    type Action = Action;
    type Input = Request;

    fn new() -> Self {
        let nodes: HashMap<NodeId, Nodes> = HashMap::new();

        NodeStore {
            nodes,
            id_counter: 1,
        }
    }

    fn handle_input(&self, link: AgentLink<StoreWrapper<Self>>, msg: Self::Input) {
        match msg {
            Request::CreateNode(node) => {
                link.send_message(Action::SetNode(None, node));
            }
            Request::UpdateNode(id, node) => {
                link.send_message(Action::SetNode(Some(id), node));
            }
            Request::RemoveNode(id) => {
                link.send_message(Action::RemoveNode(id));
            }
        }
    }

    fn reduce(&mut self, msg: Self::Action) {
        match msg {
            Action::SetNode(id, node) => {
                let id = id.unwrap_or_else(|| self.next_id());
                self.nodes.insert(id, node);
            }
            Action::RemoveNode(id) => {
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
