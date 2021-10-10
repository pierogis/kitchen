use std::cell::Cell;

use wasm_bindgen::closure::Closure;
// use web_sys::{FileReader, Event};
use yew::services::reader::{File, FileData, ReaderService};
use yew::{html, Callback, ChangeData, Component, ComponentLink, Html, Properties, ShouldRender};

thread_local! {
    static FILE_INPUT_ID: Cell<usize> = Cell::default();
}
fn next_file_input_id() -> usize {
    FILE_INPUT_ID.with(|cell| cell.replace(cell.get() + 1))
}

type FileName = String;

pub enum Msg {
    Files(Vec<File>),
    Loaded(FileName, FileData),
}

#[derive(Clone, Debug, PartialEq, Properties)]
pub struct Props {
    pub label: &'static str,
    pub onload: Callback<Vec<u8>>,
}

pub struct FileInput {
    props: Props,
    id: usize,
    link: ComponentLink<Self>,
}

impl Component for FileInput {
    type Message = Msg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            props,
            id: next_file_input_id(),
            link,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Files(files) => {
                for file in files.into_iter() {
                    let file_name = file.name();
                    let task = {
                        let file_name = file_name.clone();
                        let callback = self
                            .link
                            .callback(move |data| Msg::Loaded(file_name.clone(), data));
                        ReaderService::read_file(file, callback).unwrap()
                    };
                }
                false
            }
            Msg::Loaded(file_name, file_data) => {
                self.props.onload.emit(file_data.content);
                false
            }
        }
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
        let Props { label, ref onload } = self.props;

        let id = format!("file-{}", self.id);

        html! {
            <div class="file">
                <label for=id.clone() class="file-label">{ label }</label>
                <input type="file"
                    id=id
                    class="file-input"
                    accept="image/*, video/*"
                    onchange={self.link.callback(move |value| {
                let mut result = Vec::new();
                if let ChangeData::Files(files) = value {
                    let files = js_sys::try_iter(&files)
                    .unwrap()
                    .unwrap()
                    .map(|v| File::from(v.unwrap()));
                    result.extend(files);
                }
                Msg::Files(result)
            })}
                />
            </div>
        }
    }
}
