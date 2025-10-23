import { NavigationDrawer } from './navbar'
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import images_list from './images.json';
import Toolbar from '@mui/material/Toolbar';
import Masonry from '@mui/lab/Masonry';
import { Link } from 'react-router-dom';
import { shuffledImages } from './util';
import Divider from '@mui/material/Divider';





export function ImageView() {
    return <Box>
        {NavigationDrawer(ImageViewContent)}
    </Box>
}

function ImageViewContent() {

    const { image_id } = useParams(); // take image_id from parameter --> "1"
    const key = Number(image_id) // convert "1" to number type
    const image_name = Object.values(images_list[key - 1])[0]
    // key-1 is just minor mismatching cuz my images.json start with "1"
    // console.log(image_name)

    const imgs = shuffledImages;

    return (
        <Box>
            <Toolbar></Toolbar>
            <div class="image-view-main-div">
                <img 
                    srcSet={`/images/${image_name}?w=162&auto=format&dpr=2 2x`}
                    src={`/images/${image_name}?w=162&auto=format`}
                    className="image-view-main"
                    alt={image_name}
                >
                </img>
            </div>


            <Divider></Divider>
            <Toolbar></Toolbar>
            <h1> More like this</h1>
            <Masonry columns={5} spacing={2}>
                {imgs.map((item) => (
                    <div>
                        <Link to={`/img/${Object.keys(item)}`}>
                            <img
                                srcSet={`/images/${Object.values(item)[0]}?w=162&auto=format&dpr=2 2x`}
                                src={`/images/${Object.values(item)[0]}?w=162&auto=format`}
                                className="masonry-image"
                            >
                            </img>
                        </Link>

                    </div>
                ))}
            </Masonry>
        </Box>

    )
}