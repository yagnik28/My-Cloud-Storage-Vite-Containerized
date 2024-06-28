import { SignInButton } from "@clerk/clerk-react";
import { Button, Box, Typography } from "@mui/material";
function HomePage() {
    return (
        <div style={{ backgroundColor: "#edeff2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box style={{ backgroundColor: "#fff", width: 500, display: "flex", boxShadow: "4px 4px 4px 4px rgb(0 0 0/0.2)", borderRadius: "4px"}}>
                <Box>
                    <Box style={{ backgroundColor: "#1976d2", color: "#fff", padding: "20px", borderRadius: "4px" }}>
                        <Typography fontWeight="Bold" fontSize={30}> Welcome to My Cloud Storage </Typography>
                    </Box>
                    
                    <Box style={{ marginTop: "20px", padding: "0 20px 0 20px" }}>
                        <Typography variant="body1"> 
                            My Cloud Storage is a cloud storage service that allows users to store and manage files on cloud platform.
                            <br /> 
                            User can store the files of type images, audio, videos, documents, etc...    
                        </Typography>
                        <br />
                        <Typography variant="body1">
                            Click on this Sign in button to get your space.
                        </Typography>
                    </Box>
    
                    <Box style={{ display: "flex", flex: 1, flexDirection: "column", margin: "20px 0 20px 0", padding: "0 20px 0 20px" }}>
                        <SignInButton>
                            <Button variant="contianed" style={{ backgroundColor: "#1976d2", color: "#fff", height: "50px", borderRadius: "4px" }}>
                                Sign In
                            </Button>
                        </SignInButton>
                    </Box>
                </Box>
            </Box>
        </div>
    )
};

export default HomePage;