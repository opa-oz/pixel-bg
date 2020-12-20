import Konva from 'konva';
import 'normalize.css';
// import SimplexNoise from 'simplex-noise';
import randomChoice from 'random-choice';

const tiles = [
    require('./assets/svgs/DungeonTiles/part1.svg'),
    require('./assets/svgs/DungeonTiles/part2.svg'),
    require('./assets/svgs/DungeonTiles/part3.svg'),
    require('./assets/svgs/DungeonTiles/part4.svg'),
    require('./assets/svgs/DungeonTiles/part5.svg'),
    require('./assets/svgs/DungeonTiles/part6.svg'),
    require('./assets/svgs/DungeonTiles/part7.svg'),
    require('./assets/svgs/DungeonTiles/part8.svg'),
    require('./assets/svgs/DungeonTiles/part9.svg'),
    require('./assets/svgs/DungeonTiles/part10.svg'),
    require('./assets/svgs/DungeonTiles/part11.svg'),
    require('./assets/svgs/DungeonTiles/part12.svg'),
    require('./assets/svgs/DungeonTiles/part13.svg'),
    require('./assets/svgs/DungeonTiles/part14.svg'),
    require('./assets/svgs/DungeonTiles/part15.svg'),
    require('./assets/svgs/DungeonTiles/part16.svg'),
    require('./assets/svgs/DungeonTiles/part17.svg'),
    require('./assets/svgs/DungeonTiles/part18.svg'),
    require('./assets/svgs/DungeonTiles/part19.svg'),
    require('./assets/svgs/DungeonTiles/part20.svg'),
    require('./assets/svgs/DungeonTiles/part21.svg'),
    require('./assets/svgs/DungeonTiles/part22.svg'),
    require('./assets/svgs/DungeonTiles/part23.svg')
];

enum colors {
    BLACK = '#222034'
}

const MULTIPLIER = 5;
const BG_ELEMENTS_COUNT = 9;
const SPEED = 1;

const paddings = {
    NEGATIVE: 256
};

const TILE_SIZE = 16 * MULTIPLIER;

let currentOffset = 0;
let isOdd = true;

// const simplex = new SimplexNoise('opa_oz');

type TileSet = {
    bg: Konva.Image;
    wall1: Konva.Image;
    wall2: Konva.Image;
    wallEnd: Konva.Image;
    floorX: Konva.Image;
    floorCracked: Konva.Image;
    rightBottomCorner: Konva.Image;
    leftBottomCorner: Konva.Image;
    rightBottomWall: Konva.Image;
    leftBottomWall: Konva.Image;
    floor: Konva.Image;
    floorSlightlyCracked: Konva.Image;
    rightTopCorner: Konva.Image;
    leftTopCorner: Konva.Image;
    rightTopWall: Konva.Image;
    leftTopWall: Konva.Image;
    bottomWall: Konva.Image;
    rightWall: Konva.Image;
    leftWall: Konva.Image;
    topWall1: Konva.Image;
    topWall2: Konva.Image;
    lowWall1: Konva.Image;
    lowWall2: Konva.Image;
};

const prepareResources = async (): Promise<TileSet> => {
    const [
        bg,
        wall1,
        wall2,
        wallEnd,
        floorX,
        floorCracked,
        rightBottomCorner,
        leftBottomCorner,
        rightBottomWall,
        leftBottomWall,
        floor,
        floorSlightlyCracked,
        rightTopCorner,
        leftTopCorner,
        rightTopWall,
        leftTopWall,
        bottomWall,
        rightWall,
        leftWall,
        topWall1,
        topWall2,
        lowWall1,
        lowWall2
    ] = (await Promise.all(
        tiles.map(
            (tile) =>
                new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const tiles = new Konva.Image({
                            image: img,
                            width: TILE_SIZE,
                            height: TILE_SIZE
                        });

                        resolve(tiles);
                    };
                    img.src = tile;
                })
        )
    )) as Konva.Image[];

    return {
        bg,
        wall1,
        wall2,
        wallEnd,
        floorX,
        floorCracked,
        rightBottomCorner,
        leftBottomCorner,
        rightBottomWall,
        leftBottomWall,
        floor,
        floorSlightlyCracked,
        rightTopCorner,
        leftTopCorner,
        rightTopWall,
        leftTopWall,
        bottomWall,
        rightWall,
        leftWall,
        topWall1,
        topWall2,
        lowWall1,
        lowWall2
    };
};

const main = async () => {
    const stage = new Konva.Stage({
        container: 'root',
        width: window.innerWidth,
        height: window.innerHeight
    });

    const layer = new Konva.Layer();
    const shadowLayer = new Konva.Layer();
    const torchesLightLayer = new Konva.Layer();

    const {
        bottomWall,
        topWall1,
        topWall2,
        floor,
        floorCracked,
        floorSlightlyCracked,
        floorX,
        wall1,
        wall2,
        lowWall1,
        lowWall2
    } = await prepareResources();

    stage.container().style.backgroundColor = colors.BLACK;

    const addToGroup = (group: Konva.Group) => {
        return (image: Konva.Image, key: number) => {
            const img = image.clone();
            img.setAttrs({
                y: TILE_SIZE * key,
                x: 0
            });
            group.add(img);
        };
    };

    // function noiseChoice<T>(values: Array<T>, x: number, y: number): T {
    //     const value2D = simplex.noise2D(x, y);
    //     if (value2D >= 0.8) {
    //         return values[3];
    //     } else if (value2D <= -0.8) {
    //         return values[2];
    //     } else if (value2D > 0.3 || value2D < -0.3) {
    //         return values[0];
    //     } else {
    //         return values[1];
    //     }
    // }

    const fillField = (stage: Konva.Stage, layer: Konva.Layer, width: number) => {
        const floors = [floor, floorSlightlyCracked, floorCracked, floorX];
        const floorsWeights = [1, 0.1, 0.1, 0.01];
        const stageHeight = stage.height();
        const stageWidth = stage.width();
        const minOffset = currentOffset - stageWidth - paddings.NEGATIVE * 2;

        while (currentOffset <= width) {
            const tile = new Konva.Group({
                width: TILE_SIZE,
                height: TILE_SIZE * BG_ELEMENTS_COUNT,
                y: stageHeight - TILE_SIZE * BG_ELEMENTS_COUNT,
                x: currentOffset
            });

            [
                bottomWall,
                isOdd ? wall1 : wall2,
                isOdd ? lowWall2 : lowWall1,
                ...new Array(BG_ELEMENTS_COUNT - 4)
                    .fill(null)
                    //.map((v, k) => noiseChoice<Konva.Image>(floors, currentOffset / TILE_SIZE, k)),
                    .map(() => randomChoice<Konva.Image>(floors, floorsWeights)),
                isOdd ? topWall1 : topWall2
            ].forEach(addToGroup(tile));

            tile.cache();
            layer.add(tile);

            if (currentOffset % 3 <= 0 && isOdd) {
                const tX = currentOffset - TILE_SIZE / 2;
                const tY = stageHeight - TILE_SIZE * (BG_ELEMENTS_COUNT - 2) - TILE_SIZE / 3;

                const torch = new Konva.Rect({
                    width: TILE_SIZE / 4,
                    height: TILE_SIZE / 2,
                    x: tX,
                    y: tY,
                    fill: '#f00'
                });

                const circle = new Konva.Circle({
                    x: tX + TILE_SIZE / (2 * MULTIPLIER),
                    y: tY,
                    radius: 50,
                    fill: '#fff'
                });

                torch.cache();
                layer.add(torch);
                shadowLayer.add(circle);
            }

            currentOffset += TILE_SIZE;
            isOdd = !isOdd;
        }
        [layer, shadowLayer].forEach((l) =>
            l.getChildren((node) => {
                if (node.attrs.x < minOffset) {
                    node.destroy();
                    return true;
                }

                return false;
            })
        );
    };

    const width = stage.width() + paddings.NEGATIVE;
    fillField(stage, layer, width);

    const shadow = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width() + paddings.NEGATIVE,
        height: stage.height(),
        fill: '#000',
        opacity: 0.75,
        globalCompositeOperation: 'xor'
    });

    shadowLayer.add(shadow);

    const period = 4000;

    const anim = new Konva.Animation(
        function (frame) {
            // update stuff
            layer.setAttrs({
                x: layer.x() - SPEED
            });
            // torchesLightLayer.setAttrs({
            //     x: torchesLightLayer.x() - SPEED
            // });
            shadowLayer.setAttrs({
                x: shadowLayer.x() - SPEED
            });
            shadow.setAttrs({
                x: shadow.x() + SPEED
            });
            if (frame && frame?.time % (period * 2) < period) {
                fillField(stage, layer, width + -layer.x());
            }
        },
        [layer, torchesLightLayer, shadowLayer]
    );

    anim.start();

    stage.add(layer);
    stage.add(shadowLayer);
    stage.add(torchesLightLayer);
    layer.draw();
};

document.addEventListener('DOMContentLoaded', main);
