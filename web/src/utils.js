import React from 'react';
import './utils.css';


export class Button extends React.Component {
    render() {
        const self = this;
        let className = "button";
        if (self.props.disabled)
            className += " disabled";

        return (
            <input 
                type="button"
                className={className}
                onClick={self.props.disabled ? () => {} : self.props.onClick}
                value={self.props.label}
            />
        );
    }
}
Button.defaultProps = {
    label:      "BUTTON",
    onClick:    () => console.log("Default click"),
    disabled:   false,
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
    const blobUrl = window.URL.createObjectURL(blob);

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
    constructor(props) {
        super(props);

        this.mainRef = React.createRef();

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const self = this;

        if (!prevProps.display && self.props.display)
            self.mainRef.current.focus();
    }

    render() {
        const self = this;

        return (
            <div 
                className="modal-overlay" 
                style={{display: self.props.display ? "block" : "none"}}
                onKeyPress={self.handleKeyPress}
                tabIndex="0"
                ref={self.mainRef}
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

    handleKeyPress(event) {
        const self = this;

        if (event.key === 'Escape' || event.key === 'q')
            self.props.onClose();
    }
}


export function handleChange(event) {
    let state = {};
    state[event.target.name] = event.target.value;
    this.setState(state);
}


export function Noop(_props) {
    return (
        <script />
    );
}

export function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.substr(1);
}
