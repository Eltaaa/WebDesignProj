import { NavigationDrawer } from './navbar';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import Masonry from '@mui/lab/Masonry';
import { shuffledImages } from './util';
import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { firebase_db } from "./database/firebase.js";

export function HomePage() {
    return (
        <Box>
            {NavigationDrawer(HomePageContent)}
        </Box>
    );
}

function HomePageContent() {
    const imgs = shuffledImages;

    const [boards, setBoards] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [saveAs, setSaveAs] = useState("");

    // get board from firebase
    // this one is use to select board to add img t o
    useEffect(() => {
        const fetchBoards = async () => {
            const boardsCol = collection(firebase_db, "moodboards");
            const gottenBoard = await getDocs(boardsCol);
            const boardsData = gottenBoard.docs.map(doc => ({
                board_id: doc.id,
                ...doc.data() // take what's inside doc.data() to map parameter
                // I guess it work like print(*[]) in python ?
            }));
            setBoards(boardsData);
        };
        fetchBoards();
    }, []);
    // ^ this [] is to make useEffect run once ? according to what I understand, lmao
    // https://react.dev/reference/react/useEffect


    const OpenModal = (img) => {
        setSelectedImage(img);
        setSaveAs("");
        setOpenModal(true);
    };

    const addToBoardButton = async () => {

        // validate
        if (!selectedBoard || !selectedImage || !saveAs) {
            alert("Please select a board and enter a 'Save As' name.");
            return;
        }

        // data that is store oon firebase.
        const imgKey = Object.keys(selectedImage)[0];
        const imgPath = Object.values(selectedImage)[0];


        const targetBoard = doc(firebase_db, "moodboards", selectedBoard);
        const board_gotten = await getDoc(targetBoard);

        let boardData = {};
        if (board_gotten.exists()) {
            boardData = board_gotten.data();
        }

        //  get what's archived in the board
        let img_archive_in_board = [];

        if (boardData.archived_img) {
            img_archive_in_board = [...boardData.archived_img];
        }
        // *******************************

        // Validate duplicate save_as name
        if (img_archive_in_board.find(img => img.save_as === saveAs)) {
            alert("The 'Save As' name already exists in this board. Please choose another name.");
            return;
        }

        // add new image to the board data
        img_archive_in_board.push({
            img_name: imgPath,
            save_as: saveAs
        });

        await setDoc(targetBoard, {
            ...boardData,
            archived_img: img_archive_in_board
        });

        // close modal and reset input
        setOpenModal(false);
        setSelectedBoard("");
        setSelectedImage(null);
        setSaveAs("");
    };

    return (
        <Box component="main" className='main-box sub-color'>
            {/* 1920 - 240(drawerWidth) - 100(just some gap because padding,margin doesnt work somehow ???? ) */}
            <Box sx={{ width: 1680 - 100, minHeight: 829 }}>
                <Masonry columns={5} spacing={2}>
                    {imgs.map((item) => {
                        const imgKey = Object.keys(item)[0];
                        const imgPath = Object.values(item)[0];

                        return (
                            <Box key={imgKey} className='mason-img-card'>
                                <Link to={`/img/${imgKey}`}>
                                    <img
                                        src={`images/${imgPath}?w=162&auto=format`}
                                        className="masonry-image"
                                    />
                                </Link>

                                {/* add btn */}
                                <div className="mason-img-btn-wrapper main-color">
                                    {/* button class css doesnt work without ^ div ???? */}
                                    <Button
                                        variant="contained"
                                        size="small"
                                        className="mason-img-btn  main-color"
                                        onClick={() => OpenModal(item)}
                                    >
                                        +
                                    </Button>
                                </div>
                            </Box>
                        );
                    })}
                </Masonry>
            </Box>

            {/* when clicking add to board */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>Add Image to Board</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth className="form-input-border">
                        <InputLabel>Board</InputLabel>
                        <Select
                            value={selectedBoard}
                            onChange={(e) => setSelectedBoard(e.target.value)}
                        >
                            {boards.map((b) => (
                                <MenuItem key={b.board_id} value={b.board_id}>
                                    {b.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        className="form-input-border"
                        sx={{ mt: 2 }}
                        label="Save As"
                        value={saveAs}
                        onChange={(e) => setSaveAs(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={addToBoardButton} className='modal-pos-btn'>Add</Button>

                </DialogActions>
            </Dialog>
        </Box>
    );
}
