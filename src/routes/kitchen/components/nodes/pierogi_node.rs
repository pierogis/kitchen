use yew::prelude::*;
use yew::Properties;

use super::Nodes;
use crate::components::FileInput;
use crate::routes::kitchen::{ingredients::Pierogi};

pub enum Msg {
    UpdateImage(String),
}

#[derive(Properties, Clone, PartialEq)]
pub struct Props {
    pub pierogi: Pierogi,
    pub update_callback: Callback<Nodes>,
}

pub struct PierogiNode {
    pierogi: Pierogi,
    update_callback: Callback<Nodes>,
    link: ComponentLink<Self>,
}

impl Component for PierogiNode {
    type Message = Msg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            pierogi: props.pierogi,
            update_callback: props.update_callback,
            link,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::UpdateImage(data_url) => {
                // in the middle of sending a canvas store request with the new image's width and height
                self.pierogi.src = Some(data_url);
                self.update_callback.emit(Nodes::Pierogi(self.pierogi.clone()));
                
                false
            }
        }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        false
    }

    fn view(&self) -> Html {
        let src = self.pierogi.src.clone();
        
        html! {
            <div>
                <FileInput label="file"
                    onload={self.link.callback(|data_url| Msg::UpdateImage(data_url))}
                />
                <img src=src max-width="100px" max-height="100px" width="auto" height="auto"/>
            </div>
        }
    }
}
