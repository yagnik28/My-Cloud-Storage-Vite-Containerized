import { Box, Button, Checkbox, Input, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { UserButton, useUser } from "@clerk/clerk-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const axiosInstance = axios.create({
  baseURL: SERVER_URL
});

function Dashboard() {
  const [files, setFiles] = useState(null);
  const [fileCaption, setFileCaption] = useState('');
  const [resultOfUpDelDown, setResultOfUpDelDown] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [fileGetting, setFileGetting] = useState(false);
  const [isCheckedFiles, setIsCheckedFiles] = useState({});
  const [resultOfFileDelete, setResultOfFileDelete] = useState([]);
  const [deleteFiles, setDeleteFiles] = useState([]);
  const [fileDeleting, setFileDeleting] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileDownloading, setFileDownloading] = useState(false);
  const { user } = useUser();
  const email = user.primaryEmailAddress.emailAddress;

  useEffect(() => { // Getting all the files.
      const getAllFiles = async () => {
          setFileGetting(true);
          try {
            const config = { headers: { 'email': email }};  
            const res = await axiosInstance.get("/allFiles", config);
            setAllFiles(res.data); // getting all files
            } catch (error) {
            console.error(error.response.data);
            }
            finally {
            setFileGetting(false);
            }
      };
      getAllFiles();
  }, [resultOfUpDelDown, resultOfFileDelete]);

  useEffect(() => { 
      const handleKeyDownDelete = (e) => { // Keyboard Delete Button Handler.
          if(e.key !== "Delete") return;
          // e.preventDefault();
          handleFileDelete(deleteFiles);
      };
      document.addEventListener("keydown", handleKeyDownDelete);
      return () => {
          document.removeEventListener("keydown", handleKeyDownDelete);
      };
  }, [deleteFiles]);

  const handleFileDelete = async (filesToDelete) => {
      if(filesToDelete.length === 0) {
          setAllChecked(false);
          alert("Please select atleast one file to delete.");
          return;
      }
      const message = (filesToDelete.length === 1 
        ? `Are you sure want to delete the file "${filesToDelete[0].name}" ?`
        : `Are you sure want to delete the all selected files ?`);
      if(!window.confirm(message)) return;
      setFileDeleting(true);
      try {
          const config = { headers: { 'email': email }};
          for (const file of filesToDelete) {
              const res = await axiosInstance.delete(`/file/delete/:${file._id}`, config);
          };
          setResultOfFileDelete(filesToDelete); // keeping it unique so that changed values assigned to resultOfFileDelete and useEffect runs and getting all the files again.
          setResultOfUpDelDown("Files Deleted Successfully"); 
      } catch (error) {
          setResultOfFileDelete("Failed to delete files");
          setResultOfUpDelDown("Failed to delete files");
          console.error(error.response.data);
      }
      finally {
          setIsCheckedFiles({}); // removing list of all the selected checkbox files.
          setDeleteFiles([]); // removing list of all the files to be deleted.
          setAllChecked(false); // unchecking all the checkbox including main checkbox.
          setFileDeleting(false); // removing flag of file deleting.
      }
  };

const handleFileDownload = async (file) => {
  setFileDownloading(true);
  try {
    const config = { headers: { 'email': email }};
    const res = await axiosInstance.get(`/file/download/:${file._id}`, config);
    const { bufferResponse, contentType } = res.data;
    const uint8Array = new Uint8Array(bufferResponse.data);
    const blob = new Blob([uint8Array], { type: contentType }); 
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.name);
    link.click();
    link.remove();  // Alternative of link.remove() => window.URL.revokeObjectURL(url);
    setResultOfUpDelDown("File Downloaded Successfully");
  } catch (error) {
    setResultOfUpDelDown("Failed to download file. Refresh and try again");
    console.error(error.resonse.data);
  } finally{
    setFileDownloading(false);
  }
};

const handleFileChoose = (e) => {
  setFiles(e.target.files);
};

const handleFileCaption = (e) => {
  setFileCaption(e.target.value);
};

const handleFileCheckbox = async (file) => {
  setIsCheckedFiles((prevIsCheckedFiles) => {
    const newIsCheckedFiles = {...prevIsCheckedFiles, [file._id]: !prevIsCheckedFiles[file._id]};
    const newDeleteFiles = newIsCheckedFiles[file._id] ? [...deleteFiles, file] : deleteFiles.filter((deleteFile) => deleteFile._id !== file._id);
    setDeleteFiles(newDeleteFiles);
    setAllChecked(newDeleteFiles.length === allFiles.length);
    return newIsCheckedFiles;
  });
};

const handleAllFileCheckbox = async () => {
  const newAllChecked = !allChecked;
  const newIsCheckedFiles = {};
  const newDeleteFiles = newAllChecked ? [...allFiles] : [];
  for(const file of allFiles) newIsCheckedFiles[file._id] = newAllChecked;
  setIsCheckedFiles(newIsCheckedFiles);
  setDeleteFiles(newDeleteFiles);
  setAllChecked(newAllChecked);
};

const handleFileUpload = async () => {
  if(!files) {
    alert("Please select atleast one file to upload.");
    return;
  }
  setFileUploading(true);
  setResultOfUpDelDown('');
  setUploadProgress(0);
  let res = '';
  try {
    for (const file of files) {
      const filename = file.name.split('.')[0];
      const filetype = file.name.split('.')[1].toLowerCase();
      const config = {
        headers: {
            'content-type': `${filename}/${filetype}`,
            'content-disposition': `attachment; filename=\"${filename}.${filetype}\"`,
            'image-caption': fileCaption,
            'email': email
          },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };
      res = await axiosInstance.post('/file/upload', file, config);
    }
    setResultOfUpDelDown(res.data.message);
  } catch (error) {
    setResultOfUpDelDown(error.response.data.message);
    console.error(error.response.data.message);
  }
  finally {
    setFileUploading(false);
    setUploadProgress(0);
    setFileCaption('');
  }
};

  return ( 
      <>
        <UserButton/>
        <div style={{marginTop: "25px", textAlign: "center"}}>
            { fileDeleting && 
              <Typography variant="h4" fontWeight="bold" style={{ marginBottom: "50px", display: "flex", justifyContent: "center"}}> 
                Deleting Selected Files... 
              </Typography> 
            }
            { fileDownloading && 
              <Typography variant="h4" fontWeight="bold" style={{ marginBottom: "50px", display: "flex", justifyContent: "center"}}> 
                Downloading... 
              </Typography> 
            }
            
            <Box style={{display: "flex", justifyContent: "center"}}>
              <Input type="file" onChange={handleFileChoose} inputProps={{multiple: true}} disableUnderline/>
              <TextField variant="outlined" value={fileCaption} label="Caption" onChange={handleFileCaption}/>
            </Box>
            <br />
            <br />
            <div>
              { fileUploading
                  ? (<>
                      <h3> Uploading... </h3>
                      <h3> {uploadProgress} % </h3>
                      <LinearProgress variant="determinate" value={uploadProgress} style={{width: "25%", margin: "auto"}}/> 
                    </>)  
                  : <Button variant="contained" onClick={handleFileUpload}> Upload </Button>
              }
              <br />
              <br />
              <Typography variant="h6">
                { resultOfUpDelDown && resultOfUpDelDown }
              </Typography>
            </div>
        </div>
        
        { fileGetting 
          ? <Typography variant="h4" fontWeight="bold" style={{ marginTop: "150px", display: "flex", justifyContent: "center"}}> 
              Loading Files..... 
            </Typography>
          : <>
              <br />
              <Typography variant="h4" fontWeight="bold" style={{ display: "flex", justifyContent: "center"}}> 
                Your All Files 
              </Typography>
            </>
        }
        { allFiles.length > 0 &&  
            <TableContainer>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell width="12%">
                    Select File
                    <br/>
                    <Checkbox onClick={() => handleAllFileCheckbox()} checked={allChecked} />
                    <br/>
                    <Button variant="outlined" onClick={() => handleFileDelete(deleteFiles)}> Delete </Button>
                    </TableCell>
                    <TableCell width="12%"> Name </TableCell>
                    <TableCell width="20%"> Caption </TableCell>
                    <TableCell width="8%"> Size </TableCell>
                    <TableCell width="8%"> File Type </TableCell>
                    <TableCell width="10%"> Upload Date </TableCell>
                    <TableCell width="10%"> Upload Time </TableCell>
                    <TableCell width="10%"> Delete File </TableCell>
                    <TableCell width="10%"> Download File </TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {allFiles.map((file) => (
                    <TableRow key={file._id} selected={!!isCheckedFiles[file._id]} hover>
                    <TableCell onClick={() => handleFileCheckbox(file)} >
                        <Checkbox checked={!!isCheckedFiles[file._id]}/> {/* Handles undefined value too. */} 
                    </TableCell>
                    <TableCell onClick={() => handleFileCheckbox(file)} >{file.name}</TableCell>
                    <TableCell onClick={() => handleFileCheckbox(file)} >{file.caption}</TableCell>
                    <TableCell onClick={() => handleFileCheckbox(file)} >{file.size}</TableCell>
                    <TableCell onClick={() => handleFileCheckbox(file)} >{file.fileType}</TableCell>
                    <TableCell onClick={() => handleFileCheckbox(file)} >{file.uploadDate}</TableCell>
                    <TableCell onClick={() => handleFileCheckbox(file)} >{file.uploadTime}</TableCell>
                    <TableCell> 
                        <Button variant="outlined" onClick={() => handleFileDelete([file])}> Delete </Button> 
                    </TableCell>
                    <TableCell>  
                        <Button variant="outlined" onClick={() => handleFileDownload(file)}> Download </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
        }
      </>
  )
};

export default Dashboard;