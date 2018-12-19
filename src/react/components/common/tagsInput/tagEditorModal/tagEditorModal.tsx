import React from "react";
import ReactModal from "react-modal";
import Form from "react-jsonschema-form";
import "./tagEditorModal.scss";
import { ITag } from "../../../../../models/applicationState";
// tslint:disable-next-line:no-var-requires
const formSchema = require("./tagEditorModal.json");

const customStyles = {
    content : {
      top                   : "50%",
      left                  : "50%",
      right                 : "auto",
      bottom                : "auto",
      marginRight           : "-50%",
      transform             : "translate(-50%, -50%)",
      zIndex                : 1,
    },
  };

export interface ITagEditorModalProps {
    tag: ITag;
    showModal: boolean;
    onSubmit: (tag: ITag) => void;
    onCancel: (value) => void;
}

export interface ITagEditorModalState {
    tag: ITag;
    isOpen: boolean;
}

export default class TagEditorModal extends React.Component<ITagEditorModalProps, ITagEditorModalState> {

    constructor(props: ITagEditorModalProps) {
        super(props);
        this.state = {
            tag: props.tag,
            isOpen: false,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleOk = this.handleOk.bind(this);
    }

    public render() {
        return (
            <div>
                <ReactModal
                    isOpen={this.props.showModal}
                    ariaHideApp={false}
                    style={customStyles}>
                    <Form
                        schema={formSchema}
                        formData={this.state.tag}
                        onChange={this.handleChange}
                        onSubmit={this.handleOk}>
                        <div>
                            <button className="btn btn-info" onClick={this.handleOk}>Ok</button>
                            <button className="btn btn-info" onClick={this.props.onCancel}>Cancel</button>
                        </div>
                    </Form>
                </ReactModal>
            </div>
        );
    }

    public componentDidUpdate(prevProps) {
        if (this.props.tag && prevProps.tag !== this.props.tag) {
            this.setState({
                tag: this.props.tag,
            });
        }
    }

    private handleChange(args){
        this.setState({
            tag: args.formData
        })
    }

    private handleOk() {
        this.props.onSubmit(this.state.tag);
    }
}
