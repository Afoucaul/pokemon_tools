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


const COLLISIONS = [
    {name: "None", color: "white"},
    {name: "Wall", color: "black"},
    {name: "Water", color: "blue"},
];


function createWorld(rows, columns) {
    const world = {};

    world.lowerTiles = [];
    world.upperTiles = [];
    world.collisions = [];
    world.objects = [];
    world.events = [];

    for (let i = 0; i < rows; i++) {
        let row1 = [];
        let row2 = [];
        for (let j = 0; j < columns; j++) {
            row1.push(0);
            row2.push(-1);
        }
        world.lowerTiles.push(row1);
        world.collisions.push(row1.slice());
        world.upperTiles.push(row2.slice());
    }

    return world;
}


function Tile({onClick, width, height, value, image, display}) {
    const style = {width: width, height: height};
    if (display === false) {
        style.display = 'none';
    }

    return (
        <div 
            className="tile"
            style={style}
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
        // const self = this;

        return (
            <h1>OUI</h1>
        );
    }
}


class CollisionsView extends React.Component {
    render() {
        const self = this;
        const style = {
            display:            'flex',
            flexDirection:      'column',
        };

        return (
            <div
                style={style}
            >
                {COLLISIONS.map(function({name, color}, i) {
                    return (
                        <div>
                            <input 
                                type="radio" 
                                name={name} 
                                checked={i === self.props.currentCollision} 
                                onChange={() => self.props.onCollisionSelect(i)}
                            />
                            <label htmlFor={name}>{name}</label>
                        </div>
                    );
                })}
            </div>
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

        if (self.props.world) {
            return (
                <div
                    className="tilesGrid"
                >
                    {
                        self.props.world.lowerTiles.map(function(row, i) {
                            return (
                                <div 
                                    style={{display: "flex"}}
                                    key={i}
                                >
                                    {
                                        row.map(function(tile, j) {
                                            let overlayColor = "none";
                                            if (COLLISIONS[self.props.world.collisions[i][j]]) {
                                                overlayColor = COLLISIONS[
                                                    self.props.world.collisions[i][j]
                                                ].color;

                                            }
                                            return (
                                                <div 
                                                    className="tiles-container"
                                                    key={j} 
                                                    onClick={() => self.props.onTileClick(i, j)}
                                                    style={{
                                                        width: self.state.tileWidth,
                                                        height: self.state.tileHeight
                                                    }}
                                                >
                                                    <Tile 
                                                        display={self.props.layersVisibility[ 
                                                            'lowerTiles'
                                                        ]}
                                                        value={tile}
                                                        image={self.props.tileset[tile]}
                                                    />
                                                    <Tile 
                                                        display={self.props.layersVisibility[
                                                            'upperTiles'
                                                        ]}
                                                        value={self.props.world.upperTiles[i][j]}
                                                        image={
                                                            self.props.tileset[
                                                                self.props.world.upperTiles[i][j]
                                                            ]
                                                        }
                                                    />
                                                    <div 
                                                        className="tile-collision-overlay"
                                                        style={{
                                                            background: overlayColor,
                                                            width: self.state.tileWidth,
                                                            height: self.state.tileHeight,
                                                            display: self.props.layersVisibility[
                                                                'collisions'
                                                            ] ? "initial" : "none"
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            );
                        })
                    }
                </div>
            );
        } else {
            return (
                "No map loaded"
            );
        }
    }
}
MapView.defaultProps = {
    columns:            10,
    rows:               10,
    world:              undefined,
    tileset:            [],
    tileWidth:          64,
    tileHeight:         64,
    layersVisibility:   {},
};


// class LoadTilesetModal extends React.Component {
//     render() {
//         return (
//             <Modal>
//                 bonjour
//             </Modal>
//         );
//     }
// }


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
                ["events", true],
            ],
            selectedLayer:              0,
            currentCollision:           COLLISIONS[0].name,
        };

        this.handleTilesetChange = this.handleTilesetChange.bind(this);
        this.handleMapChange = this.handleMapChange.bind(this);
        this.handleCreateMap = this.handleCreateMap.bind(this);
        this.handleSaveMap = this.handleSaveMap.bind(this);
        this.handleTileClick = this.handleTileClick.bind(this);
        this.selectedLayer = this.selectedLayer.bind(this);
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
                        onTileClick={self.handleTileClick}
                        layersVisibility={self.state.layers.reduce(function(acc, elt) {
                            acc[elt[0]] = elt[1];
                            return acc;
                        }, {})}
                    />
                    {(function() {
                        if ([0, 1].includes(self.state.selectedLayer)) {
                            return <TilesetView 
                                columns={5}
                                tileset={self.state.tileset}
                                selectedTile={self.state.selectedTile}
                                onTileClick={index => self.setState({selectedTile: index})}
                            />;
                        } else if (self.state.selectedLayer === 2) {
                            return <CollisionsView
                                currentCollision={self.state.selectedTile}
                                onCollisionSelect={index => self.setState({selectedTile: index})}
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

        rows = parseInt(rows);
        columns = parseInt(columns);
        const world = createWorld(rows, columns);

        self.setState({world: world, displayNewMapModal: false}, () => console.log(self.state.world));
    }

    handleSaveMap() {
        const self = this;
        const request = {
            responseType: 'arraybuffer',
            url: 'http://localhost:5000/map/convert',
            method: 'post',
            data: {
                world: self.state.world,
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
                self.setState({world: response.data.world});
            });
    }

    handleTileClick(i, j) {
        const self = this;

        self.selectedLayer()[i][j] = self.state.selectedTile;
        console.log("Setting tile on layer", self.state.selectedLayer);

        self.forceUpdate();
    }

    selectedLayer() {
        const self = this;
        return self.state.world[self.state.layers[self.state.selectedLayer][0]];
    }
}
