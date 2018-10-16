import React from 'react';
import './utils.css';


export class Button extends React.Component {
    render() {
        const self = this;

        return (
            <div 
                className="button" 
                onClick={self.props.onClick}
            >
                {self.props.label}
            </div>
        );
    }
}
Button.defaultProps = {
    label:      "BUTTON",
    onClick:    () => console.log("Default click"),
};


export function loadFile(callback) {
    const inputNode = document.createElement("input");
    inputNode.style.display = "none";
    inputNode.type = "file";
    inputNode.onchange = function(event) {
        callback(event.target.files[0]);
    };
    inputNode.click();
}


export function downloadFile(data, filename) {
    const blob = new Blob([data], {type: 'application/octet-stream'});
    console.log(blob);
    const blobUrl = window.URL.createObjectURL(blob);
    console.log(blobUrl);

    const aNode = document.createElement("a");
    aNode.style.display = "none";
    aNode.href = blobUrl;
    aNode.download = filename || "file";

    document.body.appendChild(aNode);
    aNode.click();
    aNode.remove();
}


/**
 * props: 
 *     - display:       bool
 *     - children:      content
 */
export class Modal extends React.Component {
    render() {
        const self = this;

        return (
            <div 
                className="modal-overlay" 
                style={{display: self.props.display ? "block" : "none"}}
            >
                <div
                    className="modal"
                >
                    <div className="cross" onClick={self.props.onClose}>x</div>
                    <div className="title">{self.props.title}</div>
                    <div className="content">{self.props.children}</div>
                </div>
            </div>
        );
    }
}


export function handleChange(event) {
    let state = {};
    state[event.target.name] = event.target.value;
    this.setState(state);
}
