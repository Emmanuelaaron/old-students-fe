import { Box, Button, Paper, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { Member } from "@/redux";
import { fmtDate } from "@/app/utils/format";

export function PendingPage({ user, onLogout }: { user: Member; onLogout: () => void }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "grid", placeItems: "center", p: 2 }}>
      <Paper elevation={3} sx={{ maxWidth: 440, width: "100%", p: 4, textAlign: "center" }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "warning.light",
            color: "warning.dark",
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <AccessTimeIcon fontSize="large" />
        </Box>
        <Typography variant="h5" gutterBottom>
          Awaiting Approval
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          A welcome email has been sent to your inbox. The administrator will review your
          membership — you will get another email when you are approved and ready to use the system.
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, textAlign: "left", bgcolor: "background.default", mb: 3 }}>
          <Typography fontWeight={700}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {user.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Registered {fmtDate(user.joinedAt)}
          </Typography>
        </Paper>
        <Button color="secondary" onClick={onLogout}>
          Return to Home
        </Button>
      </Paper>
    </Box>
  );
}
