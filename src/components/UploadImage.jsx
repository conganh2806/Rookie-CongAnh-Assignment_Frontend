import { Box, Button, Typography } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from "react";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadImage = ({ onFileChange, initialImage = null }) => {
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (initialImage) {
      setPreviewImage(initialImage);
    }
  }, [initialImage]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile); // callback send file
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(imageUrl);
    }
  };

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>
        Upload Image
      </Typography>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        Upload Image
        <VisuallyHiddenInput
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </Button>

      {previewImage && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>Preview:</Typography>
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: '300px',
              maxHeight: '300px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #ccc',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default UploadImage;
