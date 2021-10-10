use std::cell::Cell;
use yew::{html, Callback, Component, ComponentLink, Html, ChangeData, Properties, ShouldRender};

thread_local! {
    static CHECKBOX_ID: Cell<usize> = Cell::default();
}
fn next_checkbox_id() -> usize {
    CHECKBOX_ID.with(|cell| cell.replace(cell.get() + 1))
}

#[derive(Clone, Debug, PartialEq, Properties)]
pub struct Props {
    pub label: &'static str,
    pub checked: bool,
    pub onchange: Callback<()>,
}

pub struct Checkbox {
    props: Props,
    id: usize,
}
impl Component for Checkbox {
    type Message = ();
    type Properties = Props;

    fn create(props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        Self {
            props,
            id: next_checkbox_id(),
        }
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        unimplemented!()
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        if self.props != props {
            self.props = props;
            true
        } else {
            false
        }
    }

    fn view(&self) -> Html {
        let Props {
            label,
            checked,
            ref onchange,
        } = self.props;

        let id = format!("checkbox-{}", self.id);

        html! {
            <div class="checkbox">
                <label for=id.clone() class="checkbox-label">{ label }</label>
                <input type="checkbox"
                    id=id
                    class="checkbox-input"
                    onclick=onchange.reform(|event| ())
                    checked=checked
                />
            </div>
        }
    }
}