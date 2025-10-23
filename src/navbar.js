import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link } from 'react-router-dom';


function insertContentAfterNav(PageContent) {
    return (
        <Box>
            <PageContent />
        </Box>
    )
}

export function NavigationDrawer(page_content) {
    return (
        <Box sx={{ display: 'flex' }}>

            <Drawer
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', },
                }} 
                variant="permanent"anchor="left" >
                <List>
                    {/* home page */}
                    <ListItem disablePadding>
                        <Link to="/" className="nav-menu">
                            <ListItemButton>
                                <ListItemIcon>
                                    <SearchIcon className='myapp-icon'>
                                    </SearchIcon>
                                </ListItemIcon>
                                <ListItemText>Browse Image</ListItemText>
                            </ListItemButton>
                        </Link>
                    </ListItem>

                    {/* Your board */}
                    <ListItem disablePadding>
                        <Link to="/boards" className="nav-menu">
                            <ListItemButton>
                                <ListItemIcon>
                                    <DashboardIcon className='myapp-icon'>
                                    </DashboardIcon>
                                </ListItemIcon>
                                <ListItemText>Your boards</ListItemText>
                            </ListItemButton></Link>
                    </ListItem>

                </List>

                <Divider />

            </Drawer>


            {/* insertContentAfterNav(page_content) */}
            {insertContentAfterNav(page_content)}
            {/* so that main content is not hidden behind the nav */}
        </Box>
    );
}

