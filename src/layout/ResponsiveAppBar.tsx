import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { backgroundColorDefault, headerBgColor, appTextColor } from './Colors';
import PortalIcon from './PortalIcon';

function ResponsiveAppBar(props: { appName: string }) {
    const { appName } = props;


    return (
        <AppBar position="sticky" style={{ background: headerBgColor }}>
            <span style={{ color: "red", textAlign: "right", background: backgroundColorDefault, padding: 0 }}>This is a preliminary demo and should not be used for analysis</span>
            <Box sx={{ marginLeft: 2, p: 1, paddingTop: 0 }}>
                <Toolbar disableGutters>
                    <PortalIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href={"/blues-metocean-portal"}
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        {appName}
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        <Button
                            sx={{ my: 2, color: appTextColor, display: 'block' }}
                        >
                            <Link to={{ pathname: "/datasets" }}>Datasets</Link>
                        </Button>
                        <Button
                            sx={{ my: 2, color: appTextColor, display: 'block' }}
                        >
                            <Link to={{ pathname: "/postprocessing" }}>Post processing</Link>
                        </Button>
                    </Box>
                </Toolbar>
            </Box>
        </AppBar>
    );
}
export default ResponsiveAppBar;