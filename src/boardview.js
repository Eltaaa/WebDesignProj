import { NavigationDrawer } from './navbar'
import { useParams } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Box, Button, Typography, CssBaseline, AppBar, Toolbar, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import Draggable from "react-draggable";
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox';
import { Menu, MenuItem, IconButton, Avatar } from "@mui/material";
import { doc, setDoc, getFirestore, collection, addDoc, getDoc } from "firebase/firestore";

import { firebase_db } from "./database/firebase.js";


const SaveBoardToFirebase = async (board) => {
    try {
        await setDoc(doc(firebase_db, "moodboards", board.board_id), board);
        console.log("Board saved!");
    } catch (err) {
        console.log(err);
    }
};

// Image in the board can not be resized or deleted.
// I cant implemented in time
export function BoardView() {
    return <Box>
        {NavigationDrawer(BoardContent)}
    </Box>
}

function BoardContent() {
    const { board_id } = useParams();

    const [board, setBoard] = useState(null);
    const [elements, setElements] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [newText, setNewText] = useState("");

    // img archive dropdown
    const [anchorEl, setAnchorEl] = useState(null);

    const viewArchived = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const unviewArchive = () => {
        setAnchorEl(null);
    };

    const addImageToBoard = (archivedImg) => {
        // console.log(archivedImg);

        const newImgElement = {
            type: "image",
            id: `img_${elements.length + 1}`,
            src: archivedImg.img_name, // path to image
            position: { x: 100, y: 100 },
            scale: 1,
            rotation: 0,
            zIndex: 1,
        };
        // console.log(newImgElement);
        setElements(prev => [...prev, newImgElement]);
        SaveBoardToFirebase({ ...board, elements: [...elements, newImgElement] });
        unviewArchive();
    };

    useEffect(() => {
        const fetchBoard = async () => {
            const thedoc = doc(firebase_db, "moodboards", board_id);
            const board_document = await getDoc(thedoc);
            if (board_document.exists()) {
                const data = board_document.data();
                setBoard(data);
                setElements(data.elements || []);
            } else {
                console.log("no board");
            }
        };

        fetchBoard();
    }, [board_id]);
    // use effect will run every time board_id change
    // https://react.dev/reference/react/useEffect


    // Open/close modal
    const newNoteModal = () => setOpenModal(true);
    const unviewArchiveModal = () => {
        setNewText("");
        setOpenModal(false);
    };

    // Add new text note
    const newNoteConfirm = () => {
        if (!newText) return;
        const newNote = {
            type: "text",
            id: `note_${elements.length + 1}`,
            content: newText,
            position: { x: 100, y: 100 },
            scale: 1,
            rotation: 0,
            zIndex: 1,
            groupId: "0"
        };
        setElements(prev => [...prev, newNote]);
        unviewArchiveModal();
    };


    // shown when boardis not done loading
    if (!board) return <div>aaaaa</div>;

    return (
        <Box className="board-canvas">
            <AppBar className='board-bar'>
                <Toolbar>
                    <Typography  noWrap component="div" className='top-bar'>
                        <Button variant="contained" onClick={newNoteModal} className='modal-pos-btn'>New Note</Button>

                        {/* Archived Image Dropdown */}
                        <Button
                            variant="contained"
                            onClick={viewArchived}
                            className='modal-pos-btn'
                        >
                            Add Image From Archive
                        </Button>


                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={unviewArchive}
                        >
                            {board.archived_img.map((img) => (
                                <MenuItem key={img.save_as} onClick={() => addImageToBoard(img)}>
                                    <img
                                        // src={img.img_name}
                                        src={`/images/${img.img_name}`}
                                        // alt={img.save_as}
                                        // sx={{ maxwidth: 24, height: 24, mr: 1 }}
                                        className='archived-thumbnail'
                                    />
                                    {img.save_as}
                                </MenuItem>
                            ))}
                        </Menu>

                        {/* <Button variant="contained" className='modal-pos-btn'>New Checklist</Button> */}
                    </Typography>
                </Toolbar>
            </AppBar>

            <RightChecklist board={board} />

            <TransformWrapper
                minScale={0.1}
                maxScale={2}
                wheel={{ step: 0.1 }}
            >
                <TransformComponent>
                    <Box sx={{ width: 3000, height: 2000, position: "relative" }}>
                        {elements.map(el => (
                            <BoardElement
                                key={el.id}
                                element={el}
                                changeElementPosition={(id, newPosition) => {
                                    setElements(prev => {
                                        const updated = prev.map(elm => elm.id === id ? { ...elm, position: newPosition } : elm);
                                        SaveBoardToFirebase({ ...board, elements: updated });
                                        return updated;
                                    });
                                }}
                                saveContentChange={(id, newContent) => {
                                    setElements(prev => {
                                        const updated = prev.map(elm => elm.id === id ? { ...elm, content: newContent } : elm);
                                        SaveBoardToFirebase({ ...board, elements: updated });
                                        return updated;
                                    });
                                }}
                            />
                        ))}
                    </Box>
                </TransformComponent>
            </TransformWrapper>

            {/* new note */}
            <Dialog open={openModal} onClose={unviewArchiveModal}>
                <DialogTitle>New Note</DialogTitle>
                <DialogContent>
                    <TextField
                        label="note text here"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={unviewArchiveModal}>Cancel</Button>
                    <Button onClick={newNoteConfirm} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}


function BoardElement({ element, changeElementPosition, saveContentChange }) {
    const { type, position, scale = 1, rotation = 0, zIndex = 1 } = element;
    const nodeRef = useRef(null);
    // useRef is for dragging thing aroudn without rerender or smth ๆ

    const [pos, setPos] = useState({ x: position.x, y: position.y });
    const [isEditingTextNote, setisEditingTextNote] = useState(false);
    const [textValue, setTextValue] = useState(element.content || "");

    const stopDragging = (e, data) => {
        setPos({ x: data.x, y: data.y });
        if (changeElementPosition) {
            changeElementPosition(element.id, { x: data.x, y: data.y });
        }
    };

    const doublClikEdit = () => {
        if (type === "text") {
            setisEditingTextNote(true);
        }
    };

    const losingFocus = async () => {
        setisEditingTextNote(false);
        if (saveContentChange && textValue !== element.content) {
            saveContentChange(element.id, textValue);
        }
    };



    let content;
    if (type === "image") {
        content = (
            <div>
                <img src={`/images/${element.src}`} alt="" style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: "top left",
                }} />
            </div>
        );
    } else if (type === "text") {


        if (isEditingTextNote) {
            content = (
                <TextField
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    // blur = lose focus = click something else
                    onBlur={losingFocus}
                    variant="standard"
                    className='text-editing'

                />
            );
        } else {
            content = (
                <div
                    onDoubleClick={doublClikEdit}
                    className='note-wrapper'
                >
                    {element.content}
                </div>
            );
        }
    }

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultPosition={{ x: pos.x, y: pos.y }}
            onStart={(e) => e.stopPropagation()}
            onStop={stopDragging}
        >
            <div
                ref={nodeRef}
                style={{
                    position: "absolute",
                    cursor: "move",
                    zIndex,
                }}
            >
                {content}
            </div>
        </Draggable>
    );
}



function RightChecklist({ board }) {

    const [checklists, setChecklists] = useState(board.checklists || []);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

    const [checklistModalOpen, setChecklistModalOpen] = useState(false);
    const [newChecklistText, setNewChecklistText] = useState("");


    // loard new checklist when board change
    useEffect(() => {
        setChecklists(board.checklists || []);
    }, [board]);

    // Toggle checked state
    const checkingCheckBox = async (check_id) => {
        const updated = checklists.map((cl) => {
            if (cl.check_id === check_id) {
                // Toggle checked state
                let newCheckedState;
                if (cl.checked === "checked") {
                    newCheckedState = "unchecked";
                } else {
                    newCheckedState = "checked";
                }

                //return checklist with new check/unchenk
                return {
                    ...cl,
                    checked: newCheckedState
                };
            } else {
                // this checklist is not being click on, just return it
                return cl;
            }
        });

        setChecklists(updated);
        await setDoc(doc(firebase_db, "moodboards", board.board_id), { ...board, checklists: updated });
    };

    // edit checklist 
    const editCheckList = (cl) => {
        setEditingId(cl.check_id);
        setEditValue(cl.content);
    };

    // Finish editing
    const doneEditChecklist = async () => {
        const new_checklist_text = editValue.trim();


        if (!new_checklist_text) {
            return alert("Checklist cannot be empty!");
        }


        if (checklists.some(cl => cl.content === new_checklist_text && cl.check_id !== editingId)) {
            return alert("Checklist already exists!");
        }

        const updated = checklists.map((cl) => {
            if (cl.check_id === editingId) {
                // return checklist after change
                return {
                    ...cl,
                    content: new_checklist_text
                };
            } else {
                // return whjat's unchagne
                return cl;
            }
        });

        setChecklists(updated);
        setEditingId(null);
        setEditValue("");
        await setDoc(doc(firebase_db, "moodboards", board.board_id), { ...board, checklists: updated });
    };


    //  new checklist
    const addNewCheckList = async () => {


        const new_checklist_text = newChecklistText.trim();


        if (!new_checklist_text) {
            return alert("Checklist cannot be empty!");
        }



        if (checklists.some(cl => cl.content === new_checklist_text)) {
            return alert("Checklist already exists!");
        }

        const newCheckList = { check_id: `check_${Date.now()}`, content: new_checklist_text, checked: "unchecked" };
        const updatedCheckList = [...checklists, newCheckList];
        setChecklists(updatedCheckList);
        setChecklistModalOpen(false);
        setNewChecklistText("");
        await setDoc(doc(firebase_db, "moodboards", board.board_id), { ...board, checklists: updatedCheckList });
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' }
                }}
                variant="permanent"
                anchor="right"
            >
                <Toolbar className='drawer-top'>
                    <Typography>Checklist</Typography>
                    <Button variant="contained" onClick={() => setChecklistModalOpen(true)} className="modal-pos-btn">New</Button>
                </Toolbar>
                <Divider />
                <List>
                    {checklists.map(cl => (
                        <ListItem key={cl.check_id}>
                            <Checkbox checked={cl.checked === "checked"} onChange={() => checkingCheckBox(cl.check_id)} className='main-color-2' />
                            {editingId === cl.check_id ? (
                                <TextField
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={doneEditChecklist}
                                    autoFocus
                                    variant="standard"
                                    fullWidth
                                />
                            ) : (
                                <ListItemText
                                    primary={cl.content}
                                    onDoubleClick={() => editCheckList(cl)}
                                />
                            )}
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Modal for new checklist */}
            <Dialog open={checklistModalOpen} onClose={() => setChecklistModalOpen(false)}>
                <DialogTitle>New Checklist</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Checklist Content"
                        fullWidth
                        variant="standard"
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setChecklistModalOpen(false)}>Cancel</Button>
                    <Button onClick={addNewCheckList} variant="contained" className='modal-pos-btn'>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

