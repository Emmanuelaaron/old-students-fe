import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { apiBlobUrl } from "@/redux/apiClient";

export function ProofOfPaymentButton({
  proofUrl,
  label = "View proof",
}: {
  proofUrl?: string | null;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !proofUrl) return;

    let active = true;
    let objectUrl: string | null = null;

    (async () => {
      setLoading(true);
      setError("");
      try {
        objectUrl = await apiBlobUrl(proofUrl);
        if (active) setSrc(objectUrl);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Could not load proof");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, proofUrl]);

  if (!proofUrl) return null;

  return (
    <>
      <Button size="small" variant="outlined" startIcon={<ImageIcon />} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Proof of payment</DialogTitle>
        <DialogContent>
          {loading && (
            <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
              <CircularProgress color="secondary" />
            </Box>
          )}
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          {src && !loading && (
            <Box
              component="img"
              src={src}
              alt="Proof of payment"
              sx={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 1,
                bgcolor: "background.default",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
