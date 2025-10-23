import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, List, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormHelperText } from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { NavigationDrawer } from "./navbar";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { firebase_db } from "./database/firebase.js";

export function BoardList() {
    return <Box>{NavigationDrawer(BoardListContent)}</Box>;
}

function BoardListContent() {
    const [boardlist, setBoards] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [addWarning, setAddWarning] = useState("");

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deleteBoard, setDeleteBoard] = useState(null);
    const [confirmName, setConfirmName] = useState("");
    const [deleteWarning, setDeleteWarning] = useState("");

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const boadCollection = collection(firebase_db, "moodboards");
                const board_get = await getDocs(boadCollection);
                const boardsData = board_get.docs.map(doc => ({
                    board_id: doc.id,
                    ...doc.data()
                }));
                setBoards(boardsData);
            } catch (error) {
                console.error(error);
            }
        };
        fetchBoards();
    }, []);

    // add board btn
    const addBoardBtn = async () => {
        // no name
        if (!newBoardName.trim()) return;


        // validate if there's duplicate board name
        if (boardlist.some(b => b.name.trim().toLowerCase() === newBoardName.trim().toLowerCase())) {
            setAddWarning("Board name already exists. Please choose another name.");
            return;
        }

        // board id need to be in correct format
        const newBoardId = `${boardlist.length + 1}`;
        const newBoard = {
            name: newBoardName.trim(),
            elements: [],
            checklists: [],
            archived_img: [],
            // board id need to be in correct format
            board_id: `${boardlist.length + 1}`
        };

        try {
            await setDoc(doc(firebase_db, "moodboards", newBoardId), newBoard);
            setBoards(prev => [...prev, { board_id: newBoardId, ...newBoard }]);
            setNewBoardName("");
            setAddWarning("");
            setOpenAddModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    // delete board modal
    const delBoardModal = (board) => {
        setDeleteBoard(board);
        setConfirmName("");
        setDeleteWarning("");
        setOpenDeleteModal(true);
    };

    // Confirm delete
    const confirmDeletion = async () => {
        // no input
        if (!deleteBoard) return;


        if (confirmName.trim() === deleteBoard.name) {
            try {
                await deleteDoc(doc(firebase_db, "moodboards", deleteBoard.board_id));
                setBoards(prev => prev.filter(b => b.board_id !== deleteBoard.board_id));
                setOpenDeleteModal(false);
            } catch (err) {
                console.error(err);
            }
        } else {
            setDeleteWarning("boardname is not correct");
        }
    };

    return (
        <Box component="main" className='main-box sub-color'>
            <Box sx={{ width: 1580, minHeight: 829 }}>
                <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                    Your Moodboards
                    <IconButton
                        className="add-board-btn"
                        onClick={() => setOpenAddModal(true)}

                    >
                        <AddIcon />
                    </IconButton>
                </Typography>

                <List sx={{ width: "100%" }}>
                    {boardlist.map((board, index) => (
                        <React.Fragment key={board.board_id}>
                            <ListItem
                                className={`board-list-item ${index % 2 === 0 ? "even" : "odd"}`}
                                secondaryAction={
                                    <IconButton
                                        onClick={() => delBoardModal(board)}
                                        
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <Link className="no-underline-link" to={`/b/${board.board_id}`}>
                                    <ListItemText primary={board.name} />
                                </Link>
                            </ListItem>

                        </React.Fragment>
                    ))}
                </List>
            </Box>

            {/* add board model */}
            <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)}>
                <DialogTitle>New Board Name</DialogTitle>


                <DialogContent>
                    <TextField
                        label="Board Name"
                        fullWidth
                        variant="standard"
                        value={newBoardName}
                        onChange={(e) => {
                            setNewBoardName(e.target.value);
                            setAddWarning("");
                        }}
                    />
                    {addWarning && <FormHelperText error>{addWarning}</FormHelperText>}
                </DialogContent>



                <DialogActions>
                    <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
                    <Button onClick={addBoardBtn} variant="contained" className="modal-pos-btn">Add</Button>
                </DialogActions>


            </Dialog>

            {/* Delete Board Modal */}
            <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        enter board name "{deleteBoard?.name}" to  delete.
                    </Typography>
                    <TextField
                        label="Board Name"
                        variant="standard"
                        value={confirmName}
                        onChange={(e) => {
                            setConfirmName(e.target.value);
                            setDeleteWarning("");
                        }}
                    />
                    {deleteWarning && <FormHelperText error>{deleteWarning}</FormHelperText>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
                    <Button onClick={confirmDeletion} variant="contained" className="modal-pos-btn">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
