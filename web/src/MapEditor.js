import React from 'react';
import './MapEditor.css';
import {
    Button,
    loadFile,
    Modal,
    handleChange,
    downloadFile,
} from './utils.js';
import axios from 'axios';
// import saveAs from 'file-saver';


function Tile({onClick, width, height, value, image}) {
    return (
        <div 
            className="tile"
            style={{width: width, height: height}}
            onClick={onClick}
        >
            <img
                src={`data:image/jpeg;base64,${image}`}
                alt={value}
            />
        </div>
    );
}
Tile.defaultProps = {
    width: 64,
    height: 64,
};


class ObjectView extends React.Component {
    render() {
        const self = this;

        return (
            <h1>OUI</h1>
        );
    }
}


class TilesetView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tileHeight:         props.tileHeight,
            tileWidth:          props.tileWidth,
        };
    }

    render() {
        const self = this;
        const style = {
            width:      self.state.tileWidth * self.props.columns,
            height:     self.state.tileHeight * self.props.rows,
        };

        return (
            <div
                className="tileset"
            >
                <div className="selected-tile">
                    <img
                        src={`data:image/jpeg;base64,${self.props.tileset[self.props.selectedTile]}`}
                        alt={self.props.selectedTile}
                        width={self.state.tileWidth}
                        height={self.state.tileHeight}
                    />
                </div>
                <div
                    className="tileset-content"
                    style={style}
                >
                    {self.props.tileset.map(function(tile, i) {
                        return (
                            <Tile 
                                key={i} 
                                width={self.state.tileWidth}
                                height={self.state.tileHeight}
                                value={i}
                                image={tile}
                                onClick={() => self.props.onTileClick(i)}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }
}
TilesetView.defaultProps = {
    selectedTile:       0,
    columns:            10,
    rows:               10,
    tileset:            [],
    tileWidth:          64,
    tileHeight:         64,
};


class MapView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tileHeight:         props.tileHeight,
            tileWidth:          props.tileWidth,
        };
    }

    render() {
        const self = this;
        const style = {
            // width:      self.state.tileWidth * self.props.columns,
            // height:     self.state.tileHeight * self.props.rows,
        };

        return (
            <div
                className="tilesGrid"
                style={style}
            >
                {
                    self.props.world.map(function(row, i) {
                        return (
                            <div 
                                style={{display: "flex"}}
                                key={i}
                            >
                                {
                                    row.map(function(tile, j) {
                                        return (
                                            <Tile 
                                                key={j} 
                                                width={self.state.tileWidth}
                                                height={self.state.tileHeight}
                                                value={tile}
                                                image={self.props.tileset[tile]}
                                                onClick={() => self.props.onTileClick(i, j)}
                                            />
                                        );
                                    })
                                }
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}
MapView.defaultProps = {
    columns:            10,
    rows:               10,
    world:              [],
    tileset:            [],
    tileWidth:          64,
    tileHeight:         64,
};


class LoadTilesetModal extends React.Component {
    render() {
        return (
            <Modal>
                bonjour
            </Modal>
        );
    }
}


class NewMapModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rows:               20,
            columns:            20,
        };

        this.onChange = handleChange.bind(this);
    }

    render() {
        const self = this;

        return (
            <Modal 
                display={self.props.display}
                onClose={self.props.onClose}
                title="New map"
            >
                <label htmlFor="rows">Rows:</label>
                <input 
                    value={self.state.rows} 
                    onChange={self.onChange} 
                    type="number"
                    name="rows" 
                />
                <label htmlFor="columns">Columns:</label>
                <input 
                    value={self.state.columns} 
                    onChange={self.onChange} 
                    type="number"
                    name="columns" 
                />
                <Button 
                    onClick={() => self.props.onCreate(self.state.rows, self.state.columns)}
                    label="Create" 
                />
            </Modal>
        );
    }
}


/**
 * props:
 *     - layers: list of (layer, enabled?)
 */
function LayerSelect({layers, onToggleLayer, onSelectLayer, selectedLayer}) {
    return (
        <div className="layer-select">
            {
                layers.map(function([layer, isEnabled], i) {
                    return (
                        <div key={i}>
                            <input 
                                type="checkbox" 
                                onChange={() => onToggleLayer(i)}
                                checked={isEnabled}
                            />
                            <input 
                                type="radio" 
                                onChange={() => onSelectLayer(i)} 
                                checked={i === selectedLayer}
                            />
                            {layer}
                        </div>
                    );
                })
            }
        </div>
    );
}


export class MapEditor extends React.Component {
    static title = "Map editor"

    constructor(props) {
        super(props);

        this.state = {
            tileset:                    undefined,
            world:                      undefined,
            displayNewMapModal:         false,
            selectedTile:               0,
            layers: [
                ["lowerTiles", true],
                ["upperTiles", true],
                ["collisions", true],
                ["objects", true],
            ],
            selectedLayer:              0,
        };

        this.handleTilesetChange = this.handleTilesetChange.bind(this);
        this.handleMapChange = this.handleMapChange.bind(this);
        this.handleCreateMap = this.handleCreateMap.bind(this);
        this.handleSaveMap = this.handleSaveMap.bind(this);
    }

    render() {
        const self = this;

        return (
            <div className="map-editor">
                <NewMapModal 
                    display={self.state.displayNewMapModal} 
                    onClose={() => self.setState({displayNewMapModal: false})}
                    onCreate={self.handleCreateMap}
                />
                <div className="side-menu">
                    <Button
                        label="Load tileset"
                        onClick={() => loadFile(self.handleTilesetChange)}
                    />
                    <Button
                        label="Load map"
                        onClick={() => loadFile(self.handleMapChange)}
                    />
                    <Button
                        label="New map"
                        onClick={() => self.setState({displayNewMapModal: true})}
                    />
                    <Button
                        label="Save map"
                        onClick={self.handleSaveMap}
                    />
                </div>
                <div
                    style={{display: "flex"}}
                >
                    <MapView 
                        columns={10}
                        rows={10}
                        world={self.state.world}
                        tileset={self.state.tileset}
                        onTileClick={function(i, j) {
                            let world = self.state.world;
                            world[i][j] = self.state.selectedTile;
                            self.setState({world: world});
                        }}
                    />
                    {(function() {
                        if ([0, 1].includes(self.state.selectedLayer)) {
                            return <TilesetView 
                                columns={5}
                                tileset={self.state.tileset}
                                selectedTile={self.state.selectedTile}
                                onTileClick={index => self.setState({selectedTile: index})}
                            />;
                        } else if (self.state.selectedLayer === 3) {
                            return <ObjectView
                            />;
                        }
                    })()}
                    <LayerSelect
                        layers={self.state.layers}
                        onSelectLayer={(i) => self.setState({selectedLayer: i})}
                        onToggleLayer={function(i) {
                            const layers = self.state.layers.slice();
                            layers[i][1] = !layers[i][1];
                            self.setState({layers: layers});
                        }}
                        selectedLayer={self.state.selectedLayer}
                    />
                </div>
            </div>
        );
    }

    handleTilesetChange(image) {
        console.log("Loading tileset");
        const self = this;

        const formData = new FormData();
        formData.append('image', image);
        formData.append('tileWidth', 16);
        formData.append('tileHeight', 16);

        axios.post('http://localhost:5000/map/tileset/prepare', formData)
            .then(function(response) {
                self.setState({tileset: response.data.tiles});
            });
    }

    handleCreateMap(rows, columns) {
        const self = this;
        let world = [];

        rows = parseInt(rows);
        columns = parseInt(columns);

        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < columns; j++) {
                row.push(0);
            }
            world.push(row);
        }

        self.setState({world: world, displayNewMapModal: false});
    }

    handleSaveMap() {
        const self = this;
        const request = {
            responseType: 'arraybuffer',
            url: 'http://localhost:5000/map/convert',
            method: 'post',
            data: {
                lowerTiles: self.state.world,
            }
        };

        axios(request)
            .then(function(response) {
                console.log(response);
                downloadFile(response.data);
            })
    }

    handleMapChange(pickledMap) {
        const self = this;
        const formData = new FormData();
        formData.append('world', pickledMap);

        axios.post('http://localhost:5000/map/load', formData)
            .then(function(response) {
                console.log(response);
                self.setState({world: response.data.lowerTiles});
            });
    }
}
