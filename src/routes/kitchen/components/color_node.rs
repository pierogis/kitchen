use yew::{html, prelude::*, Component, ComponentLink, Html, Properties, ShouldRender};

// use crate::components::Checkbox;
use crate::components::Slider;
use crate::routes::kitchen::ingredients::Color;
use super::Nodes;

pub enum ColorMsg {
    UpdateR(u8),
    UpdateG(u8),
    UpdateB(u8),
}

#[derive(Properties, Clone, PartialEq)]
pub struct ColorProps {
    pub color: Color,
    pub update_callback: Callback<Nodes>,
}

pub struct ColorNode {
    color: Color,
    update_callback: Callback<Nodes>,
    link: ComponentLink<Self>,
}

impl Component for ColorNode {
    type Message = ColorMsg;
    type Properties = ColorProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            color: props.color,
            update_callback: props.update_callback,
            link,
        }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        false
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            ColorMsg::UpdateR(r) => {
                self.color.r = r;
            }
            ColorMsg::UpdateG(g) => {
                self.color.g = g;
            }
            ColorMsg::UpdateB(b) => {
                self.color.b = b;
            }
        }
        self.update_callback.emit(Nodes::Color(self.color));
        true
    }

    fn view(&self) -> Html {
        html! {
            <div>
                <Slider label="r"
                    min=0.0 max=255.0 step=1.0
                    onchange={self.link.callback(|r| ColorMsg::UpdateR(r as u8))}
                    value={self.color.r as f64}
                />
                <Slider label="g"
                    min=0.0 max=255.0 step=1.0
                    onchange={self.link.callback(|r| ColorMsg::UpdateG(r as u8))}
                    value={self.color.g as f64}
                />
                <Slider label="b"
                    min=0.0 max=255.0 step=1.0
                    onchange={self.link.callback(|r| ColorMsg::UpdateB(r as u8))}
                    value={self.color.b as f64}
                />
            </div>
        }
    }
}
