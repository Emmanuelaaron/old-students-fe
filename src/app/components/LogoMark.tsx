import { Avatar, Box } from "@mui/material";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImage from "@/imports/image.png";

export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: "common.white",
        border: "2px solid",
        borderColor: "secondary.main",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "90%",
          height: "90%",
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageWithFallback
          src={logoImage}
          alt="HCLV Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            borderRadius: "50%",
          }}
        />
      </Box>
    </Avatar>
  );
}
