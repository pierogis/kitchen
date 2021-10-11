use std::cell::Cell;
use std::collections::HashMap;

use yew::{html, Callback, ChangeData, Component, ComponentLink, Html, Properties, ShouldRender};

thread_local! {
    static FILE_INPUT_ID: Cell<usize> = Cell::default();
}
fn next_file_input_id() -> usize {
    FILE_INPUT_ID.with(|cell| cell.replace(cell.get() + 1))
}

type FileName = String;

pub enum Msg {
    Files(Vec<web_sys::File>),
    Loaded((FileName, String)),
}

#[derive(Clone, Debug, PartialEq, Properties)]
pub struct Props {
    pub label: &'static str,
    pub onload: Callback<String>,
}

pub struct FileInput {
    link: ComponentLink<Self>,
    props: Props,
    id: usize,
    tasks: HashMap<FileName, ReaderTask>,
}

impl Component for FileInput {
    type Message = Msg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            link,
            props,
            id: next_file_input_id(),
            tasks: HashMap::default(),
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Files(files) => {
                for file in files.into_iter() {
                    // file_reader.set_onloadend();
                    let file_name = file.name();
                    let task = {
                        let file_name = file_name.clone();
                        let callback = self
                            .link
                            .callback(move |data_url| Msg::Loaded((file_name.clone(), data_url)));
                        FileInput::read_file_as_data_url(file, callback)
                    };
                    self.tasks.insert(file_name, task);
                }

                true
            }
            Msg::Loaded((file_name, data_url)) => {
                self.props.onload.emit(data_url);
                self.tasks.remove(&file_name);
                true
            }
        }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        false
    }

    fn view(&self) -> Html {
        let id = format!("file-{}", self.id);

        html! {
            <div class="file">
                <label for=id.clone() class="file-label">{ self.props.label }</label>
                <input type="file"
                    id=id
                    class="file-input"
                    accept="image/*, video/*"
                    onchange=self.link.callback(move |value| {
                        let mut result = Vec::new();
                        if let ChangeData::Files(files) = value {
                            let files = js_sys::try_iter(&files)
                                .unwrap()
                                .unwrap()
                                .map(|v| web_sys::File::from(v.unwrap()));
                            result.extend(files);
                        }
                        Msg::Files(result)
                    })
                />
            </div>
        }
    }
}

impl FileInput {
    pub fn read_file_as_data_url(file: web_sys::File, callback: Callback<String>) -> ReaderTask {
        let file_reader = web_sys::FileReader::new().expect("acquire file reader");
        let reader = file_reader.clone();
        let callback = move |_event: &web_sys::Event| {
            if let Ok(result) = reader.result() {
                let data_url = result.as_string().unwrap();
                callback.emit(data_url);
            }
        };
        let listener = gloo::events::EventListener::once(&file_reader, "loadend", callback);
        file_reader.read_as_data_url(&file).unwrap();
        ReaderTask {
            file_reader,
            listener,
        }
    }
}

#[must_use = "the reader will abort when the task is dropped"]
pub struct ReaderTask {
    pub(super) file_reader: web_sys::FileReader,
    #[allow(dead_code)]
    listener: gloo::events::EventListener,
}
