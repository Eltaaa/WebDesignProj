import images_list from './images.json';
import board_data from './boarddata.json';

function shuffleArray(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

export const shuffledImages = shuffleArray(images_list);

export function getBoardList() {
    return board_data.map(board => ({
        board_id: board.board_id,
        board_name: board.name
    }));
}
